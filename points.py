# points.py
from flask import Blueprint, request, jsonify
from models import User
from rank import add_points_and_update_rank

# Blueprintの定義
points_bp = Blueprint('points', __name__)

@points_bp.route('/api/points/add', methods=['POST'])
def add_points_event():
    """
    取引発生（NISA開設や給与受取など）を模した、ポイント加算＆ランク判定API
    """
    data = request.get_json()
    
    user_id = data.get('user_id')
    points_to_add = data.get('points')

    if not user_id or points_to_add is None:
        return jsonify({"error": "user_id と points は必須項目です"}), 400

    try:
        # rank.py の共通ロジックを呼び出して、ポイント加算とランク自動更新を実行
        user = add_points_and_update_rank(int(user_id), int(points_to_add))
        
        return jsonify({
            "message": "ポイントの加算とランクの自動判定が完了しました",
            "user": {
                "id": user.id,
                "username": user.username,
                "total_points": user.total_points,
                "rank": user.rank
            }
        }), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": f"サーバー内部エラーが発生しました: {str(e)}"}), 500