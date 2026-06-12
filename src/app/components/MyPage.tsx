import { User } from '../App';
import { rankConfigs, getNextRank, getPointsToNextRank } from '../utils/rankConfig';
import { Trophy, Gift, LogOut, ChevronRight, Calendar, History, TrendingUp } from 'lucide-react';

interface MyPageProps {
  user: User;
  onViewCoupons: () => void;
  onViewHistory: () => void;
  onViewPointsGuide: () => void;
  onLogout: () => void;
}

export function MyPage({ user, onViewCoupons, onViewHistory, onViewPointsGuide, onLogout }: MyPageProps) {
  const rankConfig = rankConfigs[user.rank];
  const nextRank = getNextRank(user.rank);
  const pointsToNext = getPointsToNextRank(user.points, user.rank);
  
  const joinYear = new Date(user.joinDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsOfMembership = currentYear - joinYear;

  return (
    <div className="min-h-screen" style={{ background: rankConfig.bgGradient }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-white">Aoba Link</h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">ログアウト</span>
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">会員名</p>
          <h2 className="text-2xl mb-2">{user.name}</h2>
          <p className="text-xs opacity-75 mb-4">会員ID: {user.id}</p>

          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <p className="text-sm opacity-90">現在のランク</p>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <h3 className="text-4xl">{rankConfig.name}</h3>
            <span className="text-sm opacity-75">会員</span>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-90">
            <Calendar className="w-4 h-4" />
            <span>継続年数: {yearsOfMembership}年</span>
          </div>
        </div>
      </div>

      {/* Points Section */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">現在のポイント</p>
              <p className="text-3xl" style={{ color: rankConfig.color }}>
                {user.points.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">ポイント</p>
            </div>
            <div className="text-right">
              <Trophy className="w-12 h-12 mx-auto mb-1" style={{ color: rankConfig.color }} />
              <p className="text-xs text-gray-600">{rankConfig.name}</p>
            </div>
          </div>

          {nextRank && pointsToNext !== null && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">次のランクまで</p>
                <p className="text-sm" style={{ color: rankConfigs[nextRank].color }}>
                  {rankConfigs[nextRank].name}
                </p>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((user.points / rankConfigs[nextRank].minPoints) * 100, 100)}%`,
                    backgroundColor: rankConfig.color
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                あと {pointsToNext.toLocaleString()} ポイント
              </p>
            </div>
          )}

          {!nextRank && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                🎉 最高ランクに到達しています！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rank Benefits */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg mb-3">ランク特典</h3>
          <p className="text-sm text-gray-600 mb-4">{rankConfig.description}</p>
          <div className="space-y-2">
            {rankConfig.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: rankConfig.color }}
                />
                <p className="text-sm text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Coupons Button */}
      <div className="px-6 mb-4">
        <button
          onClick={onViewCoupons}
          className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: rankConfig.bgColor }}
            >
              <Gift className="w-6 h-6" style={{ color: rankConfig.color }} />
            </div>
            <div className="text-left">
              <p className="text-lg">クーポンを見る</p>
              <p className="text-sm text-gray-500">利用可能な特典を確認</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* View History Button */}
      <div className="px-6 mb-4">
        <button
          onClick={onViewHistory}
          className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: rankConfig.bgColor }}
            >
              <History className="w-6 h-6" style={{ color: rankConfig.color }} />
            </div>
            <div className="text-left">
              <p className="text-lg">使用履歴</p>
              <p className="text-sm text-gray-500">クーポンの利用履歴を確認</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* Points Guide Button */}
      <div className="px-6 pb-8">
        <button
          onClick={onViewPointsGuide}
          className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: rankConfig.bgColor }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: rankConfig.color }} />
            </div>
            <div className="text-left">
              <p className="text-lg">ポイント獲得方法</p>
              <p className="text-sm text-gray-500">ランクアップの条件を確認</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}