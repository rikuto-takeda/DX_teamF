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
  store_code?: string;
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<DB_Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 【修正の核心】'test' という固定値を撤廃。
  // 取得できない場合は空文字にして、API通信時にエラーハンドリングさせる形に変更します。
  const currentStoreCode = localStorage.getItem('store_code') || 
                           localStorage.getItem('storeCode') || 
                           localStorage.getItem('adminStoreCode') || '';

  const fetchCoupons = async () => {
    // 💡 店舗コードが空の場合は通信せずに終了（店舗管理者は必ずコードを持っている前提にする）
    if (!currentStoreCode) {
      toast.error('店舗ログイン情報がありません。再ログインしてください。');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/coupons?store_code=${currentStoreCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Code': currentStoreCode 
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

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDeleteCoupon = async (couponId: number, title: string) => {
    if (confirm(`クーポン「${title}」をマスタから削除しますか？`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/coupons/${couponId}?store_code=${currentStoreCode}`, {
          method: 'DELETE',
          headers: {
            'X-Store-Code': currentStoreCode
          }
        });

        if (!response.ok) {
          const resData = await response.json();
          throw new Error(resData.message || '削除に失敗しました');
        }

        toast.success(`クーポン「${title}」を削除しました！`);
        setCoupons(coupons.filter(c => c.id !== couponId));
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">登録済みクーポンマスタ一覧</h2>
          <p className="text-sm text-gray-500">
            店舗コード: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">[{currentStoreCode || '未設定'}]</span>
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
        <div className="text-center py-12 text-gray-500 text-sm">読み込み中...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
          登録されたクーポンがありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const rankKey = coupon.required_rank || 'BLUE';
            const rankInfo = rankConfigs[rankKey] || { name: rankKey, color: '#3b82f6' };

            return (
              <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{coupon.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: rankInfo.color }}>
                    {rankInfo.name}以上
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">{coupon.description}</p>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-mono">店舗コード: {coupon.store_code || '共通'}</span>
                  <button 
                    onClick={() => handleDeleteCoupon(coupon.id, coupon.title)}
                    className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs"
                  >
                    <Trash2 className="w-3 h-3" /> 削除
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