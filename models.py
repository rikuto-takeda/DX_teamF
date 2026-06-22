# models.py
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
    store_code = db.Column(db.String(50), unique=True, nullable=False) # 店舗識別コード (例: "001", "002")
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))                      # ダイシン、シシャなど

class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)        # クーポン名
    description = db.Column(db.Text, nullable=True)          # 詳細説明
    discount_info = db.Column(db.String(100), nullable=True) # 特典内容
    required_rank = db.Column(db.String(20), default='BLUE') # 必要ランク
    is_initial_bonus = db.Column(db.Boolean, default=False)  # 初回特典フラグ
    
    # 💡 【タスク①で追加】 どの店舗が作ったクーポンかを識別するコード (空の場合は全店共通扱い)
    store_code = db.Column(db.String(50), nullable=True, default='001')

class UserCoupon(db.Model):
    __tablename__ = 'user_coupons'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=False)
    status = db.Column(db.String(20), default='UNUSED')      # UNUSED: 未使用, USED: 使用済
    assigned_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # リレーション設定
    user = db.relationship('User', backref=db.backref('user_coupons', lazy=True))
    coupon = db.relationship('Coupon', backref=db.backref('user_coupons', lazy=True))

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
    if User.query.filter_by(username='demo_user').first():
        return

    print("⚡️ 初期デモデータをデータベースに作成中...")
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
    daishin = Store(store_code="001", name="ダイシン 仙台あおば店", category="ダイシン")

    db.session.add(demo_user)
    db.session.add(admin_user)
    db.session.add(daishin)
    db.session.commit()
    
    print("✅ 初期デモデータの作成が完了しました！（店舗: 001 のみ）")