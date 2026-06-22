// CouponManagement.tsx
import { useState, useEffect } from 'react';
import { rankConfigs } from '../../utils/rankConfig';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';

interface DB_Coupon {
  id: number;
  title: string;
  description: string;
  discount: string;
  required_rank: Rank;
  store_code?: string; // 💡 バックエンドから返ってくる店舗コードを受け取る型を追加
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<DB_Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 【修正の核心】ローカルストレージなどからログイン中の店舗コードを取得する（システムの設定に合わせて適宜調整してください）
  const currentStoreCode = localStorage.getItem('store_code') || 'test'; 

  // 💡 バックエンドから「自店舗の」クーポンマスタ一覧を取得する関数
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      
      // 💡 クエリパラメータに店舗コード（?store_code=xxx）を付与して、バックエンド側で絞り込ませる！
      // 同時にバックエンドがヘッダー（X-Store-Code）でも受け取れるよう、念のため両方で送ります。
      const response = await fetch(`http://localhost:5000/api/admin/coupons?store_code=${currentStoreCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Code': currentStoreCode // 💡 バックエンドの request.headers.get に連動
        }
      });

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

  // 💡 画面表示時に実行
  useEffect(() => {
    fetchCoupons();
  }, []);

  // 💡 クーポンの削除処理（タスク⑤：自店舗以外の削除をブロックするバックエンドと連携）
  const handleDeleteCoupon = async (couponId: number, title: string) => {
    if (confirm(`クーポン「${title}」をマスタから削除しますか？\n※配布済みのユーザーの所持データからも消去されます。`)) {
      try {
        // 💡 削除時も「本当にこの店舗が削除権限を持っているか」を判定させるために店舗コードを付与
        const response = await fetch(`http://localhost:5000/api/admin/coupons/${couponId}?store_code=${currentStoreCode}`, {
          method: 'DELETE',
          headers: {
            'X-Store-Code': currentStoreCode
          }
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || resData.error || 'マスタからの削除に失敗しました');
        }

        toast.success(`クーポン「${title}」をDBから完全削除しました！`);
        setCoupons(coupons.filter(c => c.id !== couponId));

      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(error.message || '通信エラーが発生しました');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">登録済みクーポンマスタ一覧</h2>
          <p className="text-sm text-gray-500">
            店舗コード <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">[{currentStoreCode}]</span> として管理しているクーポン一覧です。
          </p>
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
          この店舗で登録されているクーポンマスタがありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const rankKey = coupon.required_rank || 'BLUE';
            const rankInfo = rankConfigs[rankKey] || { name: rankKey, color: '#3b82f6' };

            return (
              <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-gray-800 text-base">{coupon.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: rankInfo.color }}
                      >
                        {rankInfo.name}以上
                      </span>
                      {coupon.store_code && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded font-mono">
                          店コード: {coupon.store_code}
                        </span>
                      )}
                    </div>
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