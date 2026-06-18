# app.py
import os
from flask import Flask
from flask_cors import CORS
from models import db, User, Admin
from auth import auth_bp
from points import points_bp    # ポイント・ランク判定用のBlueprint (WBS 8.4)
from coupons import coupons_bp   # クーポン・マイページ情報用のBlueprint (WBS 9.2.2)
from admin_management import admin_mgmt_bp  # 💡追加：管理者機能用のBlueprint

def create_app():
    app = Flask(__name__)

    # 1. データベースの設定 (SQLiteを使用)
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "app.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 2. CORSの設定（強化版：すべてのリクエストでCORSを確実に許可）
    CORS(app, resources={r"/*": {"origins": "*"}})

    # 3. データベースの初期化
    db.init_app(app)

    # 4. Blueprint（各種API）の登録
    app.register_blueprint(auth_bp)     # 認証関係（ログイン・新規登録）
    app.register_blueprint(points_bp)   # ランク自動判定・ポイント関係
    app.register_blueprint(coupons_bp)  # クーポン・マイページ情報関係
    app.register_blueprint(admin_mgmt_bp)  # 💡追加：管理者向け店舗管理機能関係

    # 5. アプリ起動時に初期デモデータを投入する（テーブルがなければ作成）
    with app.app_context():
        db.create_all()
        
        from werkzeug.security import generate_password_hash
        from models import init_sample_data
        
        # ① 初期ユーザーが1人もいない場合だけテストデータを自動生成
        if not User.query.first():
            # models.py に用意されている正規のデモデータ作成関数を呼び出す
            init_sample_data(app)
            
        # ② 管理者の初期デモデータがなければ作成 (admin / adminpass)
        if not Admin.query.filter_by(admin_username='admin').first():
            print("⚡️ 初期デモ管理者データをデータベースに作成中...")
            admin_pass_hash = generate_password_hash('adminpass')
            demo_admin = Admin(
                admin_username='admin',
                password_hash=admin_pass_hash
            )
            db.session.add(demo_admin)
            db.session.commit()
            print("✅ デモ管理者（admin / adminpass）を作成しました。")
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)