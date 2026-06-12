import { useState } from 'react';
import { User, Coupon, UsageRecord } from '../App';
import { rankConfigs } from '../utils/rankConfig';
import { getRemainingUsageCount, canUseCoupon } from '../utils/mockData';
import { ArrowLeft, Tag, Calendar, MapPin, Gift, Infinity, AlertCircle } from 'lucide-react';

interface CouponDetailProps {
  coupon: Coupon;
  user: User;
  usageRecords: UsageRecord[];
  onUseCoupon: (coupon: Coupon) => void;
  onBack: () => void;
}

export function CouponDetail({ coupon, user, usageRecords, onUseCoupon, onBack }: CouponDetailProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const rankConfig = rankConfigs[user.rank];
  const couponRankConfig = rankConfigs[coupon.requiredRank];
  const remaining = getRemainingUsageCount(coupon, user.id, usageRecords);
  const isAvailable = canUseCoupon(coupon, user.id, usageRecords);

  const getUsageLimitText = () => {
    if (coupon.usageLimitType === 'unlimited') {
      return '無制限';
    }
    if (coupon.usageLimitType === 'once') {
      return '1回のみ';
    }
    if (coupon.usageLimitType === 'monthly') {
      return '月2回まで（ブロンズランククーポン全体）';
    }
    if (coupon.usageLimitType === 'lifetime') {
      return '生涯2回まで';
    }
    return '-';
  };

  const handleUseClick = () => {
    if (isAvailable) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmUse = () => {
    setShowConfirmation(false);
    onUseCoupon(coupon);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="px-6 pt-8 pb-6"
        style={{ background: rankConfig.bgGradient }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>クーポン一覧へ戻る</span>
        </button>
      </div>

      {/* Coupon Image */}
      <div className="relative -mt-8 mx-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-64">
            <img
              src={coupon.imageUrl}
              alt={coupon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <div
                className="px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm"
                style={{ backgroundColor: couponRankConfig.color }}
              >
                {couponRankConfig.name}会員以上
              </div>
            </div>
            <div className="absolute top-4 left-4">
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

          {/* Coupon Details */}
          <div className="p-6">
            <h2 className="text-2xl mb-3">{coupon.title}</h2>
            
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{coupon.discount}</span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {coupon.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">利用可能店舗</p>
                  <p className="text-gray-700">{coupon.storeName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">有効期限</p>
                  <p className="text-gray-700">{coupon.validUntil}まで</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">使用制限</p>
                  <p className="text-gray-700">{getUsageLimitText()}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800 mb-2">📌 ご利用方法</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>店舗でこのクーポン画面を提示</li>
                <li>スタッフから伝えられる「3桁の店舗コード」を入力</li>
                <li>「クーポンを利用する」ボタンを押す</li>
                <li>完了画面をスタッフに確認してもらう</li>
              </ol>
            </div>

            {!isAvailable && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  {coupon.usageLimitType === 'monthly' 
                    ? 'このクーポンは今月の利用上限に達しています。来月になると再度利用可能になります。'
                    : 'このクーポンは利用上限に達しています。'}
                </div>
              </div>
            )}

            <button
              onClick={handleUseClick}
              disabled={!isAvailable}
              className="w-full py-4 rounded-xl text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                background: isAvailable ? rankConfig.bgGradient : '#9CA3AF',
                transform: isAvailable ? 'none' : 'none'
              }}
            >
              {isAvailable ? 'クーポンを利用する' : '利用できません'}
            </button>
          </div>
        </div>
      </div>

      {/* 確認モーダル */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl mb-4 text-center">クーポンを使用しますか？</h3>
            <p className="text-sm text-gray-600 mb-2 text-center">{coupon.title}</p>
            
            {remaining !== null && (
              <p className="text-sm text-orange-600 mb-6 text-center">
                残り使用回数: {remaining}回 → {remaining - 1}回
              </p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmUse}
                className="flex-1 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: rankConfig.bgGradient }}
              >
                使用する
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
