# auth.py
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash  # 💡 パスワード検証用
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "ユーザー名とパスワードを入力してください"}), 400

    # 1. データベースからユーザーを取得
    user = User.query.filter_by(username=username).first()

    # 2. ユーザーが存在し、かつハッシュ化されたパスワードが一致するか検証
    if user and check_password_hash(user.password_hash, password):
        # 💡 フロントエンドが期待しているユーザー情報を返す
        return jsonify({
            "message": "ログインに成功しました",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "rank": user.rank if hasattr(user, 'rank') else "BLUE"
            }
        }), 200
    
    # 3. 認証失敗時
    return jsonify({"error": "ユーザー名またはパスワードが間違っています"}), 401