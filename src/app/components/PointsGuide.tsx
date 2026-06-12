import { pointConditions, rankThresholds } from '../utils/pointsConfig';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { rankConfigs } from '../utils/rankConfig';

interface PointsGuideProps {
  onBack: () => void;
}

export function PointsGuide({ onBack }: PointsGuideProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 pt-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-white" />
          <h1 className="text-2xl text-white">ポイント獲得ガイド</h1>
        </div>
        <p className="text-white/90 text-sm">
          銀行取引でポイントを貯めてランクアップしよう
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* ランク判定基準 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg mb-4">ランク判定基準</h2>
          <div className="space-y-3">
            {rankThresholds.map((threshold) => (
              <div
                key={threshold.rank}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: rankConfigs[threshold.rank as keyof typeof rankConfigs].bgColor }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: rankConfigs[threshold.rank as keyof typeof rankConfigs].color }}
                  />
                  <span className="text-sm">{threshold.name}会員</span>
                </div>
                <div className="text-sm">
                  {threshold.minPoints === threshold.maxPoints 
                    ? `${threshold.minPoints}pt`
                    : threshold.maxPoints > 100000
                    ? `${threshold.minPoints}pt以上`
                    : `${threshold.minPoints}〜${threshold.maxPoints}pt`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ポイント獲得条件 */}
        {pointConditions.map((condition) => (
          <div key={condition.category} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg mb-4">{condition.category}</h2>
            <div className="space-y-3">
              {condition.items.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm mb-1">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg text-blue-600">+{item.points}</p>
                    <p className="text-xs text-gray-500">pt</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ポイント計算例 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg mb-4">💡 ポイント計算例</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>給与受取</span>
              <span className="text-blue-600">+20pt</span>
            </div>
            <div className="flex justify-between">
              <span>積立NISA契約</span>
              <span className="text-blue-600">+30pt</span>
            </div>
            <div className="flex justify-between">
              <span>公共料金決済</span>
              <span className="text-blue-600">+10pt</span>
            </div>
            <div className="flex justify-between">
              <span>アプリログイン</span>
              <span className="text-blue-600">+5pt</span>
            </div>
            <div className="flex justify-between">
              <span>継続利用（2年）</span>
              <span className="text-blue-600">+2pt</span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between">
              <span>合計</span>
              <span className="text-xl text-blue-600">67pt</span>
            </div>
            <div className="text-center pt-2">
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                → シルバー会員（60pt以上）
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
