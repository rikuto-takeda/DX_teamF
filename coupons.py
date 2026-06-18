# coupons.py
from flask import Blueprint, request, jsonify
from models import db, User, Coupon, UserCoupon

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/api/user/<int:user_id>/dashboard', methods=['GET'])
def get_dashboard_info(user_id):
    """
    【ステップ4】マイページ情報を一括で返すAPI (WBS 9.2.2)
    現在のポイント、会員ランク、次のランクまでの必要ポイント、および所持クーポンを返します。
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "ユーザーが見つかりません"}), 404

    # ユーザーの現ポイントを取得
    current_points = getattr(user, 'total_points', getattr(user, 'points', 0))

    # 所持しているクーポンの一覧を取得（リレーションを活用）
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

    # フロントエンドが使いやすい形でまとめる
    return jsonify({
        "username": user.username,
        "rank": user.rank,
        "current_points": current_points,
        "coupons": coupons_list
    }), 200