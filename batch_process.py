# batch_process.py
import os
import pandas as pd
from app import create_app
from models import db, User, History

def import_excel_and_update_ranks(file_path):
    """
    【ステップ6】銀行の取引実績Excelファイルを読み込み、
    ユーザーのポイント加算と4段階のランク判定を一括で行うバッチ処理ロジック
    """
    # 1. 指定されたExcelファイルが存在するかチェック
    if not os.path.exists(file_path):
        print(f"❌ エラー: 指定されたファイルが見つかりません: {file_path}")
        return False

    print(f"📂 Excelファイルを読み込み中: {file_path}")
    
    try:
        # 2. pandasでExcelを読み込む (1行目をヘッダーとする)
        # 期待する列: 'username', 'transaction_type', 'points'
        df = pd.read_excel(file_path)
        
        # 必須のカラムが存在するかバリデーション
        required_columns = ['username', 'transaction_type', 'points']
        for col in required_columns:
            if col not in df.columns:
                print(f"❌ エラー: Excelに必須カラム '{col}' が見つかりません。")
                return False

        # Flaskのアプリコンテキストを開始（データベース操作を可能にする）
        app = create_app()
        with app.app_context():
            success_count = 0
            
            # 3. Excelのデータを1行ずつループ処理
            for index, row in df.iterrows():
                username = str(row['username']).strip()
                transaction_type = str(row['transaction_type']).strip()
                points_to_add = int(row['points'])

                # 対象のユーザーをDBから検索
                user = User.query.filter_by(username=username).first()
                if not user:
                    print(f"⚠️ スキップ: ユーザー「{username}」はシステムに登録されていません。")
                    continue

                # 4. ポイントの加算処理
                old_points = user.total_points
                user.total_points += points_to_add
                new_points = user.total_points

                # 5. 4段階の会員ランク判定ロジック (BLUE -> BRONZE -> SILVER -> GOLD)
                old_rank = user.rank
                if new_points >= 100:
                    user.rank = 'GOLD'
                elif new_points >= 50:
                    user.rank = 'SILVER'
                elif new_points >= 30:
                    user.rank = 'BRONZE'
                else:
                    user.rank = 'BLUE'
                
                new_rank = user.rank

                # 6. 履歴（History）テーブルに実績ログを記録
                log_desc = f"Excel一括取込によりポイント反映: {transaction_type} (+{points_to_add}pt). 通算: {new_points}pt"
                if old_rank != new_rank:
                    log_desc += f" 🎖️ランクアップ！ [{old_rank}] ➡️ [{new_rank}]"

                history_log = History(
                    user_id=user.id,
                    action_type="EXCEL_IMPORT",
                    description=log_desc
                )
                db.session.add(history_log)
                success_count += 1
                
                print(f"✅ {username}: {old_points}pt({old_rank}) -> {new_points}pt({new_rank}) に更新しました。")

            # 7. すべてのエラーがなければコミット（トランザクション完了）
            db.session.commit()
            print(f"✨ バッチ処理が正常に完了しました。合計 {success_count} 件のデータを反映しました。")
            return True

    except Exception as e:
        print(f"❌ バッチ処理中に致命的なエラーが発生しました: {str(e)}")
        return False

# デバッグ用：このファイルを直接実行したときにテストが走るようにする
if __name__ == '__main__':
    # プロジェクトルートにある 'test_data.xlsx' を読み込む想定
    import_excel_and_update_ranks('test_data.xlsx')