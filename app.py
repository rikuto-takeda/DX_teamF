import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# 必要層のインポート
from models import db, User, Admin, Store, Coupon, UserCoupon, History, init_sample_data
# ⚡️ 新設した auth.py からルーティングの塊とガード関数をインポート
from auth import auth_bp, user_login_required, admin_login_required

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.config['SECRET_KEY'] = 'dev-secret-key-f-team'

# SQLite設定
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# 起動時のマスタ初期化
with app.app_context():
    db.create_all()
    init_sample_data(app)
    
    if not Coupon.query.filter_by(title="ダイシン防災グッズ交換クーポン").first():
        db.session.add(Coupon(title="ダイシン防災グッズ交換クーポン", description="【初回登録特典】ダイシン各店舗で防災グッズと交換できます。", discount_info="防災グッズ無料交換", required_rank="BLUE"))
        db.session.commit()

# ⚡️ 【重要】auth.py で作った認証系のルーティングをアプリに登録！
app.register_blueprint(auth_bp)


# ------------------------------------------------------------------
# 保護されたテスト用ルーティング（auth.pyのガード機能がちゃんと効くか検証用）
# ------------------------------------------------------------------
@app.route('/api/user/mypage', methods=['GET'])
@user_login_required
def mypage(current_user):
    return jsonify({
        "username": current_user.username,
        "email": current_user.email,
        "rank": current_user.rank,
        "points": current_user.total_points
    }), 200

@app.route('/api/admin/dashboard', methods=['GET'])
@admin_login_required
def admin_dashboard(current_admin):
    return jsonify({
        "message": f"ようこそ、{current_admin.admin_username} 管理者様。こちらは保護された管理画面APIです。"
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)