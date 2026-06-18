# rank.py
from models import db, User

def determine_rank(points: int) -> str:
    """
    累計ポイントから会員ランクを判定する関数 (WBS 8.4)
    """
    if points >= 100:
        return 'GOLD'
    elif points >= 50:
        return 'SILVER'
    elif points >= 30:
        return 'BRONZE'
    else:
        return 'BLUE'

def add_points_and_update_rank(user_id: int, points_to_add: int) -> User:
    """
    ユーザーにポイントを加算し、それに応じて自動でランクを更新・保存する関数
    """
    user = User.query.get(user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} not found.")

    # 1. ポイントを加算 (既存の total_points フィールドを想定)
    # ※もし models.py のカラム名が points の場合は user.points に適宜書き換えてください
    user.total_points += points_to_add

    # 2. 新しいポイントをベースにランクを自動判定
    new_rank = determine_rank(user.total_points)
    
    # 3. ユーザーのランクを更新
    user.rank = new_rank

    # 4. データベースにコミット
    db.session.commit()
    
    return user