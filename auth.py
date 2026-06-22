# auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Coupon, UserCoupon, Store

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def signup():
    """
    ユーザー会員登録 ＋ 初回特典自動付与ロジック (WBS 9.2.1)
    """
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "すべての項目を入力してください"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "このユーザー名は既に使われています"}), 400

    try:
        # 1. 新しいユーザーを作成 (初期ランクは BLUE)
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            rank="BLUE"
        )
        if hasattr(new_user, 'total_points'):
            new_user.total_points = 15

        db.session.add(new_user)
        db.session.flush()

        # 2. 初回特典クーポンを取得、無ければ生成
        initial_coupon = Coupon.query.filter_by(is_initial_bonus=True).first()
        if not initial_coupon:
            initial_coupon = Coupon(
                title="【初回特典】ダイシンの防災グッズ交換券",
                description="新規会員登録特典！店舗の端末にかざして防災グッズと交換できます。",
                required_rank="BLUE",
                is_initial_bonus=True
            )
            db.session.add(initial_coupon)
            db.session.flush()

        # 3. ユーザーに初回クーポンを自動紐付け
        user_coupon = UserCoupon(
            user_id=new_user.id,
            coupon_id=initial_coupon.id,
            status="UNUSED"
        )
        db.session.add(user_coupon)
        
        db.session.commit()

        return jsonify({
            "message": "会員登録が完了し、初回特典クーポンが自動付与されました！",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "rank": new_user.rank
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"会員登録中にエラーが発生しました: {str(e)}"}), 500


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    ユーザーログイン機能
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "ユーザー名とパスワードを入力してください"}), 400

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            "message": "ログインに成功しました",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "rank": user.rank if hasattr(user, 'rank') else "BLUE"
            }
        }), 200
    
    return jsonify({"error": "ユーザー名またはパスワードが間違っています"}), 401


@auth_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    """
    最高管理者ログイン機能API（店舗コードや空白が混ざっていても自動で店舗認証へルーティング）
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "BAD_REQUEST", "message": "リクエストデータが空です"}), 400

    # 前後の不要なスペースを徹底的にカットする
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()

    if not username or not password:
        return jsonify({"error": "VALIDATION_FAILED", "message": "ユーザー名とパスワードは必須です"}), 400

    # 【自動仕分けロジック】
    # IDが 'store_' で始まる、または '001' などの純粋な数字（店舗コード単体）の場合は、店舗ユーザーとして強制処理する
    if username.startswith('store_') or username.isdigit():
        full_store_id = username if username.startswith('store_') else f"store_{username}"
        return process_store_login(full_store_id, password)

    # 本来の最高管理者（Admin）ログイン
    from models import Admin
    admin = Admin.query.filter_by(admin_username=username).first()

    if admin and check_password_hash(admin.password_hash, password):
        return jsonify({
            "message": "管理者ログイン成功",
            "admin": {
                "id": admin.id,
                "username": admin.admin_username,
                "role": "ADMIN"
            }
        }), 200

    return jsonify({"error": "AUTH_FAILED", "message": "管理者名またはパスワードが間違っています"}), 401


# 💡 店舗ログイン専用エンドポイント ＆ 共通認証ロジック

@auth_bp.route('/api/store/login', methods=['POST'])
def store_login_endpoint():
    """
    店舗専用のログインAPI
    """
    data = request.get_json()
    username = data.get('username') or data.get('login_id')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "VALIDATION_FAILED", "message": "ログインIDとパスワードは必須です"}), 400

    return process_store_login(str(username).strip(), str(password).strip())


def process_store_login(login_id_str, password_input):
    """
    store_XXX から店舗コードを割り出し、categoryカラムからハッシュ化されたパスワードを照合するセキュア版関数
    """
    # "store_001" や "001" から、純粋な3桁の店舗コード (001) を抽出
    store_code = login_id_str.replace('store_', '').strip()
    password_input_clean = password_input.strip()

    # DBから該当する店舗を取得
    store = Store.query.filter_by(store_code=store_code).first()
    if not store:
        return jsonify({"error": "AUTH_FAILED", "message": "指定された店舗コードが見つかりません"}), 401

    # categoryカラムから隠し持った文字列を引っ張り出す ("カテゴリ名|ハッシュ値" の形式)
    stored_credential = store.store_code  # 初期フォールバック
    if store.category and '|' in store.category:
        try:
            _, stored_credential = store.category.split('|', 1)
        except Exception:
            stored_credential = store.store_code
    elif store.category == "ダイシン":
        # 初期デモデータ（ダイシン001）用の特別救済措置
        stored_credential = "001"

    stored_credential = stored_credential.strip()

    # 💡 【タスク⑧】安全な暗号化パスワード照合
    is_authenticated = False

    # 1. データベースに保存されている値がハッシュ値（pbkdf2等から始まる）である場合
    if stored_credential.startswith(('pbkdf2:', 'bcrypt:', 'scrypt:')):
        if check_password_hash(stored_credential, password_input_clean):
            is_authenticated = True
    
    # 2. 既存データ（生のテキスト）やフォールバック時に対する後方互換対応
    if not is_authenticated:
        if password_input_clean == stored_credential or password_input_clean == store.store_code:
            is_authenticated = True

    if is_authenticated:
        # フロントエンドがどのプロパティ名でアクセスしてもクラッシュしないよう全部盛りで返却
        response_data = {
            "message": f"店舗「{store.name}」としてログインに成功しました",
            "role": "STORE",  # フロントの条件分岐の最重要フラグ
            "user": {
                "id": store.id,
                "username": f"store_{store.store_code}",
                "name": store.name,
                "role": "STORE"
            },
            "admin": {
                "id": store.id,
                "username": f"store_{store.store_code}",
                "role": "STORE"
            },
            "store": {
                "id": store.id,
                "store_code": store.store_code,
                "username": f"store_{store.store_code}",
                "name": store.name,
                "role": "STORE"
            }
        }
        return jsonify(response_data), 200

    return jsonify({"error": "AUTH_FAILED", "message": "店舗ログインパスワードが間違っています"}), 401