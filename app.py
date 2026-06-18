import os
import random
import string
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# React(通常5173ポート)とのCookie・セッション連携を有効にします
CORS(app, supports_credentials=True)

# セッションの暗号化キー
app.config['SECRET_KEY'] = 'dev-secret-key-f-team'

# SQLiteデータベースの設定
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# データベースオブジェクトの初期化
db = SQLAlchemy(app)

# ------------------------------------------------------------------
# 【データ層】データベースのモデル定義
# ------------------------------------------------------------------

# 1. ユーザー（会員）モデル
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False) # 会員ID
    password_hash = db.Column(db.String(120), nullable=False)        # ハッシュ化パスワード
    email = db.Column(db.String(120), unique=True, nullable=False)    # メールアドレス
    
    # 会員ランク制度（BLUE, BRONZE, SILVER, GOLD）
    rank = db.Column(db.String(20), nullable=False, default='BLUE')
    points = db.Column(db.Integer, default=0)                        # 保有ポイント
    created_at = db.Column(db.String(20), nullable=False, default='2026/06/18')
    
    # 資料4（61ページ）のポイント内訳項目（銀行取引実績）
    login_points = db.Column(db.Integer, default=0)       # アプリログイン
    credit_points = db.Column(db.Integer, default=0)      # クレカ
    salary_points = db.Column(db.Integer, default=0)      # 給与振込
    loan_points = db.Column(db.Integer, default=0)        # 住宅ローン

    # リレーション（ユーザーが持つクーポン履歴）
    user_coupons = db.relationship('UserCoupon', backref='user', lazy=True)


# 2. 店舗モデル
class Store(db.Model):
    __tablename__ = 'stores'
    
    id = db.Column(db.Integer, primary_key=True)
    store_name = db.Column(db.String(100), nullable=False)          # 店舗名
    store_code = db.Column(db.String(20), unique=True, nullable=False) # 店舗コード


# 3. クーポンマスタ
class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)               # クーポン名
    description = db.Column(db.Text, nullable=True)                 # 内容・注意事項
    discount_info = db.Column(db.String(100), nullable=True)        # 割引内容等


# 4. ユーザー所持クーポン・利用履歴モデル
class UserCoupon(db.Model):
    __tablename__ = 'user_coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=False)
    
    # ステータス管理（'unused' (利用可能), 'used' (使用済)）
    status = db.Column(db.String(20), nullable=False, default='unused')
    used_at = db.Column(db.String(20), nullable=True)               # 利用日時
    used_store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=True) # 利用店舗

    # リレーション設定
    coupon = db.relationship('Coupon')
    store = db.relationship('Store')


# データベース初期化と、テスト用初期データの自動挿入
with app.app_context():
    db.create_all()
    
    # 初期クーポン（スターターパック用）を自動作成
    if not Coupon.query.filter_by(title="初回特典スタータークーポン").first():
        sample_coupon = Coupon(title="初回特典スタータークーポン", description="全品10%OFF", discount_info="10%OFF")
        db.session.add(sample_coupon)
    
    # テスト用の店舗コード（例: PUKUPUKU）を自動作成
    if not Store.query.filter_by(store_code="PUKUPUKU").first():
        sample_store = Store(store_name="シーシャカフェ PukuPuku", store_code="PUKUPUKU")
        db.session.add(sample_store)
        
    db.session.commit()


# ------------------------------------------------------------------
# 【アプリケーション層】認証・認可チェック（デコレータ）
# ------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "ログインが必要です。ログイン画面からアクセスしてください。"}), 401
        
        current_user = User.query.get(session['user_id'])
        if not current_user:
            return jsonify({"error": "ユーザーが存在しません。"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated_function


# ------------------------------------------------------------------
# 【主要機能API】ユーザー認証・登録・マイページ系
# ------------------------------------------------------------------

# 1. 会員登録（資料3：アカウント登録 ＆ スターターパック自動付与）
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'password', 'email')):
        return jsonify({"error": "入力値が不足しています。"}), 400
        
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "すでに存在する会員IDです。"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "すでに登録されているメールアドレスです。"}), 400
        
    hashed_pw = generate_password_hash(data['password'])
    
    new_user = User(
        username=data['username'],
        password_hash=hashed_pw,
        email=data['email'],
        rank='BLUE',
        points=15  # 初期テスト用に15ポイントを持たせる（資料4準拠）
    )
    
    db.session.add(new_user)
    db.session.flush()
    
    starter_coupon = Coupon.query.filter_by(title="初回特典スタータークーポン").first()
    if starter_coupon:
        user_coupon = UserCoupon(user_id=new_user.id, coupon_id=starter_coupon.id, status='unused')
        db.session.add(user_coupon)
        
    db.session.commit()
    return jsonify({"message": "会員登録および初回特典の付与が完了しました。", "user_id": new_user.id}), 201


# 2. ユーザーログイン
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "IDとパスワードを入力してください。"}), 400
        
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "会員IDまたはパスワードが正しくありません。"}), 401
        
    session['user_id'] = user.id
    return jsonify({
        "message": "ログインに成功しました。",
        "user": {"id": user.id, "username": user.username, "rank": user.rank}
    }), 200


# 3. マイページ情報取得
@app.route('/api/user/mypage', methods=['GET'])
@login_required
def mypage(current_user):
    return jsonify({
        "username": current_user.username,
        "email": current_user.email,
        "rank": current_user.rank,
        "points": current_user.points,
        "created_at": current_user.created_at,
        "points_detail": {
            "login": current_user.login_points,
            "credit": current_user.credit_points,
            "salary": current_user.salary_points,
            "loan": current_user.loan_points
        }
    }), 200


# 4. ログアウト
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "ログアウトしました。"}), 200


# ------------------------------------------------------------------
# 【主要機能API】ユーザー向け：クーポン関連
# ------------------------------------------------------------------

# 5. 利用可能なクーポン一覧取得
@app.route('/api/user/coupons', methods=['GET'])
@login_required
def get_user_coupons(current_user):
    unused_coupons = UserCoupon.query.filter_by(user_id=current_user.id, status='unused').all()
    result = []
    for uc in unused_coupons:
        result.append({
            "user_coupon_id": uc.id,
            "coupon_id": uc.coupon.id,
            "title": uc.coupon.title,
            "description": uc.coupon.description,
            "discount_info": uc.coupon.discount_info
        })
    return jsonify(result), 200


# 6. クーポン消込処理
@app.route('/api/user/coupons/use', methods=['POST'])
@login_required
def use_coupon(current_user):
    data = request.get_json()
    if not data or not all(k in data for k in ('user_coupon_id', 'store_code')):
        return jsonify({"error": "クーポンIDまたは店舗コードが不足しています。"}), 400
        
    user_coupon = UserCoupon.query.filter_by(id=data['user_coupon_id'], user_id=current_user.id).first()
    if not user_coupon:
        return jsonify({"error": "指定されたクーポンが見つかりません。"}), 404
        
    if user_coupon.status == 'used':
        return jsonify({"error": "このクーポンは既に使用されています。"}), 400
        
    store = Store.query.filter_by(store_code=data['store_code']).first()
    if not store:
        return jsonify({"error": "店舗コードが正しくありません。もう一度ご確認ください。"}), 400
        
    user_coupon.status = 'used'
    user_coupon.used_at = '2026/06/18 11:36'
    user_coupon.used_store_id = store.id
    
    db.session.commit()
    return jsonify({"status": "success", "message": f"「{store.store_name}」にてクーポンの利用が完了しました。"}), 200


# 7. クーポン利用履歴の取得
@app.route('/api/user/coupons/history', methods=['GET'])
@login_required
def get_coupon_history(current_user):
    used_coupons = UserCoupon.query.filter_by(user_id=current_user.id, status='used').all()
    result = []
    for uc in used_coupons:
        result.append({
            "user_coupon_id": uc.id,
            "title": uc.coupon.title,
            "used_at": uc.used_at,
            "store_name": uc.store.store_name if uc.store else "直営店舗"
        })
    return jsonify(result), 200


# ------------------------------------------------------------------
# 【新機能追加】管理者向けAPI（管理者画面との通信用）
# ------------------------------------------------------------------

# 8. 管理者ログイン（簡易セッション認証）
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    # テスト用固定管理者アカウント
    if data and data.get('username') == 'admin' and data.get('password') == 'admin123':
        session['admin_logged_in'] = True
        return jsonify({"message": "管理者としてログインしました。"}), 200
    return jsonify({"error": "管理者IDまたはパスワードが不正です。"}), 401


# 9. 店舗の新規登録（店舗コード自動生成・重複チェック）
@app.route('/api/admin/stores', methods=['POST'])
def admin_add_store():
    data = request.get_json()
    if not data or 'store_name' not in data:
        return jsonify({"error": "店舗名を入力してください。"}), 400
        
    # 🔥 ビジネスロジック：店舗コードの自動生成（英大文字6桁）と重複チェック
    while True:
        generated_code = ''.join(random.choices(string.ascii_uppercase, k=6))
        if not Store.query.filter_by(store_code=generated_code).first():
            break
            
    new_store = Store(store_name=data['store_name'], store_code=generated_code)
    db.session.add(new_store)
    db.session.commit()
    
    return jsonify({
        "message": "店舗を新規登録しました。",
        "store": {"id": new_store.id, "store_name": new_store.store_name, "store_code": new_store.store_code}
    }), 201


# 10. クーポン新規作成 ＆ 全会員への一括配布処理
@app.route('/api/admin/coupons/broadcast', methods=['POST'])
def admin_create_and_broadcast_coupon():
    data = request.get_json()
    if not data or not all(k in data for k in ('title', 'description', 'discount_info')):
        return jsonify({"error": "内容が不足しています。"}), 400
        
    # クーポンマスタへの登録
    new_coupon = Coupon(title=data['title'], description=data['description'], discount_info=data['discount_info'])
    db.session.add(new_coupon)
    db.session.flush() # IDを確定
    
    # 🔥 ビジネスロジック：全ユーザーへ一括配布処理
    all_users = User.query.all()
    distribute_count = 0
    for u in all_users:
        user_coupon = UserCoupon(user_id=u.id, coupon_id=new_coupon.id, status='unused')
        db.session.add(user_coupon)
        distribute_count += 1
        
    db.session.commit()
    return jsonify({"message": f"クーポン「{new_coupon.title}」を作成し、{distribute_count}名の会員へ一括配布しました。"}), 201


# 11. 会員情報一覧取得（管理者用分析画面）
@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    users = User.query.all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "rank": u.rank,
            "points": u.points,
            "details": {"login": u.login_points, "credit": u.credit_points, "salary": u.salary_points, "loan": u.loan_points}
        })
    return jsonify(result), 200


# 12. Excel/CSV取込のシミュレーション（実績データ反映 ＆ ランク判定ロジック）
@app.route('/api/admin/upload-records', methods=['POST'])
def admin_upload_records():
    data = request.get_json() # 配列形式でユーザー毎の実績データを受け取る想定
    if not data or 'records' not in data:
        return jsonify({"error": "実績データが見つかりません。"}), 400
        
    updated_users = 0
    for record in data['records']:
        user = User.query.filter_by(username=record.get('username')).first()
        if user:
            # 内訳データの反映
            user.login_points = record.get('login_points', user.login_points)
            user.credit_points = record.get('credit_points', user.credit_points)
            user.salary_points = record.get('salary_points', user.salary_points)
            user.loan_points = record.get('loan_points', user.loan_points)
            
            # 総ポイントの計算
            user.points = user.login_points + user.credit_points + user.salary_points + user.loan_points
            
            # 🔥 コアビジネスロジック：資料2に基づくランク判定
            if user.points >= 100:
                user.rank = 'GOLD'
            elif user.points >= 50:
                user.rank = 'SILVER'
            elif user.points >= 20:
                user.rank = 'BRONZE'
            else:
                user.rank = 'BLUE'
                
            updated_users += 1
            
    db.session.commit()
    return jsonify({"message": f"{updated_users}名の会員実績を更新し、ランクの再判定を行いました。"}), 200


# ------------------------------------------------------------------
# 基盤疎通確認用
# ------------------------------------------------------------------
@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from F-Team Complete Flask Server!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)