# stores.py
from flask import Blueprint, request, jsonify
from models import db, Store, Coupon, UserCoupon  # 💡 整合性チェック用に Coupon, UserCoupon を追加
from werkzeug.security import generate_password_hash # 💡 パスワードハッシュ化関数をインポート

stores_bp = Blueprint('stores', __name__)

@stores_bp.route('/api/admin/stores', methods=['GET', 'POST'])
def handle_admin_stores():
    """
    店舗一覧取得(GET) と 新規店舗登録(POST) を処理する完全ログイン連動版API
    """
    # 🌟 店舗マスタの全件取得処理 (GET)
    if request.method == 'GET':
        try:
            all_stores = Store.query.all()
            store_list = []
            for s in all_stores:
                # models.py のカラム名違いを安全に吸収するロジック
                actual_code = getattr(s, 'store_code', getattr(s, 'code', getattr(s, 'shop_code', "001")))

                # フロント表示用に category カラムから純粋なカテゴリ名だけを切り出す
                display_category = "一般店舗"
                if s.category and '|' in s.category:
                    display_category = s.category.split('|', 1)[0]
                elif s.category:
                    display_category = s.category

                store_list.append({
                    "id": s.id,
                    "name": s.name,
                    "store_code": actual_code,
                    "category": display_category,
                    "login_id": getattr(s, 'login_id', f"store_{actual_code}"),
                    "password_status": "ENCRYPTED"
                })
            return jsonify(store_list), 200
        except Exception as e:
            return jsonify({"error": f"店舗一覧の同期に失敗しました: {str(e)}"}), 500

    # 🌟 店舗マスタの新規追加処理 (POST)
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "リクエストが空です"}), 400

        name = data.get('name')
        store_code = data.get('store_code') or data.get('code') or data.get('shop_code')
        password = data.get('password') # フロントエンドが自動生成したランダムな8桁パスワード

        if not name or not store_code:
            return jsonify({"error": "店舗名と店舗コードは必須です"}), 400

        try:
            code_str = str(store_code).strip()
            
            # 💡 【バグの根本原因修正】既存の重複チェックを厳格化
            existing_store = Store.query.filter_by(store_code=code_str).first()
            if existing_store:
                return jsonify({"error": f"店舗コード「{code_str}」は既に登録されています"}), 400

            # 新規店舗インスタンス作成
            new_store = Store()
            new_store.name = str(name).strip()

            # 💡 【重要】すれ違いループを廃止し、確実に store_code カラムと互換カラムすべてに強制代入
            new_store.store_code = code_str
            if hasattr(new_store, 'code'):
                new_store.code = code_str
            if hasattr(new_store, 'shop_code'):
                new_store.shop_code = code_str

            # カテゴリ名の抽出と安全なハッシュ化保管
            raw_category = data.get('category') or '一般店舗'
            if not raw_category.strip():
                raw_category = '一般店舗'
            
            target_password = str(password).strip() if password else code_str
            hashed_password = generate_password_hash(target_password)

            # 「カテゴリ名 | ハッシュ値」のシリアライズ形式で安全に隠し持つ
            new_store.category = f"{raw_category.strip()}|{hashed_password}"

            # 💡 データベースに新規登録を確定保存（永続化）
            db.session.add(new_store)
            db.session.commit()

            return jsonify({
                "message": "新規店舗をデータベースに登録しました！(安全に暗号化されました)",
                "store": {
                    "id": new_store.id, 
                    "name": new_store.name, 
                    "store_code": code_str,
                    "temporary_raw_password": target_password 
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] 店舗マスタ保存エラー: {str(e)}")
            return jsonify({"error": f"店舗マスタの書き込みに失敗しました: {str(e)}"}), 500


@stores_bp.route('/api/admin/stores/<int:store_id>', methods=['DELETE'])
def delete_admin_store(store_id):
    """
    【データ整合性防衛】指定された店舗マスタをSQLiteから永久に削除する本番API (DELETE)
    """
    store = Store.query.get(store_id)
    if not store:
        return jsonify({"error": "指定された店舗マスタが見つかりません"}), 404

    try:
        store_code = getattr(store, 'store_code', getattr(store, 'code', getattr(store, 'shop_code', None)))
        
        if store_code:
            clean_code = str(store_code).strip()
            
            # ① 削除対象店舗が作成したクーポンマスタ（Coupon）を全件特定
            linked_coupons = Coupon.query.filter_by(store_code=clean_code).all()
            linked_coupon_ids = [c.id for c in linked_coupons]
            
            if linked_coupon_ids:
                # ② ユーザー所持データを一括連動削除
                UserCoupon.query.filter(UserCoupon.coupon_id.in_(linked_coupon_ids)).delete(synchronize_session=False)
                # ③ 店舗作成のクーポンマスタそのものを一括削除
                Coupon.query.filter(Coupon.id.in_(linked_coupon_ids)).delete(synchronize_session=False)

        # ④ 親である店舗マスタを物理削除
        db.session.delete(store)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "message": f"店舗「{store.name}」および関連するすべてのクーポン・配布データを安全に完全削除しました。"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] 店舗連動削除エラー: {str(e)}")
        return jsonify({"error": f"店舗のクリーンアップ削除に失敗しました: {str(e)}"}), 500