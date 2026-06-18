# admin_management.py
from flask import Blueprint, request, jsonify
from models import db, Store

admin_mgmt_bp = Blueprint('admin_mgmt', __name__)

# ==========================================
# 1. 新規店舗登録 API (POST)
# ==========================================
@admin_mgmt_bp.route('/api/admin/stores', methods=['POST'])
def create_store():
    data = request.get_json()
    if not data:
        return jsonify({"error": "BAD_REQUEST", "message": "データが空です"}), 400

    store_code = data.get('store_code')  # 例: "002"
    store_name = data.get('store_name')  # 例: "ダイシン 〇〇店"

    # バリデーション
    if not store_code or not store_name:
        return jsonify({"error": "VALIDATION_FAILED", "message": "店舗コードと店舗名は必須です"}), 400

    # 店舗コードが3桁の数字かチェック
    if len(str(store_code)) != 3 or not str(store_code).isdigit():
        return jsonify({"error": "INVALID_FORMAT", "message": "店舗コードは3桁の半角数字である必要があります"}), 400

    # 重複チェック（すでに同じ店舗コードがないか）
    existing_store = Store.query.filter_by(store_code=store_code).first()
    if existing_store:
        return jsonify({"error": "DUPLICATE_CODE", "message": f"店舗コード「{store_code}」は既に登録されています"}), 400

    # 新規登録処理
    new_store = Store(
        store_code=store_code,
        store_name=store_name
    )
    db.session.add(new_store)
    db.session.commit()

    return jsonify({
        "message": "店舗が正常に登録されました",
        "store": {
            "id": new_store.id,
            "store_code": new_store.store_code,
            "store_name": new_store.store_name
        }
    }), 201

# ==========================================
# 2. 店舗一覧取得 API (GET)
# ==========================================
@admin_mgmt_bp.route('/api/admin/stores', methods=['GET'])
def get_all_stores():
    stores = Store.query.all()
    store_list = []
    for s in stores:
        store_list.append({
            "id": s.id,
            "store_code": s.store_code,
            "store_name": s.store_name
        })
    return jsonify({"stores": store_list}), 200

# --- ここから admin_management.py の末尾に追記 ---

from models import Coupon, User, UserCoupon

# ==========================================
# 3. 新規クーポン作成 API (POST)
# ==========================================
@admin_mgmt_bp.route('/api/admin/coupons', methods=['POST'])
def create_coupon():
    """
    管理者画面から新しいクーポンマスタを作成するAPI
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "BAD_REQUEST", "message": "データが空です"}), 400

    title = data.get('title')          # 例: "【GOLD限定】高級防災リュック交換券"
    description = data.get('description')  # 例: "GOLDランク会員限定の特大特典です"
    min_rank = data.get('min_rank', 'BLUE')  # 利用可能な最小ランク (BLUE, BRONZE, SILVER, GOLD)

    # バリデーション
    if not title:
        return jsonify({"error": "VALIDATION_FAILED", "message": "クーポンタイトルは必須です"}), 400
    
    if min_rank not in ['BLUE', 'BRONZE', 'SILVER', 'GOLD']:
        return jsonify({"error": "INVALID_RANK", "message": "無効なランク指定です"}), 400

    # 新規クーポンマスタの登録
    new_coupon = Coupon(
        title=title,
        description=description,
        min_rank=min_rank
    )
    db.session.add(new_coupon)
    db.session.commit()

    return jsonify({
        "message": "新しいクーポンマスタが登録されました",
        "coupon": {
            "id": new_coupon.id,
            "title": new_coupon.title,
            "description": new_coupon.description,
            "min_rank": new_coupon.min_rank
        }
    }), 201


# ==========================================
# 4. クーポン一括配布 API (POST)
# ==========================================
@admin_mgmt_bp.route('/api/admin/coupons/distribute', methods=['POST'])
def distribute_coupon():
    """
    特定のランク以上のユーザー全員に、指定したクーポンを一括配布するAPI
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "BAD_REQUEST", "message": "データが空です"}), 400

    coupon_id = data.get('coupon_id')
    target_rank = data.get('target_rank') # 例: "SILVER" (このランク以上の人に配る)

    if not coupon_id or not target_rank:
        return jsonify({"error": "VALIDATION_FAILED", "message": "coupon_id と target_rank は必須です"}), 400

    # 対象のクーポンが存在するかチェック
    coupon = Coupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"error": "NOT_FOUND", "message": "指定されたクーポンが見つかりません"}), 404

    # 配布対象となるユーザーを抽出するロジック
    # ランクの強さ順にフィルターをかける
    rank_order = ['BLUE', 'BRONZE', 'SILVER', 'GOLD']
    if target_rank not in rank_order:
        return jsonify({"error": "INVALID_RANK", "message": "無効なターゲットランクです"}), 400
        
    # 指定されたランク以上のランク一覧を取得 (例: "SILVER" なら ['SILVER', 'GOLD'])
    eligible_ranks = rank_order[rank_order.index(target_rank):]

    # 条件に合致するユーザーをDBから全件取得
    target_users = User.query.filter(User.rank.in_(eligible_ranks)).all()

    if not target_users:
        return jsonify({"message": "配布対象となる条件のユーザーがシステム内に存在しません", "distributed_count": 0}), 200

    distributed_count = 0
    # 対象ユーザー全員の所持クーポン（UserCoupon）にインサート
    for user in target_users:
        # 既に同じクーポンを所持しているか重複チェック（同一クーポンの重複配布を防ぐ場合）
        existing_user_coupon = UserCoupon.query.filter_by(user_id=user.id, coupon_id=coupon.id).first()
        if existing_user_coupon:
            continue

        user_coupon = UserCoupon(
            user_id=user.id,
            coupon_id=coupon.id,
            status="UNUSED"  # 未使用状態で配布
        )
        db.session.add(user_coupon)
        distributed_count += 1

    db.session.commit()

    return jsonify({
        "message": f"クーポン「{coupon.title}」を一括配布しました",
        "target_rank_condition": f"{target_rank} 以上",
        "distributed_count": distributed_count
    }), 200