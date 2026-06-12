import { User, Coupon, UsageRecord } from '../App';
import { getAvailableCoupons, getRemainingUsageCount } from '../utils/mockData';
import { rankConfigs } from '../utils/rankConfig';
import { ArrowLeft, Tag, Calendar, Infinity } from 'lucide-react';

interface CouponListProps {
  user: User;
  usageRecords: UsageRecord[];
  onSelectCoupon: (coupon: Coupon) => void;
  onBack: () => void;
}

export function CouponList({ user, usageRecords, onSelectCoupon, onBack }: CouponListProps) {
  const availableCoupons = getAvailableCoupons(user.rank);
  const rankConfig = rankConfigs[user.rank];

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

      {/* Coupon Cards */}
      <div className="px-6 py-6 space-y-4">
        {availableCoupons.map((coupon) => {
          const remaining = getRemainingUsageCount(coupon, user.id, usageRecords);
          const isAvailable = remaining === null || remaining > 0;

          return (
            <div
              key={coupon.id}
              onClick={() => isAvailable && onSelectCoupon(coupon)}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 ${
                isAvailable 
                  ? 'cursor-pointer hover:shadow-xl transform hover:-translate-y-1' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="relative h-48">
                <img
                  src={coupon.imageUrl}
                  alt={coupon.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div
                    className="px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm"
                    style={{ backgroundColor: rankConfigs[coupon.requiredRank].color }}
                  >
                    {rankConfigs[coupon.requiredRank].name}会員以上
                  </div>
                </div>
                
                {/* 使用回数表示 */}
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 rounded-full text-xs text-white bg-black/60 backdrop-blur-sm flex items-center gap-1">
                    {remaining === null ? (
                      <>
                        <Infinity className="w-3 h-3" />
                        <span>無制限</span>
                      </>
                    ) : remaining > 0 ? (
                      <span>残り{remaining}回</span>
                    ) : (
                      <span>利用済み</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg mb-2">{coupon.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {coupon.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{coupon.discount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{coupon.validUntil}まで</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">利用可能店舗</p>
                  <p className="text-sm">{coupon.storeName}</p>
                </div>

                {!isAvailable && (
                  <div className="mt-3 bg-gray-100 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-600">
                      {coupon.usageLimitType === 'monthly' 
                        ? '今月の利用上限に達しました' 
                        : '利用上限に達しました'}
                    </p>
                  </div>
                )}
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
    </div>
  );
}
