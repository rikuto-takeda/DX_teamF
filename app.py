import os
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# ⚡️ 新しく分離したモデル層からインポート
from models import db, User, Admin, Store, Coupon, UserCoupon, History, init_sample_data

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'dev-secret-key-f-team'

# SQLite設定
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# データベースをアプリにバインドして初期化
db.init_app(app)
init_sample_data(app)

# ------------------------------------------------------------------
# 認証デコレータ ＆ 主要ルーティング
# ------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "ログインが必要です。"}), 401
        current_user = User.query.get(session['user_id'])
        if not current_user:
            return jsonify({"error": "ユーザーが存在しません。"}), 401
        return f(current_user, *args, **kwargs)
    return decorated_function

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'password', 'email')):
        return jsonify({"error": "入力値が不足しています。"}), 400
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "すでに登録されています。"}), 400
        
    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password_hash=hashed_pw, email=data['email'], rank='BLUE', total_points=15)
    db.session.add(new_user)
    db.session.flush()
    
    starter_coupon = Coupon.query.filter_by(title="初回特典スタータークーポン").first()
    if starter_coupon:
        user_coupon = UserCoupon(user_id=new_user.id, coupon_id=starter_coupon.id, status='unused')
        db.session.add(user_coupon)
        
    db.session.commit()
    return jsonify({"message": "会員登録成功", "user_id": new_user.id}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"error": "認証エラー"}), 401
    session['user_id'] = user.id
    return jsonify({"message": "ログイン成功", "user": {"username": user.username, "rank": user.rank}}), 200

@app.route('/api/user/mypage', methods=['GET'])
@login_required
def mypage(current_user):
    return jsonify({
        "username": current_user.username, "email": current_user.email, "rank": current_user.rank, "points": current_user.total_points,
        "points_detail": {"login": current_user.login_points, "credit": current_user.credit_points, "salary": current_user.salary_points, "loan": current_user.loan_points}
    }), 200

@app.route('/api/user/coupons/use', methods=['POST'])
@login_required
def use_coupon(current_user):
    data = request.get_json()
    user_coupon = UserCoupon.query.filter_by(id=data.get('user_coupon_id'), user_id=current_user.id).first()
    if not user_coupon or user_coupon.status == 'used':
        return jsonify({"error": "無効なクーポンです。"}), 400
        
    store = Store.query.filter_by(store_code=data.get('store_code')).first()
    if not store:
        return jsonify({"error": "店舗コードが不正です。"}), 400
        
    user_coupon.status = 'used'
    
    new_log = History(
        user_id=current_user.id,
        action_type='COUPON_USE',
        description=f"店舗 [{store.store_name}] にて、クーポン [{user_coupon.coupon.title}] を利用しました。",
        store_id=store.id,
        user_coupon_id=user_coupon.id
    )
    db.session.add(new_log)
    db.session.commit()
    
    return jsonify({"status": "success", "message": f"「{store.store_name}」での消込完了。"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)