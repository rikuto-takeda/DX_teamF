import os
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

# 1. Usersテーブル（会員情報）
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    rank = db.Column(db.String(20), nullable=False, default='BLUE')
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.String(20), nullable=False, default='2026/06/18')
    
    # ポイント内訳項目
    login_points = db.Column(db.Integer, default=0)
    credit_points = db.Column(db.Integer, default=0)
    salary_points = db.Column(db.Integer, default=0)
    loan_points = db.Column(db.Integer, default=0)

    user_coupons = db.relationship('UserCoupon', backref='user', lazy=True)
    histories = db.relationship('History', backref='user', lazy=True)

# 2. Adminsテーブル（管理者情報）
class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    admin_username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='super_admin')

# 3. Storesテーブル（店舗情報：001〜999等）
class Store(db.Model):
    __tablename__ = 'stores'
    id = db.Column(db.Integer, primary_key=True)
    store_name = db.Column(db.String(100), nullable=False)
    store_code = db.Column(db.String(20), unique=True, nullable=False)
    location = db.Column(db.String(150), nullable=True)

# 4. Couponsテーブル（クーポン情報、必要ランク等）
class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    discount_info = db.Column(db.String(100), nullable=False)
    required_rank = db.Column(db.String(20), nullable=False, default='BLUE')

# 5. UserCouponsテーブル（ユーザーのクーポン所持状態管理）
class UserCoupon(db.Model):
    __tablename__ = 'user_coupons'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='unused')
    allocated_at = db.Column(db.String(20), nullable=False, default='2026/06/18')

    coupon = db.relationship('Coupon')

# 6. Historiesテーブル（利用履歴・ポイント履歴）
class History(db.Model):
    __tablename__ = 'histories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=True)
    user_coupon_id = db.Column(db.Integer, db.ForeignKey('user_coupons.id'), nullable=True)
    points_changed = db.Column(db.Integer, default=0)
    executed_at = db.Column(db.String(20), nullable=False, default='2026/06/18 11:47')

    store = db.relationship('Store')


# 📊 初期テストデータの挿入用関数
def init_sample_data(app):
    with app.app_context():
        db.create_all()
        
        # ① 管理者アカウント
        if not Admin.query.filter_by(admin_username="admin").first():
            db.session.add(Admin(admin_username="admin", password_hash=generate_password_hash("admin123")))
        
        # ② 店舗コード
        if not Store.query.filter_by(store_code="001").first():
            db.session.add(Store(store_name="シーシャカフェ PukuPuku 新橋店", store_code="001"))
            
        # ③ クーポンマスタ
        if not Coupon.query.filter_by(title="初回特典スタータークーポン").first():
            db.session.add(Coupon(title="初回特典スタータークーポン", description="全品10%OFF", discount_info="10%OFF", required_rank="BLUE"))
            db.session.add(Coupon(title="プレミアムGOLD限定クーポン", description="VIPルーム無料", discount_info="VIP無料", required_rank="GOLD"))
        
        db.session.commit()