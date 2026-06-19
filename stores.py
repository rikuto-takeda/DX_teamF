# stores.py
from flask import Blueprint, request, jsonify
from models import db, Store

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
                # models.py のカラム名違いを自動吸収するロジック
                actual_code = ""
                for attr_name in ['store_code', 'code', 'shop_code']:
                    if hasattr(s, attr_name):
                        actual_code = getattr(s, attr_name)
                        break

                # 💡 フロント表示用に category カラムから純粋なカテゴリ名だけを切り出す
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
                    "login_id": getattr(s, 'login_id', f"store_{actual_code}")
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
        store_code = data.get('store_code')
        password = data.get('password') # 💡 フロントエンドが自動生成したランダムな8桁パスワード

        if not name or not store_code:
            return jsonify({"error": "店舗名と3桁の店舗コードは必須です"}), 400

        try:
            # 重複チェック
            code_str = str(store_code).strip()
            existing_store = Store.query.filter_by(store_code=code_str).first()
            if existing_store:
                return jsonify({"error": f"店舗コード「{code_str}」は既に登録されています"}), 400

            # 💡 空のインスタンスから動的にカラムへ代入
            new_store = Store()
            new_store.name = str(name).strip()

            # 💡 【コアハック】category カラムに「カテゴリ名 | パスワード」の形式で合体して密かに保管！
            raw_category = data.get('category') or '一般店舗'
            if not raw_category.strip():
                raw_category = '一般店舗'
            
            if password:
                new_store.category = f"{raw_category.strip()}|{str(password).strip()}"
            else:
                new_store.category = f"{raw_category.strip()}|{code_str}" # フォールバック

            # models.py のカラム定義に合わせて動的に店舗コードを代入
            code_assigned = False
            for attr_name in ['store_code', 'code', 'shop_code']:
                if hasattr(new_store, attr_name):
                    setattr(new_store, attr_name, code_str)
                    code_assigned = True
                    break

            if not code_assigned:
                new_store.store_code = code_str

            db.session.add(new_store)
            db.session.commit()

            return jsonify({
                "message": "新規店舗をデータベースに登録しました！",
                "store": {
                    "id": new_store.id, 
                    "name": new_store.name, 
                    "store_code": code_str
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR] 店舗マスタ保存エラー: {str(e)}")
            return jsonify({"error": f"店舗マスタの書き込みに失敗しました: {str(e)}"}), 500


@stores_bp.route('/api/admin/stores/<int:store_id>', methods=['DELETE'])
def delete_admin_store(store_id):
    """
    指定された店舗マスタをSQLiteから永久に削除する本番API (DELETE)
    """
    store = Store.query.get(store_id)
    if not store:
        return jsonify({"error": "指定された店舗マスタが見つかりません"}), 404

    try:
        db.session.delete(store)
        db.session.commit()
        return jsonify({"success": True, "message": f"店舗「{store.name}」をDBから完全削除しました"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"店舗削除エラー: {str(e)}"}), 500