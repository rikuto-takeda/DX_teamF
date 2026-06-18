import os
from flask import Flask, jsonify, request
from flask_cors import CORS
<<<<<<< Updated upstream
=======
from models import db, User
from auth import auth_bp
from points import points_bp  # ポイント・ランク判定用のBlueprint (WBS 8.4)
from coupons import coupons_bp  # 💡 【新設】マイページ情報・クーポン用のBlueprint (WBS 9.2.2)
>>>>>>> Stashed changes

# 必要層のインポート
from models import db, User, Admin, Store, Coupon, UserCoupon, History, init_sample_data
# ⚡️ 新設した auth.py からルーティングの塊とガード関数をインポート
from auth import auth_bp, user_login_required, admin_login_required

<<<<<<< Updated upstream
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
app.config['SECRET_KEY'] = 'dev-secret-key-f-team'

# SQLite設定
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
=======
    # 1. データベースの設定 (SQLiteを使用)
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "app.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 2. CORSの設定（強化版）
    # エラー応答やその他すべてのエンドポイント (/*) でCORSを確実に許可する
    CORS(app, resources={r"/*": {"origins": "*"}})
>>>>>>> Stashed changes

db.init_app(app)

<<<<<<< Updated upstream
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
=======
    # 4. Blueprint（各種API）の登録
    app.register_blueprint(auth_bp)     # 認証関係（ログイン・新規登録）
    app.register_blueprint(points_bp)   # ランク自動判定・ポイント関係
    app.register_blueprint(coupons_bp)  # 💡 【新設】クーポン・マイページ情報関係

    # 5. アプリ起動時に初期デモデータを投入する（テーブルがなければ作成）
    with app.app_context():
        db.create_all()
        
        # 初期ユーザーが1人もいない場合だけテストデータを自動生成
        if not User.query.first():
            from werkzeug.security import generate_password_hash
            
            demo_user = User(
                username="test_user",
                email="test@example.com",
                password_hash=generate_password_hash("password123"),
                rank="BLUE"
            )
            
            if hasattr(demo_user, 'total_points'):
                demo_user.total_points = 15
            elif hasattr(demo_user, 'points'):
                demo_user.points = 15

            db.session.add(demo_user)
            db.session.commit()
            print("💡 初期デモユーザー(test_user)を作成しました。")
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
>>>>>>> Stashed changes
