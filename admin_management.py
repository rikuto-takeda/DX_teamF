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