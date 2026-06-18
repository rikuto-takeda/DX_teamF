# app.py
import os
from flask import Flask
from flask_cors import CORS
from models import db, User
from auth import auth_bp
from points import points_bp  # 💡 新しく作成したポイント・ランク判定用のBlueprint

def create_app():
    app = Flask(__name__)

    # 1. データベースの設定 (SQLiteを使用)
    # 既存の app.db をそのまま読み込みます
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "app.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 2. CORSの設定
    # フロントエンド（React: 通常はlocalhost:5173など）からの通信を許可
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # 3. データベースの初期化
    db.init_app(app)

    # 4. Blueprint（各種API）の登録
    app.register_blueprint(auth_bp)    # 認証関係（ログイン・新規登録）
    app.register_blueprint(points_bp)  # ランク自動判定・ポイント関係 (WBS 8.4)

# 5. アプリ起動時に初期デモデータを投入する（テーブルがなければ作成）
    with app.app_context():
        db.create_all()
        # 念のため、初期ユーザーが1人もいない場合だけテストデータを自動生成
        # 念のため、初期ユーザーが1人もいない場合だけテストデータを自動生成
        if not User.query.first():
            from werkzeug.security import generate_password_hash
            
            # 💡 口座番号のカラム名が不明なため、それ以外の必須項目だけで安全に初期化
            demo_user = User(
                username="test_user",
                email="test@example.com",
                password_hash=generate_password_hash("password123"),
                rank="BLUE"
            )
            
            # 💡 total_points のカラム名エラーを防ぐ安全策
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
    # サーバーを起動 (デバッグモードON)
    app.run(host='0.0.0.0', port=5000, debug=True)