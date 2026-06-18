# auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Coupon, UserCoupon

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

# --- ここから auth.py の末尾に追記 ---

@auth_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    """
    【ステップ5】管理者ログイン機能API
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "BAD_REQUEST", "message": "リクエストデータが空です"}), 400

    username = data.get('username')
    password = data.get('password')

    # バリデーション
    if not username or not password:
        return jsonify({"error": "VALIDATION_FAILED", "message": "ユーザー名とパスワードは必須です"}), 400

    # 管理者テーブル（Admin）から検索
    from models import Admin
    admin = Admin.query.filter_by(admin_username=username).first()

    # ユーザーが存在し、パスワードのハッシュが一致するか検証
    if admin and check_password_hash(admin.password_hash, password):
        # ログイン成功時のレスポンス
        return jsonify({
            "message": "管理者ログイン成功",
            "admin": {
                "id": admin.id,
                "username": admin.admin_username,
                "role": "ADMIN"
            }
        }), 200

    # 認証失敗
    return jsonify({"error": "AUTH_FAILED", "message": "管理者名またはパスワードが間違っています"}), 401