import hashlib
from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# モデル層から必要な要素をインポート
from models import db, User, Admin, Coupon, UserCoupon, History

# Flaskの「Blueprint（設計図）」機能を使って、ルーティングを別ファイルに分割します
auth_bp = Blueprint('auth', __name__)

# ------------------------------------------------------------------
# 【セキュリティ層】認証認可デコレータ（ガード機能）
# ------------------------------------------------------------------
def user_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "会員ログインが必要です。"}), 401
        current_user = User.query.get(session['user_id'])
        if not current_user:
            return jsonify({"error": "ユーザーが存在しません。"}), 401
        return f(current_user, *args, **kwargs)
    return decorated_function

def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({"error": "管理者権限が必要です。"}), 403
        current_admin = Admin.query.get(session['admin_id'])
        if not current_admin:
            return jsonify({"error": "無効な管理者アカウントです。"}), 403
        return f(current_admin, *args, **kwargs)
    return decorated_function


# ------------------------------------------------------------------
# 【APIルーティング】
# ------------------------------------------------------------------

# 1. ユーザー会員登録 ＆ 初回特典自動付与
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'password', 'email', 'account_number')):
        return jsonify({"error": "入力値が不足しています。(会員ID、パスワード、メール、口座番号が必要です)"}), 400
        
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "すでに登録されている会員IDまたはメールアドレスです。"}), 400
        
    # 🔥 口座番号のハッシュ化（連携ID化）
    raw_account = data['account_number']
    hashed_account_id = hashlib.sha256(raw_account.encode()).hexdigest()
    
    hashed_pw = generate_password_hash(data['password'])
    
    new_user = User(username=data['username'], password_hash=hashed_pw, email=data['email'], rank='BLUE', total_points=15)
    db.session.add(new_user)
    db.session.flush()
    
    # 🔥 ダイシンの防災グッズ等「初回特典クーポン」の自動付与
    daishin_coupon = Coupon.query.filter_by(title="ダイシン防災グッズ交換クーポン").first()
    if daishin_coupon:
        db.session.add(UserCoupon(user_id=new_user.id, coupon_id=daishin_coupon.id, status='unused'))
        db.session.add(History(user_id=new_user.id, action_type='ACCOUNT_REGISTER', description="新規会員登録完了。初回特典付与。"))
        
    db.session.commit()
    return jsonify({
        "message": "会員登録および初回特典の付与が完了しました。",
        "user_id": new_user.id,
        "linked_id_preview": hashed_account_id[:12] + "..."
    }), 201


# 2. ユーザーログイン
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({"error": "会員IDまたはパスワードが正しくありません。"}), 401
        
    session.clear()
    session['user_id'] = user.id
    return jsonify({"message": "ログインに成功しました。", "user": {"id": user.id, "username": user.username, "rank": user.rank}}), 200


# 3. 管理者ログイン
@auth_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(admin_username=data.get('username')).first()
    if not admin or not check_password_hash(admin.password_hash, data.get('password')):
        return jsonify({"error": "管理者IDまたはパスワードが不正です。"}), 401
        
    session.clear()
    session['admin_id'] = admin.id
    return jsonify({"message": "管理者として認証されました。", "admin": {"id": admin.id, "username": admin.admin_username, "role": admin.role}}), 200


# 4. ログアウト
@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "ログアウトしました。"}), 200