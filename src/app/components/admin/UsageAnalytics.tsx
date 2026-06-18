// UsageAnalytics.tsx
import { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, Gift, Store, Filter, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface DBUsageRecord {
  id: number;
  userId: string | number;
  username: string;
  userRank: 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
  couponId: string | number;
  couponTitle: string;
  discount: string;
  storeId: string | number;
  storeName: string;
  storeCode: string;
  usedAt: string;
}

type ExportStep = 'config' | 'extracting' | 'creating' | 'downloading' | 'complete';

export function UsageAnalytics() {
  const [usageRecords, setUsageRecords] = useState<DBUsageRecord[]>([]);
  const [masterStats, setMasterStats] = useState({ coupons: 0, stores: 0 });
  const [loading, setLoading] = useState(true);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStep, setExportStep] = useState<ExportStep>('config');
  const [exportConfig, setExportConfig] = useState({
    startDate: '',
    endDate: '',
    dataType: 'all' as 'all' | 'users' | 'coupons' | 'stores'
  });
  const [exportStats, setExportStats] = useState({
    totalRecords: 0,
    filteredRecords: 0,
    processedRows: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('http://localhost:5000/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setUsageRecords(data.usageRecords || []);
          setMasterStats({
            coupons: data.uniqueCouponsCount || 0,
            stores: data.uniqueStoresCount || 0
          });
        }
      } catch (error) {
        console.error("通信エラー:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // 💡 型を文字列に完全統一して集計（すれ違いを100%防止）
  const totalUsages = usageRecords.length;
  const uniqueUsers = new Set(usageRecords.map(r => r.userId?.toString())).size;
  const uniqueCoupons = masterStats.coupons || new Set(usageRecords.map(r => r.couponId?.toString())).size;
  const uniqueStores = masterStats.stores || new Set(usageRecords.map(r => r.storeId?.toString())).size;

  // クーポン別使用回数
  const couponUsageCount = usageRecords.reduce((acc, record) => {
    const cid = record.couponId?.toString() || 'unknown';
    acc[cid] = (acc[cid] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 店舗別使用回数
  const storeUsageCount = usageRecords.reduce((acc, record) => {
    const sid = record.storeId?.toString() || 'unknown';
    acc[sid] = (acc[sid] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // クロス集計
  const getCouponRankCrossTab = () => {
    const crossTab: Record<string, Record<string, number>> = {};
    usageRecords.forEach(record => {
      const cid = record.couponId?.toString() || 'unknown';
      const rank = record.userRank || 'BLUE';
      if (!crossTab[cid]) {
        crossTab[cid] = {};
      }
      crossTab[cid][rank] = (crossTab[cid][rank] || 0) + 1;
    });
    return crossTab;
  };

  // 相関分析
  const calculateCouponRankCorrelation = () => {
    const rankValue: Record<string, number> = { 'BLUE': 1, 'BRONZE': 2, 'SILVER': 3, 'GOLD': 4 };
    const couponRankData: { couponId: string; avgRank: number; usageCount: number; couponTitle: string }[] = [];

    Object.entries(couponUsageCount).forEach(([couponId, count]) => {
      const couponRecords = usageRecords.filter(r => r.couponId?.toString() === couponId);
      const rankSum = couponRecords.reduce((sum, record) => sum + (rankValue[record.userRank] || 1), 0);
      const avgRank = couponRecords.length > 0 ? rankSum / couponRecords.length : 1;
      const firstRecord = couponRecords[0];
      
      couponRankData.push({
        couponId,
        avgRank,
        usageCount: count,
        couponTitle: firstRecord ? firstRecord.couponTitle : '不明なクーポン'
      });
    });

    if (couponRankData.length < 2) {
      return { correlation: 0, data: couponRankData };
    }

    const n = couponRankData.length;
    const sumX = couponRankData.reduce((sum, d) => sum + d.avgRank, 0);
    const sumY = couponRankData.reduce((sum, d) => sum + d.usageCount, 0);
    const sumXY = couponRankData.reduce((sum, d) => sum + d.avgRank * d.usageCount, 0);
    const sumX2 = couponRankData.reduce((sum, d) => sum + d.avgRank * d.avgRank, 0);
    const sumY2 = couponRankData.reduce((sum, d) => sum + d.usageCount * d.usageCount, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return { correlation, data: couponRankData };
  };

  const couponRankCrossTab = getCouponRankCrossTab();
  const correlationResult = calculateCouponRankCorrelation();

  const generateCSVWithSteps = async () => {
    toast.info("CSV出力を開始します");
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-12 text-gray-500">本番DBの利用履歴を解析中...</div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">累計使用回数（消込数）</p>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl text-blue-600">{totalUsages}</p>
              <p className="text-xs text-gray-500 mt-1">回</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">アクティブユーザー数</p>
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl text-green-600">{uniqueUsers}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">登録クーポン総数</p>
                <Gift className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl text-purple-600">{uniqueCoupons}</p>
              <p className="text-xs text-gray-500 mt-1">種類</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">提携店舗数</p>
                <Store className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl text-orange-600">{uniqueStores}</p>
              <p className="text-xs text-gray-500 mt-1">店舗</p>
            </div>
          </div>

          {/* クーポン別使用ランキング */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg mb-4">実利用クーポンランキング（Top 10）</h3>
            {Object.keys(couponUsageCount).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(couponUsageCount)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([couponId, count], index) => {
                    const matched = usageRecords.find(r => r.couponId?.toString() === couponId);
                    return (
                      <div key={couponId} className="flex items-center gap-3 border-b border-gray-50 pb-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-700 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{matched?.couponTitle || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{matched?.storeName || '複数店舗対象'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-purple-600">{count}</span>
                          <span className="text-xs text-gray-500 ml-0.5">回利用</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">消込データ（USED）がまだありません</p>
            )}
          </div>

          {/* 最近の利用履歴 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg mb-4">リアルタイム利用ログ（直近20件）</h3>
            {usageRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">利用日時</th>
                      <th className="px-4 py-2 text-left">ユーザー</th>
                      <th className="px-4 py-2 text-left">会員ランク</th>
                      <th className="px-4 py-2 text-left">使用クーポン</th>
                      <th className="px-4 py-2 text-left">消込店舗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usageRecords
                      .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
                      .slice(0, 20)
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(record.usedAt).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 font-medium">{record.username}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100 border">{record.userRank}</span>
                          </td>
                          <td className="px-4 py-3 text-purple-600 font-medium">{record.couponTitle}</td>
                          <td className="px-4 py-3 text-gray-700">{record.storeName}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">利用履歴がありません</p>
            )}
          </div>

          {/* 相関分析グラフ */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg">データサイエンス分析：クーポン使用頻度と会員ランクの相関</h3>
            </div>
            {usageRecords.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="avgRank" 
                        name="平均ランクレベル" 
                        domain={[0.5, 4.5]}
                        ticks={[1, 2, 3, 4]}
                        tickFormatter={(v) => ({ 1: 'BLUE', 2: 'BRONZE', 3: 'SILVER', 4: 'GOLD' }[v] || '')}
                      />
                      <YAxis type="number" dataKey="usageCount" name="使用回数" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="クーポン" data={correlationResult.data}>
                        {correlationResult.data.map((entry, index) => (
                          <Cell key={`sc-${index}`} fill={entry.avgRank > 2.5 ? '#8b5cf6' : '#f59e0b'} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 text-sm space-y-3">
                  <p className="font-bold text-gray-700">📈 ピアソン相関係数</p>
                  <p className="text-3xl font-extrabold text-indigo-600">{correlationResult.correlation.toFixed(3)}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    本番データベース内の全消込レコードから実数値をリアルタイム計算しています。
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">分析対象データが不足しています</p>
            )}
          </div>

          {/* クロス集計 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">クロス集計：クーポン別 会員ランク内訳</h3>
            </div>
            {usageRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={Object.entries(couponRankCrossTab).map(([couponId, rankCounts]) => {
                    const matched = usageRecords.find(r => r.couponId?.toString() === couponId);
                    return {
                      name: matched?.couponTitle?.substring(0, 10) + '...' || couponId,
                      BLUE: rankCounts['BLUE'] || 0,
                      BRONZE: rankCounts['BRONZE'] || 0,
                      SILVER: rankCounts['SILVER'] || 0,
                      GOLD: rankCounts['GOLD'] || 0
                    };
                  }).slice(0, 8)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontSize: '11px' }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="BLUE" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="BRONZE" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="SILVER" stackId="a" fill="#6b7280" />
                  <Bar dataKey="GOLD" stackId="a" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">データがありません</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}