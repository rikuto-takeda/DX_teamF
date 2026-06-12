import { useState } from 'react';
import { UsageRecord } from '../../App';
import { mockCoupons, mockStores, mockUsers } from '../../utils/mockData';
import { Download, TrendingUp, Users, Gift, Store, Filter, FileDown, X, Loader2, Check, Database, FileText, BarChart3, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface UsageAnalyticsProps {
  usageRecords: UsageRecord[];
}

type ExportStep = 'config' | 'extracting' | 'creating' | 'downloading' | 'complete';

export function UsageAnalytics({ usageRecords }: UsageAnalyticsProps) {
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
    csvSize: 0
  });
  const [csvData, setCsvData] = useState({
    content: '',
    filename: ''
  });

  // 統計情報の計算
  const totalUsages = usageRecords.length;
  const uniqueUsers = new Set(usageRecords.map(r => r.userId)).size;
  const uniqueCoupons = new Set(usageRecords.map(r => r.couponId)).size;
  const uniqueStores = new Set(usageRecords.map(r => r.storeId)).size;

  // クーポン別使用回数
  const couponUsageCount = usageRecords.reduce((acc, record) => {
    acc[record.couponId] = (acc[record.couponId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 店舗別使用回数
  const storeUsageCount = usageRecords.reduce((acc, record) => {
    acc[record.storeId] = (acc[record.storeId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ユーザー別使用回数
  const userUsageCount = usageRecords.reduce((acc, record) => {
    acc[record.userId] = (acc[record.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // クロス集計: クーポン×会員ランク
  const getCouponRankCrossTab = () => {
    const crossTab: Record<string, Record<string, number>> = {};
    
    usageRecords.forEach(record => {
      const user = Object.values(mockUsers).find(u => u.id === record.userId);
      const rank = user?.rank || 'UNKNOWN';
      
      if (!crossTab[record.couponId]) {
        crossTab[record.couponId] = {};
      }
      crossTab[record.couponId][rank] = (crossTab[record.couponId][rank] || 0) + 1;
    });
    
    return crossTab;
  };

  // 相関分析: クーポン使用回数と会員ランクレベルの相関
  const calculateCouponRankCorrelation = () => {
    const rankValue: Record<string, number> = {
      'BLUE': 1,
      'BRONZE': 2,
      'SILVER': 3,
      'GOLD': 4
    };

    const couponRankData: { couponId: string; avgRank: number; usageCount: number; couponTitle: string }[] = [];

    Object.entries(couponUsageCount).forEach(([couponId, count]) => {
      const couponRecords = usageRecords.filter(r => r.couponId === couponId);
      const rankSum = couponRecords.reduce((sum, record) => {
        const user = Object.values(mockUsers).find(u => u.id === record.userId);
        return sum + (rankValue[user?.rank || 'BLUE'] || 1);
      }, 0);
      const avgRank = rankSum / couponRecords.length;
      const coupon = mockCoupons.find(c => c.id === couponId);
      
      couponRankData.push({
        couponId,
        avgRank,
        usageCount: count,
        couponTitle: coupon?.title || 'Unknown'
      });
    });

    // ピアソン相関係数の計算
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

  // 条件に基づいてデータをフィルタリング
  const getFilteredRecords = () => {
    let filtered = usageRecords;

    // 期間でフィルタリング
    if (exportConfig.startDate) {
      filtered = filtered.filter(r => new Date(r.usedAt) >= new Date(exportConfig.startDate));
    }
    if (exportConfig.endDate) {
      const endDate = new Date(exportConfig.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.usedAt) <= endDate);
    }

    return filtered;
  };

  // データ種別に応じたCSV生成（ステップ処理版）
  const generateCSVWithSteps = async () => {
    const filtered = getFilteredRecords();

    if (filtered.length === 0) {
      toast.error('指定条件に一致するデータがありません');
      return;
    }

    // ステップ1: データ抽出・加工
    setExportStep('extracting');
    setExportStats({
      totalRecords: usageRecords.length,
      filteredRecords: filtered.length,
      processedRows: 0,
      csvSize: 0
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    switch (exportConfig.dataType) {
      case 'all':
        // 全データ: 利用明細
        headers = ['利用日時', 'ユーザーID', 'ユーザー名', 'ランク', 'クーポン名', '店舗名', '割引内容'];
        rows = filtered.map(record => {
          const user = Object.values(mockUsers).find(u => u.id === record.userId);
          return [
            new Date(record.usedAt).toLocaleString('ja-JP'),
            record.userId,
            user?.name || '-',
            user?.rank || '-',
            record.couponTitle,
            record.storeName,
            record.discount
          ];
        });
        filename = `利用明細_${getDateString()}`;
        break;

      case 'users':
        // ユーザー別集計（フィルタリング後のデータで再集計）
        headers = ['ユーザーID', 'ユーザー名', 'ランク', '利用回数', '最終利用日'];
        const filteredUserCount = filtered.reduce((acc, record) => {
          acc[record.userId] = (acc[record.userId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const userStats = Object.entries(filteredUserCount).map(([userId, count]) => {
          const user = Object.values(mockUsers).find(u => u.id === userId);
          const userRecords = filtered.filter(r => r.userId === userId);
          const lastUsed = userRecords.sort((a, b) => 
            new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
          )[0]?.usedAt;
          return [
            userId,
            user?.name || '-',
            user?.rank || '-',
            count.toString(),
            lastUsed ? new Date(lastUsed).toLocaleDateString('ja-JP') : '-'
          ];
        });
        rows = userStats.sort((a, b) => parseInt(b[3]) - parseInt(a[3]));
        filename = `ユーザー別集計_${getDateString()}`;
        break;

      case 'coupons':
        // クーポン別集計（フィルタリング後のデータで再集計）
        headers = ['クーポンID', 'クーポン名', '店舗名', '必要ランク', '利用回数', '割引内容'];
        const filteredCouponCount = filtered.reduce((acc, record) => {
          acc[record.couponId] = (acc[record.couponId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const couponStats = Object.entries(filteredCouponCount).map(([couponId, count]) => {
          const coupon = mockCoupons.find(c => c.id === couponId);
          return [
            couponId,
            coupon?.title || '-',
            coupon?.storeName || '-',
            coupon?.requiredRank || '-',
            count.toString(),
            coupon?.discount || '-'
          ];
        });
        rows = couponStats.sort((a, b) => parseInt(b[4]) - parseInt(a[4]));
        filename = `クーポン別集計_${getDateString()}`;
        break;

      case 'stores':
        // 店舗別集計（フィルタリング後のデータで再集計）
        headers = ['店舗ID', '店舗名', '店舗コード', '利用回数', 'クーポン数'];
        const filteredStoreCount = filtered.reduce((acc, record) => {
          acc[record.storeId] = (acc[record.storeId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const storeStats = Object.entries(filteredStoreCount).map(([storeId, count]) => {
          const store = mockStores.find(s => s.id === storeId);
          const storeCoupons = new Set(
            filtered.filter(r => r.storeId === storeId).map(r => r.couponId)
          ).size;
          return [
            storeId,
            store?.name || '-',
            store?.code || '-',
            count.toString(),
            storeCoupons.toString()
          ];
        });
        rows = storeStats.sort((a, b) => parseInt(b[3]) - parseInt(a[3]));
        filename = `店舗別集計_${getDateString()}`;
        break;
    }

    setExportStats(prev => ({ ...prev, processedRows: rows.length }));

    // ステップ2: CSVファイル作成
    setExportStep('creating');
    await new Promise(resolve => setTimeout(resolve, 1200));

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // ステップ3: ダウンロード実行
    setExportStep('downloading');
    await new Promise(resolve => setTimeout(resolve, 800));

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();

    // ステップ4: 完了
    setExportStep('complete');
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(`CSVファイルをダウンロードしました（${filtered.length}件）`);
    setShowExportModal(false);
    setExportStep('config');
  };

  const getDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 簡易エクスポート（全データ・期間指定なし）
  const exportToCSV = () => {
    const headers = ['利用日時', 'ユーザーID', 'ユーザー名', 'クーポン名', '店舗名', '割引内容'];
    const rows = usageRecords.map(record => {
      const user = Object.values(mockUsers).find(u => u.id === record.userId);
      return [
        new Date(record.usedAt).toLocaleString('ja-JP'),
        record.userId,
        user?.name || '-',
        record.couponTitle,
        record.storeName,
        record.discount
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usage_report_${getDateString()}.csv`;
    link.click();
    
    toast.success('CSVファイルをダウンロードしました');
  };

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">累計使用回数</p>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl text-blue-600">{totalUsages}</p>
          <p className="text-xs text-gray-500 mt-1">回</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">利用ユーザー数</p>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl text-green-600">{uniqueUsers}</p>
          <p className="text-xs text-gray-500 mt-1">人</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">使用クーポン種類</p>
            <Gift className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl text-purple-600">{uniqueCoupons}</p>
          <p className="text-xs text-gray-500 mt-1">種類</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">利用店舗数</p>
            <Store className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl text-orange-600">{uniqueStores}</p>
          <p className="text-xs text-gray-500 mt-1">店舗</p>
        </div>
      </div>

      {/* CSVエクスポート */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg mb-1">データエクスポート（詳細設定）</h3>
            <p className="text-sm text-gray-600">期間・データ種別を指定してCSVダウンロード</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>条件指定してエクスポート</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 mb-1">利用明細</p>
            <p className="text-sm text-blue-800">全データ形式</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-600 mb-1">ユーザー別</p>
            <p className="text-sm text-green-800">集計データ</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-600 mb-1">クーポン別</p>
            <p className="text-sm text-purple-800">集計データ</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-600 mb-1">店舗別</p>
            <p className="text-sm text-orange-800">集計データ</p>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">簡易エクスポート（全データ・期間指定なし）</p>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>簡易CSVダウンロード</span>
            </button>
          </div>
        </div>

        {totalUsages === 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ℹ️ 現在、エクスポート可能なデータがありません。クーポンを使用すると利用履歴が記録されます。
            </p>
          </div>
        )}
      </div>

      {/* 条件指定クスポートモーダル */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            {exportStep === 'config' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg mb-1">CSVエクスポート条件指定</h3>
                    <p className="text-sm text-gray-600">期間とデータ種別を選択してください</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowExportModal(false);
                      setExportStep('config');
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 期間指定 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm mb-3">📅 期間指定</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">開始日</label>
                        <input
                          type="date"
                          value={exportConfig.startDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">終了日</label>
                        <input
                          type="date"
                          value={exportConfig.endDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ※ 未指定の場合は全期間のデータを出力します
                    </p>
                  </div>

                  {/* データ種別選択 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm mb-3">📊 データ種別</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                        <input
                          type="radio"
                          name="dataType"
                          value="all"
                          checked={exportConfig.dataType === 'all'}
                          onChange={(e) => setExportConfig({ ...exportConfig, dataType: e.target.value as any })}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm">利用明細（全データ）</p>
                          <p className="text-xs text-gray-500">利用日時、ユーザー、クーポン、店舗など</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                        <input
                          type="radio"
                          name="dataType"
                          value="users"
                          checked={exportConfig.dataType === 'users'}
                          onChange={(e) => setExportConfig({ ...exportConfig, dataType: e.target.value as any })}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm">ユーザー別集計</p>
                          <p className="text-xs text-gray-500">ユーザーID、ランク、利用回数、最終利用日</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                        <input
                          type="radio"
                          name="dataType"
                          value="coupons"
                          checked={exportConfig.dataType === 'coupons'}
                          onChange={(e) => setExportConfig({ ...exportConfig, dataType: e.target.value as any })}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm">クーポン別集計</p>
                          <p className="text-xs text-gray-500">クーポン名、店舗名、ランク、利用回数</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                        <input
                          type="radio"
                          name="dataType"
                          value="stores"
                          checked={exportConfig.dataType === 'stores'}
                          onChange={(e) => setExportConfig({ ...exportConfig, dataType: e.target.value as any })}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm">店舗別集計</p>
                          <p className="text-xs text-gray-500">店舗名、店舗コード、利用回数、クーポン数</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* フロー説明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>📋 エクスポートフロー：</strong><br />
                      条件指定 → データ抽出・加工 → CSVファイル作成 → ダウンロード実行
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowExportModal(false);
                        setExportStep('config');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={generateCSVWithSteps}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>CSVダウンロード</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ステップ1: データ抽出・加工画面 */}
            {exportStep === 'extracting' && (
              <div className="text-center py-8">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Database className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl mb-2">データ抽出・加工中</h3>
                <p className="text-sm text-gray-600 mb-6">データベースから条件に合うデータを抽出しています</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">総レコード数</p>
                      <p className="text-lg text-blue-600">{exportStats.totalRecords}件</p>
                    </div>
                    <div>
                      <p className="text-gray-600">抽出件数</p>
                      <p className="text-lg text-green-600">{exportStats.filteredRecords}件</p>
                    </div>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '33%' }}></div>
                </div>
                <p className="text-xs text-gray-500">ステップ 1/3</p>
              </div>
            )}

            {/* ステップ2: CSVファイル作成画面 */}
            {exportStep === 'creating' && (
              <div className="text-center py-8">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl mb-2">CSVファイル作成中</h3>
                <p className="text-sm text-gray-600 mb-6">抽出データをCSV形式に変換しています</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">処理行数</p>
                      <p className="text-lg text-green-600">{exportStats.processedRows}行</p>
                    </div>
                    <div>
                      <p className="text-gray-600">データ種別</p>
                      <p className="text-sm text-gray-800">
                        {exportConfig.dataType === 'all' && '利用明細'}
                        {exportConfig.dataType === 'users' && 'ユーザー別集計'}
                        {exportConfig.dataType === 'coupons' && 'クーポン別集計'}
                        {exportConfig.dataType === 'stores' && '店舗別集計'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '66%' }}></div>
                </div>
                <p className="text-xs text-gray-500">ステップ 2/3</p>
              </div>
            )}

            {/* ステップ3: ダウンロード実行画面 */}
            {exportStep === 'downloading' && (
              <div className="text-center py-8">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Download className="w-8 h-8 text-purple-600 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl mb-2">ダウンロード実行中</h3>
                <p className="text-sm text-gray-600 mb-6">CSVファイルをダウンロードしています</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ファイル形式</span>
                      <span className="text-gray-800">CSV (UTF-8 BOM付き)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">エンコード</span>
                      <span className="text-gray-800">UTF-8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">データ件数</span>
                      <span className="text-purple-600">{exportStats.filteredRecords}件</span>
                    </div>
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '99%' }}></div>
                </div>
                <p className="text-xs text-gray-500">ステップ 3/3</p>
              </div>
            )}

            {/* ステップ4: 完了画面 */}
            {exportStep === 'complete' && (
              <div className="text-center py-8">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                </div>
                <h3 className="text-3xl mb-3 text-green-600">ダウンロード完了！</h3>
                <p className="text-sm text-gray-600 mb-6">CSVファイルのダウンロードが正常に完了しました</p>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">エクスポート件数</p>
                      <p className="text-3xl text-green-600">{exportStats.filteredRecords}</p>
                      <p className="text-xs text-gray-600">件</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">ファイル形式</p>
                      <p className="text-xl text-gray-800 mt-2">CSV</p>
                      <p className="text-xs text-gray-600">UTF-8 BOM付き</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">処理進捗</span>
                      <span className="text-sm text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-sm transition-all duration-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>📁 ファイルの保存先</strong><br />
                    ダウンロードフォルダをご確認ください
                  </p>
                </div>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* クーポン別使用ランキング */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg mb-4">クーポン別使用ランキング</h3>
        {Object.keys(couponUsageCount).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(couponUsageCount)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([couponId, count], index) => {
                const coupon = mockCoupons.find(c => c.id === couponId);
                return (
                  <div key={couponId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm text-purple-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{coupon?.title || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{coupon?.storeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-purple-600">{count}</p>
                      <p className="text-xs text-gray-500">回</p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">データがありません</p>
        )}
      </div>

      {/* 店舗別使用ランキング */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg mb-4">店舗別使用ランキング</h3>
        {Object.keys(storeUsageCount).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(storeUsageCount)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([storeId, count], index) => {
                const store = mockStores.find(s => s.id === storeId);
                return (
                  <div key={storeId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm text-orange-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{store?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">店舗コード: {store?.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-orange-600">{count}</p>
                      <p className="text-xs text-gray-500">回</p>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">データがありません</p>
        )}
      </div>

      {/* 最近の利用履歴 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg mb-4">最近の利用履歴</h3>
        {usageRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">利用日時</th>
                  <th className="px-4 py-2 text-left">ユーザー</th>
                  <th className="px-4 py-2 text-left">クーポン</th>
                  <th className="px-4 py-2 text-left">店舗</th>
                </tr>
              </thead>
              <tbody>
                {usageRecords
                  .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
                  .slice(0, 20)
                  .map((record) => {
                    const user = Object.values(mockUsers).find(u => u.id === record.userId);
                    return (
                      <tr key={record.id} className="border-t border-gray-100">
                        <td className="px-4 py-2">
                          {new Date(record.usedAt).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2">{user?.name || record.userId}</td>
                        <td className="px-4 py-2">{record.couponTitle}</td>
                        <td className="px-4 py-2">{record.storeName}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">データがありません</p>
        )}
      </div>

      {/* クーポン使用回数と会員ランクの相関分析 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg">クーポン使用回数と会員ランクの相関分析</h3>
        </div>
        
        {usageRecords.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 左側: グラフ */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-3">散布図：クーポン使用回数 vs 平均会員ランク</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="avgRank" 
                      name="平均ランクレベル" 
                      domain={[0.5, 4.5]}
                      ticks={[1, 2, 3, 4]}
                      tickFormatter={(value) => {
                        const rankLabels: Record<number, string> = { 1: 'BLUE', 2: 'BRONZE', 3: 'SILVER', 4: 'GOLD' };
                        return rankLabels[value] || '';
                      }}
                    />
                    <YAxis type="number" dataKey="usageCount" name="使用回数" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                              <p className="text-sm text-gray-800">{data.couponTitle}</p>
                              <p className="text-xs text-gray-600">使用回数: {data.usageCount}</p>
                              <p className="text-xs text-gray-600">平均ランク: {data.avgRank.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="クーポン" data={correlationResult.data} fill="#8b5cf6">
                      {correlationResult.data.map((entry, index) => (
                        <Cell
                          key={`cell-scatter-${entry.couponId}-${index}`}
                          fill={entry.avgRank > 2.5 ? '#8b5cf6' : '#f59e0b'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右側: 相関係数の解釈 */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-sm">グラフの見方</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">相関係数</p>
                    <p className="text-2xl text-indigo-600">{correlationResult.correlation.toFixed(3)}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            Math.abs(correlationResult.correlation) >= 0.7 ? 'bg-green-500' :
                            Math.abs(correlationResult.correlation) >= 0.4 ? 'bg-yellow-500' :
                            Math.abs(correlationResult.correlation) >= 0.2 ? 'bg-orange-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${Math.abs(correlationResult.correlation) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">📊 散布図の見方</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      横軸は平均会員ランク、縦軸は使用回数を示します。右上に位置するほど高ランク会員に人気、上部に位置するほど使用頻度が高いクーポンです。
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">📈 相関係数の意味</p>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      プラスの値は高ランク会員ほど使用が多い傾向、マイナスは低ランク会員ほど使用が多い傾向を示します。
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">0.7以上: 強い相関</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-700">0.4-0.7: 中程度の相関</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700">0.2-0.4: 弱い相関</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-gray-700">0.2未満: ほとんど相関なし</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">💡 活用方法</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      ランク別のクーポン利用傾向を把握し、各ランクに適したクーポン配信戦略の立案に活用できます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">データがありません</p>
        )}
      </div>

      {/* クーポン×会員ランクのクロス集計 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg">クーポン×会員ランクのクロス集計</h3>
        </div>
        
        {usageRecords.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 左側: グラフ */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm mb-3">積み上げ棒グラフ：クーポン別の会員ランク別使用回数</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={Object.entries(couponRankCrossTab).map(([couponId, rankCounts], index) => {
                      const coupon = mockCoupons.find(c => c.id === couponId);
                      return {
                        id: `chart-${couponId}-${index}`,
                        couponId: couponId,
                        name: coupon?.title?.substring(0, 15) + '...' || couponId,
                        fullName: coupon?.title || couponId,
                        BLUE: rankCounts['BLUE'] || 0,
                        BRONZE: rankCounts['BRONZE'] || 0,
                        SILVER: rankCounts['SILVER'] || 0,
                        GOLD: rankCounts['GOLD'] || 0
                      };
                    }).slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      interval={0}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                              <p className="text-sm text-gray-800 mb-2">{data.fullName}</p>
                              {payload.map((entry: any, idx: number) => (
                                <p key={`tooltip-${data.id}-${entry.dataKey}-${idx}`} className="text-xs" style={{ color: entry.color }}>
                                  {entry.name}: {entry.value}回
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="BLUE" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="BRONZE" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="SILVER" stackId="a" fill="#6b7280" />
                    <Bar dataKey="GOLD" stackId="a" fill="#fbbf24" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右側: クロス集計の解釈 */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h4 className="text-sm">グラフの見方</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">📊 積み上げ棒グラフの見方</p>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      各クーポンの棒は会員ランク別の使用回数を色分けして積み上げています。棒が高いほど総使用回数が多く、色の割合で各ランクの利用傾向が分かります。
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">🎯 分析のポイント</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      特定ランクの色が多いクーポンは、そのランクに人気があります。バランスよく色が分布しているクーポンは全ランクに利用されています。
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">ランク別の色凡例</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-700">BLUE: 新規会員向けクーポン</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-gray-700">BRONZE: 基本特典</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-gray-700">SILVER: 中級特典</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-700">GOLD: プレミアム特典</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">💡 活用方法</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      クーポンごとの利用ランク分布を確認し、各ランクのニーズに合ったクーポン企画や、利用が少ないランクへのプロモーション施策の検討に活用できます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">データがありません</p>
        )}
      </div>
    </div>
  );
}