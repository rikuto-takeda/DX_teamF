// CouponList.tsx
import { useState, useEffect } from 'react';
import { User, UsageRecord } from '../App';
import { rankConfigs } from '../utils/rankConfig';
import { ArrowLeft, Tag, Calendar, Infinity } from 'lucide-react';

interface CouponListProps {
  user: User;
  usageRecords: UsageRecord[];
  onSelectCoupon: (coupon: any) => void; // 型エラーを防ぐため any
  onBack: () => void;
}

export function CouponList({ user, usageRecords, onSelectCoupon, onBack }: CouponListProps) {
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const rankConfig = rankConfigs[user.rank];

  useEffect(() => {
    async function fetchUserCoupons() {
      try {
        const response = await fetch(`http://localhost:5000/api/user/${user.id}/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setAvailableCoupons(data.coupons || []);
        }
      } catch (error) {
        console.error("クーポンデータの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserCoupons();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="px-6 pt-8 pb-6"
        style={{ background: rankConfig.bgGradient }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>マイページへ戻る</span>
        </button>
        
        <h1 className="text-2xl text-white mb-2">利用可能なクーポン</h1>
        <p className="text-white/90 text-sm">
          {rankConfig.name}会員以上で利用できる特典
        </p>
      </div>

      {/* Loading 表示 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">データを読み込み中...</div>
      ) : (
        /* Coupon Cards */
        <div className="px-6 py-6 space-y-4">
          {availableCoupons.map((coupon, index) => {
            // バックエンドから返ってこない値は、画面が壊れないように固定値で補う
            const defaultImage = "https://images.unsplash.com/photo-1544438789-089d6e246c0d?w=800";
            
            // coupons.py のキー名（required_rank）に合わせる。なければユーザーの現在のランクにする
            const targetRank = coupon.required_rank || user.rank || 'BLUE';

            return (
              <div
                key={coupon.user_coupon_id || coupon.coupon_id || index}
                onClick={() => onSelectCoupon(coupon)}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <img
                    src={defaultImage}
                    alt={coupon.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div
                      className="px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm"
                      style={{ backgroundColor: rankConfigs[targetRank as 'BLUE'|'BRONZE'|'SILVER'|'GOLD']?.color || '#94a3b8' }}
                    >
                      {rankConfigs[targetRank as 'BLUE'|'BRONZE'|'SILVER'|'GOLD']?.name || 'BLUE'}会員以上
                    </div>
                  </div>
                  
                  {/* 使用回数表示 */}
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 rounded-full text-xs text-white bg-black/60 backdrop-blur-sm flex items-center gap-1">
                      <Infinity className="w-3 h-3" />
                      <span>無制限</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg mb-2 font-bold text-gray-800">{coupon.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {coupon.description || '特別限定クーポンです。'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>特典あり</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>2026-12-31まで</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">利用可能店舗</p>
                    <p className="text-sm">全店舗共通</p>
                  </div>
                </div>
              </div>
            );
          })}

          {availableCoupons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">利用可能なクーポンがありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}