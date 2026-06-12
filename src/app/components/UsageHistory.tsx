import { User, UsageRecord } from '../App';
import { rankConfigs } from '../utils/rankConfig';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';

interface UsageHistoryProps {
  user: User;
  usageRecords: UsageRecord[];
  onBack: () => void;
}

export function UsageHistory({ user, usageRecords, onBack }: UsageHistoryProps) {
  const rankConfig = rankConfigs[user.rank];
  
  // ユーザーの使用履歴のみをフィルタリングして、新しい順にソート
  const userRecords = usageRecords
    .filter(record => record.userId === user.id)
    .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>マイページへ戻る</span>
        </button>
        
        <h1 className="text-2xl text-white mb-2">クーポン使用履歴</h1>
        <p className="text-white/90 text-sm">
          これまでに利用したクーポンの履歴
        </p>
      </div>

      {/* History Cards */}
      <div className="px-6 py-6 space-y-4">
        {userRecords.length > 0 ? (
          userRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg mb-1">{record.couponTitle}</h3>
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <Tag className="w-4 h-4" />
                    <span>{record.discount}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  利用済み
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{record.storeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(record.usedAt)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl opacity-20">📋</div>
            <p className="text-gray-500">まだクーポンを使用していません</p>
            <p className="text-sm text-gray-400 mt-2">
              クーポンを使用すると、ここに履歴が表示されます
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {userRecords.length > 0 && (
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">累計使用回数</p>
            <p className="text-3xl" style={{ color: rankConfig.color }}>
              {userRecords.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">回</p>
          </div>
        </div>
      )}
    </div>
  );
}
