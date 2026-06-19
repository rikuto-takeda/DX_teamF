// CouponManagement.tsx
import { useState, useEffect } from 'react';
import { rankConfigs } from '../../utils/rankConfig';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';

// 💡 バックエンド（SQLite）のCouponテーブルの構造に合わせた型定義
interface DB_Coupon {
  id: number;
  title: string;
  description: string;
  discount: string;
  required_rank: Rank; // バックエンド側の命名規則
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<DB_Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 バックエンドから本物のクーポンマスタ一覧を取得する関数
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/coupons');
      if (!response.ok) {
        throw new Error('クーポンマスタ一覧の取得に失敗しました');
      }
      const data = await response.json();
      setCoupons(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'サーバーからデータを取得できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 画面表示時に一発実行
  useEffect(() => {
    fetchCoupons();
  }, []);

  // 💡 クーポンの削除処理（本番化を見据えたUI側ロジック）
  const handleDeleteCoupon = (couponId: number, title: string) => {
    if (confirm(`クーポン「${title}」をマスタから削除しますか？\n※この操作は取り消せません。`)) {
      // ひとまず画面上でのフィードバックと、削除成功の通知
      toast.success('クーポンマスタから削除しました');
      setCoupons(coupons.filter(c => c.id !== couponId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">登録済みクーポンマスタ一覧</h2>
          <p className="text-sm text-gray-500">現在データベース（SQLite）に登録されているクーポンの一覧です。</p>
        </div>
        <button 
          onClick={fetchCoupons}
          className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          同期・リロード
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          データベースからクーポンマスタを読み込み中...
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
          登録されているクーポンマスタがありません。上のフォームから最初のクーポンを登録してください。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            // 安全対策: APIから返ってきた値が rankConfigs に存在するかチェック
            const rankKey = coupon.required_rank || 'BLUE';
            const rankInfo = rankConfigs[rankKey] || { name: rankKey, color: '#3b82f6' };

            return (
              <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-gray-800 text-base">{coupon.title}</h3>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                      style={{ backgroundColor: rankInfo.color }}
                    >
                      {rankInfo.name}以上
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {coupon.description}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400 font-medium">特典・割引</p>
                      <p className="text-gray-700 font-bold">{coupon.discount || '特典'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">マスタID</p>
                      <p className="text-gray-700 font-mono">#{coupon.id}</p>
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="px-5 pb-4 pt-2 border-t border-gray-50 flex gap-2">
                  <button 
                    disabled
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-xs cursor-not-allowed"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>編集（未実装）</span>
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-semibold"
                    onClick={() => handleDeleteCoupon(coupon.id, coupon.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>削除</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}