# coupons.py
from flask import Blueprint, request, jsonify
from models import db, User, Coupon, UserCoupon, Store, History

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/api/user/<int:user_id>/dashboard', methods=['GET'])
def get_dashboard_info(user_id):
    """
    マイページ情報を一括で返すAPI
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    current_points = getattr(user, 'total_points', 0)
    user_coupons_records = UserCoupon.query.filter_by(user_id=user_id).all()
    
    coupons_list = []
    for record in user_coupons_records:
        if record.coupon:
            coupons_list.append({
                "user_coupon_id": record.id,
                "coupon_id": record.coupon.id,
                "title": record.coupon.title,
                "description": record.coupon.description,
                "status": record.status,  # UNUSED または USED
                "required_rank": getattr(record.coupon, 'required_rank', 'BLUE')
            })

    return jsonify({
        "username": user.username,
        "rank": user.rank,
        "current_points": current_points,
        "coupons": coupons_list
    }), 200


@coupons_bp.route('/api/coupon/use', methods=['POST'])
def use_coupon():
    """
    【コアロジック】クーポンの消込（使用）処理API (WBS 9.2.3)
    """
    data = request.get_json()
    user_coupon_id = data.get('user_coupon_id')
    shop_code = data.get('shop_code')

    if not user_coupon_id or not shop_code:
        return jsonify({"error": "クーポンIDと店舗コードを入力してください"}), 400

    store = Store.query.filter_by(store_code=str(shop_code)).first()
    if not store:
        return jsonify({"error": "無効な店舗コードです。正しい3桁のコードを入力してください"}), 400

    user_coupon = UserCoupon.query.get(user_coupon_id)
    if not user_coupon:
        return jsonify({"error": "指定されたクーポンが見つかりません"}), 404

    if str(user_coupon.status).upper() == 'USED':
        return jsonify({"error": "このクーポンは既に使用済みです"}), 400

    try:
        user_coupon.status = 'USED'
        coupon_title = user_coupon.coupon.title if user_coupon.coupon else "対象クーポン"
        history_log = History(
            user_id=user_coupon.user_id,
            action_type="COUPON_USE",
            description=f"店舗[{store.name}]にてクーポン「{coupon_title}」を使用しました。"
        )
        db.session.add(history_log)
        db.session.commit()

        return jsonify({
            "message": f"「{coupon_title}」の使用が完了しました！（店舗: {store.name}）",
            "user_coupon_id": user_coupon.id,
            "status": user_coupon.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"クーポン処理中にエラーが発生しました: {str(e)}"}), 500


# 🌟 管理画面用：クーポンマスタ管理API（作成・一覧取得）
@coupons_bp.route('/api/admin/coupons', methods=['POST', 'GET'])
def handle_admin_coupons():
    # 💡 【タスク③】ログインしている店舗のクーポンだけを絞り込んで取得
    if request.method == 'GET':
        try:
            # フロント側から送られてくる店舗コード
            request_store_code = request.args.get('store_code') or request.headers.get('X-Store-Code')

            if request_store_code:
                # 店舗からのアクセスの場合は、その店舗が作ったクーポン、または全店共通（None）のものを取得
                all_coupons = Coupon.query.filter(
                    (Coupon.store_code == str(request_store_code).strip()) | (Coupon.store_code == None)
                ).all()
            else:
                # 最高管理者の場合は全件取得
                all_coupons = Coupon.query.all()

            coupon_list = []
            for c in all_coupons:
                desc_text = c.description if c.description else ""
                discount_text = "特典"
                
                if desc_text.startswith("【特典：") and "】" in desc_text:
                    parts = desc_text.split("】", 1)
                    discount_text = parts[0].replace("【特典：", "")
                    display_desc = parts[1].strip()
                else:
                    display_desc = desc_text

                coupon_list.append({
                    "id": c.id,
                    "title": c.title,
                    "description": display_desc,
                    "discount": discount_text,
                    "required_rank": c.required_rank if c.required_rank else 'BLUE',
                    "store_code": c.store_code
                })
            return jsonify(coupon_list), 200
        except Exception as e:
            return jsonify({"error": f"一覧取得エラー: {str(e)}"}), 500

    # 💡 【タスク②】クーポン作成時に自動で店舗コードを紐付け
    if request.method == 'POST':
        data = request.get_json()
        try:
            raw_description = data.get('description', '')
            discount_val = data.get('discount', '特典')
            full_description = f"【特典：{discount_val}】\n{raw_description}"

            assigned_store_code = data.get('store_code') or request.headers.get('X-Store-Code')
            if assigned_store_code:
                assigned_store_code = str(assigned_store_code).strip()

            new_coupon = Coupon(
                title=data.get('title'),
                description=full_description,
                required_rank=data.get('required_rank', 'BLUE'),
                store_code=assigned_store_code
            )
            db.session.add(new_coupon)
            db.session.commit()
            return jsonify({
                "message": "クーポンマスタを作成しました",
                "coupon": {"id": new_coupon.id, "title": new_coupon.title, "store_code": new_coupon.store_code}
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"作成エラー: {str(e)}"}), 500


# 🌟 管理画面用：クーポンマスタ個別削除API
@coupons_bp.route('/api/admin/coupons/<int:coupon_id>', methods=['DELETE'])
def delete_admin_coupon(coupon_id):
    coupon = Coupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"error": "指定されたクーポンマスタが見つかりません"}), 404
        
    # 💡 【タスク⑤】店舗側からの削除を制限
    request_store_code = request.args.get('store_code') or request.headers.get('X-Store-Code')
    if request_store_code and coupon.store_code and coupon.store_code != str(request_store_code).strip():
        return jsonify({"error": "PERMISSION_DENIED", "message": "他店舗が作成したクーポンを削除することはできません"}), 403

    try:
        UserCoupon.query.filter_by(coupon_id=coupon_id).delete()
        db.session.delete(coupon)
        db.session.commit()
        return jsonify({"success": True, "message": f"クーポン「{coupon.title}」をDBから完全削除しました"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"削除エラー: {str(e)}"}), 500


# 管理画面用の「クーポン一括配布API」
@coupons_bp.route('/api/admin/coupons/distribute', methods=['POST'])
def distribute_admin_coupon():
    data = request.get_json()
    coupon_id = data.get('coupon_id')
    target_rank = data.get('target_rank', 'BLUE')

    if not coupon_id:
        return jsonify({"error": "coupon_id は必須です"}), 400

    try:
        rank_order = ['BLUE', 'BRONZE', 'SILVER', 'GOLD']
        if target_rank in rank_order:
            allowed_ranks = rank_order[rank_order.index(target_rank):]
            users = User.query.filter(User.rank.in_(allowed_ranks)).all()
        else:
            users = User.query.all()

        distributed_count = 0
        for user in users:
            exists = UserCoupon.query.filter_by(user_id=user.id, coupon_id=coupon_id).first()
            if not exists:
                user_coupon = UserCoupon(
                    user_id=user.id,
                    coupon_id=int(coupon_id), 
                    status='UNUSED'
                )
                db.session.add(user_coupon)
                distributed_count += 1

        db.session.commit()
        return jsonify({
            "message": f"{distributed_count}人のユーザーに一括配布しました",
            "distributed_count": distributed_count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"配布エラー: {str(e)}"}), 500
    

# 会員一覧取得API
@coupons_bp.route('/api/admin/members', methods=['GET'])
def get_admin_members():
    try:
        users = User.query.all()
        members_list = []
        for user in users:
            try:
                if hasattr(user, 'created_at') and user.created_at:
                    created_at_str = user.created_at.strftime('%Y-%m-%d')
                else:
                    created_at_str = "2026-01-01"
            except Exception:
                created_at_str = "2026-01-01"

            user_rank = user.rank if user.rank else "BLUE"

            members_list.append({
                "id": user.id,
                "username": user.username if user.username else f"user_{user.id}",
                "rank": user_rank,
                "total_points": getattr(user, 'total_points', 0) if getattr(user, 'total_points', 0) is not None else 0,
                "created_at": created_at_str
            })
            
        return jsonify({
            "success": True,
            "members": members_list
        }), 200
    except Exception as e:
        return jsonify({"error": f"会員一覧の取得に失敗しました: {str(e)}"}), 500
    

# coupons.py の一番下にある get_admin_analytics 関数を以下に差し替えてください

# 分析データ取得API（店舗別絞り込み対応版）
@coupons_bp.route('/api/admin/analytics', methods=['GET'])
def get_admin_analytics():
    try:
        from models import UserCoupon, Coupon, User, Store
        
        # 💡 フロントエンドから送られてくる店舗コード（クエリパラメータやヘッダー）をキャッチ
        request_store_code = request.args.get('store_code') or request.headers.get('X-Store-Code')
        if request_store_code:
            request_store_code = str(request_store_code).strip()

        all_records = UserCoupon.query.filter_by(status='USED').all()
        parsed_records = []
        
        for ur in all_records:
            coupon = ur.coupon
            user = ur.user
            coupon_title = coupon.title if coupon else "テスト用クーポン"
            
            desc_text = coupon.description if coupon and coupon.description else ""
            discount_text = "特典"
            if desc_text.startswith("【特典：") and "】" in desc_text:
                discount_text = desc_text.split("】", 1)[0].replace("【特典：", "")
            elif coupon and hasattr(coupon, 'discount') and coupon.discount:
                discount_text = coupon.discount

            user_name = user.username if user else f"会員_{ur.user_id}"
            user_rank = user.rank if user and hasattr(user, 'rank') else "BLUE"

            # デフォルト値
            store_name = "全店舗共通"
            store_id = "1"
            store_code = "001"
            
            # クーポンの作成店舗情報を取得して紐付け
            if coupon and coupon.store_code:
                store_code = coupon.store_code
                matched_store = Store.query.filter_by(store_code=store_code).first()
                if matched_store:
                    store_name = matched_store.name
                    store_id = str(matched_store.id)
            
            # 💡 【マルチテナントの壁】店舗からのアクセスの場合は、他店の利用実績をスキップする！
            if request_store_code and store_code != request_store_code:
                continue

            parsed_records.append({
                "id": ur.id,
                "userId": ur.user_id,
                "username": user_name,
                "userRank": user_rank,
                "couponId": str(ur.coupon_id),
                "couponTitle": coupon_title,
                "discount": discount_text,
                "storeId": store_id,
                "storeName": store_name,
                "storeCode": store_code,
                "usedAt": ur.updated_at.strftime('%Y-%m-%dT%H:%M:%S.000Z') if hasattr(ur, 'updated_at') and ur.updated_at else "2026-06-18T12:00:00.000Z"
            })
            
        # 💡 総件数なども、店舗ごとに絞り込んだ件数に合わせる
        unique_coupons_query = Coupon.query
        if request_store_code:
            unique_coupons_query = unique_coupons_query.filter_by(store_code=request_store_code)
            
        total_coupons = unique_coupons_query.count()
        total_stores = Store.query.count()
        
        return jsonify({
            "success": True,
            "usageRecords": parsed_records,
            "uniqueCouponsCount": total_coupons,
            "uniqueStoresCount": total_stores if not request_store_code else 1 # 自店舗のみなので1
        }), 200
    except Exception as e:
        return jsonify({"error": f"分析データの集計に失敗しました: {str(e)}"}), 500