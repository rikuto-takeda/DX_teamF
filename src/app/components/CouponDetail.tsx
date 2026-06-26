// CouponDetail.tsx
import { useState } from 'react';
import { User, Coupon, UsageRecord } from '../App';
import { rankConfigs } from '../utils/rankConfig';
import { ArrowLeft, Tag, Calendar, MapPin, Gift, Infinity, AlertCircle } from 'lucide-react';

interface CouponDetailProps {
  coupon: Coupon;
  user: User;
  usageRecords: UsageRecord[];
  onUseCoupon: (coupon: Coupon, shopCode: string) => void; // 💡 内部の型定義を合わせ、裏側で shop_code を送れるよう設定
  onBack: () => void;
}

export function CouponDetail({ coupon, user, usageRecords, onUseCoupon, onBack }: CouponDetailProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // ユーザーランクの安全取得
  const rankConfig = rankConfigs[user.rank] || rankConfigs['BLUE'];
  
  // バックエンドの required_rank とフロントの requiredRank の両方を安全に許容
  const currentRankKey = coupon.required_rank || coupon.requiredRank || 'BLUE';
  const couponRankConfig = rankConfigs[currentRankKey] || rankConfigs['BLUE'];

  // 型やキーの揺れ（couponId / coupon_id）を全て吸収して正しく判定 [cite: 291, 567]
  const hasUsed = usageRecords.some((r) => {
    const recordCouponId = String(r.couponId || r.coupon_id || '');
    const recordUserId = String(r.userId || r.user_id || '');
    return recordCouponId === String(coupon.id) && recordUserId === String(user.id);
  });

  // 💡 ボタンが常に活性化され、押せる状態を維持（UI・機能は前回の設計を維持） [cite: 606, 676]
  const remaining = 1; 
  const isAvailable = true; 

  const getUsageLimitText = () => {
    return '1回のみ';
  };

  const handleUseClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmUse = () => {
    setShowConfirmation(false);
    
    // 💡 【バグ①解消】クーポンに紐付いている正しい店舗コードを自動的にセットして送信
    const targetShopCode = String(coupon.store_code || coupon.storeCode || '001').trim();
    onUseCoupon(coupon, targetShopCode);
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
              src={coupon.imageUrl || coupon.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"}
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
                <span>残り{remaining}回</span>
              </div>
            </div>
          </div>

          {/* Coupon Details */}
          <div className="p-6">
            <h2 className="text-2xl mb-3">{coupon.title}</h2>
            
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{coupon.discount || "特典"}</span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {coupon.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">利用可能店舗</p>
                  <p className="text-gray-700">{coupon.storeName || "全店舗共通"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">有効期限</p>
                  <p className="text-gray-700">{coupon.validUntil || "2026-12-31"}まで</p>
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
                <li>「クーポンを利用する」ボタンを押す</li>
                <li>完了画面をスタッフに確認してもらう</li>
              </ol>
            </div>

            <button
              onClick={handleUseClick}
              className="w-full py-4 rounded-xl text-white shadow-lg transition-all duration-200 hover:opacity-90"
              style={{ 
                background: rankConfig.bgGradient
              }}
            >
              クーポンを利用する
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
            
            <p className="text-sm text-orange-600 mb-6 text-center">
              残り使用回数: {remaining}回 → {remaining - 1}回
            </p>
            
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