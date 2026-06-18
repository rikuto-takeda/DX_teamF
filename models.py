from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

# ------------------------------------------------------------------
# 【モデル定義】
# ------------------------------------------------------------------

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    rank = db.Column(db.String(20), default='BLUE')         # BLUE, BRONZE, SILVER, GOLD
    total_points = db.Column(db.Integer, default=0)         # 判定用累計ポイント

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    admin_username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), default='STAFF')         # SUPERADMIN, STAFF

class Store(db.Model):
    __tablename__ = 'stores'
    id = db.Column(db.Integer, primary_key=True)
    store_code = db.Column(db.String(50), unique=True, nullable=False) # 店舗識別コード
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))                      # ダイシン、シシャなど

class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    discount_info = db.Column(db.String(100))                # 特典内容
    required_rank = db.Column(db.String(20), default='BLUE') # 利用可能な最低ランク

class UserCoupon(db.Model):
    __tablename__ = 'user_coupons'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=False)
    status = db.Column(db.String(20), default='unused')      # unused, used

class History(db.Model):
    __tablename__ = 'histories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)   # RANK_UP, COUPON_USE, etc.
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


# ------------------------------------------------------------------
# 【初期データ投入ロジック】本物のパスワードハッシュ対応版
# ------------------------------------------------------------------
def init_sample_data(app):
    # 既に demo_user が登録されている場合は、二重登録を防ぐため何もしない
    if User.query.filter_by(username='demo_user').first():
        return

    print("⚡️ 初期デモデータをデータベースに作成中...")

    # パスワードを本物のハッシュ関数で暗号化（重要）
    hashed_password = generate_password_hash('password123')

    # 1. デモ一般ユーザーの作成
    demo_user = User(
        username='demo_user',
        password_hash=hashed_password,
        email='demo@example.com',
        rank='BLUE',
        total_points=15
    )

    # 2. デモ管理者の作成
    admin_user = Admin(
        admin_username='admin_user',
        password_hash=hashed_password,
        role='SUPERADMIN'
    )

    # 3. テスト用対象店舗の作成
    daishin = Store(store_code="DAISHIN-001", name="ダイシン 仙台あおば店", category="ダイシン")
    pukupuku = Store(store_code="PUKUPUKU-SHIMBASHI", name="Shisha Cafe & Bar PukuPuku 新橋店", category="シシャ")

    db.session.add(demo_user)
    db.session.add(admin_user)
    db.session.add(daishin)
    db.session.add(pukupuku)
    db.session.commit()
    
    print("✅ 初期デモデータの作成が完了しました！")