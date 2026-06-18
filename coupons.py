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
        coupons_list.append({
            "user_coupon_id": record.id,
            "coupon_id": record.coupon.id,
            "title": record.coupon.title,
            "description": record.coupon.description,
            "status": record.status,  # UNUSED または USED
            "required_rank": record.coupon.required_rank
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
    入力された3桁の店舗コードがデータベースに存在するか照合し、クーポンを USED に変更します。
    """
    data = request.get_json()
    user_coupon_id = data.get('user_coupon_id')
    shop_code = data.get('shop_code')  # フロントから飛んでくる3桁のコード (例: "001")

    # 1. 必須項目の入力バリデーション
    if not user_coupon_id or not shop_code:
        return jsonify({"error": "クーポンIDと店舗コードを入力してください"}), 400

    # 2. 店舗コードがDBに実在するかチェック（実在照合ロジック）
    store = Store.query.filter_by(store_code=str(shop_code)).first()
    if not store:
        return jsonify({"error": "無効な店舗コードです。正しい3桁のコードを入力してください"}), 400

    # 3. 対象の所持クーポンデータを取得
    user_coupon = UserCoupon.query.get(user_coupon_id)
    if not user_coupon:
        return jsonify({"error": "指定されたクーポンが見つかりません"}), 404

    # 4. すでに使用済みになっていないかチェック
    if user_coupon.status == 'USED':
        return jsonify({"error": "このクーポンは既に使用済みです"}), 400

    try:
        # 5. ステータスを使用済みに更新！
        user_coupon.status = 'USED'

        # 6. 利用履歴（History）にもログを残す（仕様追加）
        history_log = History(
            user_id=user_coupon.user_id,
            action_type="COUPON_USE",
            description=f"店舗[{store.name}]にてクーポン「{user_coupon.coupon.title}」を使用しました。"
        )
        db.session.add(history_log)
        
        db.session.commit()

        return jsonify({
            "message": f"「{user_coupon.coupon.title}」の使用が完了しました！（店舗: {store.name}）",
            "user_coupon_id": user_coupon.id,
            "status": user_coupon.status
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"クーポン処理中にエラーが発生しました: {str(e)}"}), 500


# 💡 追記：管理画面用の「クーポン新規作成API」
@coupons_bp.route('/api/admin/coupons', methods=['POST'])
def create_admin_coupon():
    data = request.get_json()
    try:
        # 正しいカラム名「required_rank」でCouponモデルを作成
        new_coupon = Coupon(
            title=data.get('title'),
            description=data.get('description'),
            required_rank=data.get('required_rank', 'BLUE')
        )
        db.session.add(new_coupon)
        db.session.commit()
        return jsonify({
            "message": "クーポンマスタを作成しました",
            "coupon": {"id": new_coupon.id, "title": new_coupon.title}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"作成エラー: {str(e)}"}), 500


# 💡 追記：管理画面用の「クーポン一括配布API」
@coupons_bp.route('/api/admin/coupons/distribute', methods=['POST'])
def distribute_admin_coupon():
    data = request.get_json()
    coupon_id = data.get('coupon_id')
    target_rank = data.get('target_rank', 'BLUE')

    if not coupon_id:
        return jsonify({"error": "coupon_id は必須です"}), 400

    try:
        # 対象ランク以上のユーザーをすべて抽出
        # ランクの強さ順を定義
        rank_order = ['BLUE', 'BRONZE', 'SILVER', 'GOLD']
        if target_rank in rank_order:
            allowed_ranks = rank_order[rank_order.index(target_rank):]
            users = User.query.filter(User.rank.in_(allowed_ranks)).all()
        else:
            users = User.query.all()

        distributed_count = 0
        for user in users:
            # 既に同じクーポンが配られているかチェック
            exists = UserCoupon.query.filter_by(user_id=user.id, coupon_id=coupon_id).first()
            if not exists:
                user_coupon = UserCoupon(
                    user_id=user.id,
                    coupon_id=coupon_id,
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
    
# 💡 追記：管理者用の会員一覧取得API
@coupons_bp.route('/api/admin/members', methods=['GET'])
def get_admin_members():
    try:
        # 全ユーザーをDBから取得
        users = User.query.all()
        
        members_list = []
        for user in users:
            members_list.append({
                "id": user.id,
                "username": user.username,
                "rank": user.rank,
                "total_points": getattr(user, 'total_points', 0), # ポイントカラム名に合わせる
                "created_at": user.created_at.strftime('%Y-%m-%d') if hasattr(user, 'created_at') and user.created_at else "2026-01-01"
            })
            
        return jsonify({
            "success": True,
            "members": members_list
        }), 200
    except Exception as e:
        return jsonify({"error": f"会員一覧の取得に失敗しました: {str(e)}"}), 500