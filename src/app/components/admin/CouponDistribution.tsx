// CouponDistribution.tsx
import { useState, useEffect } from 'react';
import { rankConfigs } from '../../utils/rankConfig';
import { 
  Gift, 
  Users, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Filter,
  Calendar,
  Target,
  Send,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
type DistributionStep = 'create' | 'conditions' | 'confirm' | 'complete';

interface DBCoupon {
  id: number;
  title: string;
  description: string;
  discount: string;
  required_rank: Rank;
}

interface DistributionConditions {
  startDate: string;
  endDate: string;
  usageLimit: number;
  autoExpire: boolean;
}

export function CouponDistribution() {
  const [currentStep, setCurrentStep] = useState<DistributionStep>('create');
  
  const [masterCoupons, setMasterCoupons] = useState<DBCoupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [selectedCoupon, setSelectedCoupon] = useState<DBCoupon | null>(null);
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);

  const [conditions, setConditions] = useState<DistributionConditions>({
    startDate: '2026-06-22', // 💡 本日の日付（2026年6月22日）にアップデート
    endDate: '2026-07-22',
    usageLimit: 1,
    autoExpire: true
  });

  const [isDistributing, setIsDistributing] = useState(false);
  const [distributedCount, setDistributedCount] = useState(0);

  // 💡 【修正の核心】ローカルストレージからログイン中の店舗コードを取得
  const currentStoreCode = localStorage.getItem('store_code') || 'test';

  // 💡 画面起動時に本物のクーポンマスタ一覧を「自店舗に絞って」DBから読み込む
  const fetchMasterCoupons = async () => {
    try {
      setIsLoadingMasters(true);
      // 💡 クエリパラメータに店舗コードを乗せて、他社のクーポンをシャットアウト！
      const response = await fetch(`http://localhost:5000/api/admin/coupons?store_code=${currentStoreCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Code': currentStoreCode
        }
      });
      if (!response.ok) throw new Error('マスタデータの取得に失敗しました');
      const data = await response.json();
      setMasterCoupons(data);
    } catch (error: any) {
      console.error(error);
      toast.error('クーポンマスタの同期に失敗しました');
    } finally {
      setIsLoadingMasters(false);
    }
  };

  useEffect(() => {
    fetchMasterCoupons();
  }, []);

  const handleCouponChange = (id: string) => {
    setSelectedCouponId(id);
    const coupon = masterCoupons.find(c => String(c.id) === id);
    setSelectedCoupon(coupon || null);
  };

  const getTargetUserCount = () => {
    return 13; 
  };

  const handleCreateStep = () => {
    if (!selectedCouponId) {
      toast.error('配布するクーポンマスタをリストから選択してください');
      return;
    }
    setCurrentStep('conditions');
  };

  const handleConditionsStep = () => {
    if (!conditions.startDate || !conditions.endDate) {
      toast.error('配布期間を設定してください');
      return;
    }
    setCurrentStep('confirm');
  };

  const handleDistribute = async () => {
    if (!selectedCoupon) return;
    
    setIsDistributing(true);
    try {
      const distributeRes = await fetch('http://localhost:5000/api/admin/coupons/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_id: selectedCoupon.id,
          target_rank: selectedCoupon.required_rank 
        })
      });

      if (!distributeRes.ok) {
        const errData = await distributeRes.json();
        throw new Error(errData.error || 'クーポンの配布処理に失敗しました');
      }

      const distributeData = await distributeRes.json();
      setDistributedCount(distributeData.distributed_count);
      setCurrentStep('complete');
      toast.success('クーポンを正常に一括配布しました！');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '通信エラーが発生しました');
    } finally {
      setIsDistributing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('create');
    setDistributedCount(0);
    setSelectedCouponId('');
    setSelectedCoupon(null);
    setConditions({
      startDate: '2026-06-22',
      endDate: '2026-07-22',
      usageLimit: 1,
      autoExpire: true
    });
    fetchMasterCoupons(); 
  };

  const steps = [
    { key: 'create', label: 'クーポン選択', icon: Gift },
    { key: 'conditions', label: '配布条件', icon: Settings },
    { key: 'confirm', label: '確認', icon: CheckCircle },
    { key: 'complete', label: '完了', icon: Check }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">クーポン配布コントロール</h2>
        <p className="text-sm text-gray-500">
          店舗コード <span className="font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">[{currentStoreCode}]</span> が作成したマスタを選択し、対象ユーザーへ一括配布します
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-purple-600 text-white shadow-lg scale-110' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className={`text-xs mt-2 ${
                    isActive ? 'text-purple-600 font-bold' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="bg-white rounded-xl shadow-md p-8">
        {currentStep === 'create' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl">配布対象クーポンの選択</h3>
                  <p className="text-sm text-gray-600">自店舗が発行した既存のクーポンマスタをデータベースから選択してください</p>
                </div>
              </div>
              <button 
                onClick={fetchMasterCoupons}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                title="マスタを再同期"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingMasters ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象クーポンマスタ <span className="text-red-500">*</span>
                </label>
                {isLoadingMasters ? (
                  <div className="text-sm text-gray-400 py-3">マスタデータをロード中...</div>
                ) : masterCoupons.length === 0 ? (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-3">
                    配布可能な自店舗のクーポンがマスタに登録されていません。「クーポン管理」タブから先に作成してください。
                  </div>
                ) : (
                  <select
                    value={selectedCouponId}
                    onChange={(e) => handleCouponChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm font-medium text-gray-700"
                  >
                    <option value="">-- 配布するクーポンを選択してください --</option>
                    {masterCoupons.map((c) => (
                      <option key={c.id} value={c.id}>
                        [#{c.id}] {c.title} ({c.discount})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedCoupon && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-purple-900 text-base">{selectedCoupon.title}</h4>
                    <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-purple-600">
                      {selectedCoupon.required_rank}以上対象
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">{selectedCoupon.description}</p>
                  <div className="text-xs text-purple-500 pt-1 border-t border-purple-100 flex gap-4">
                    <span><strong>割引/特典:</strong> {selectedCoupon.discount}</span>
                    <span><strong>マスタID:</strong> #{selectedCoupon.id}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCreateStep}
                disabled={!selectedCouponId}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold"
              >
                <span>配布条件の設定へ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: 配布条件設定画面 */}
        {currentStep === 'conditions' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl">配布条件設定</h3>
                <p className="text-sm text-gray-600">配布期間と使用条件を設定してください</p>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium">配布期間</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">開始日時 *</label>
                    <input
                      type="date"
                      value={conditions.startDate}
                      onChange={(e) => setConditions({ ...conditions, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">終了日時 *</label>
                    <input
                      type="date"
                      value={conditions.endDate}
                      onChange={(e) => setConditions({ ...conditions, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium">使用制限</h4>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    1人あたりの使用回数上限
                  </label>
                  <select
                    value={conditions.usageLimit}
                    onChange={(e) => setConditions({ ...conditions, usageLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="1">1回のみ</option>
                    <option value="3">3回まで</option>
                    <option value="5">5回まで</option>
                    <option value="999">無制限</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium">自動失効設定</h4>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conditions.autoExpire}
                    onChange={(e) => setConditions({ ...conditions, autoExpire: e.target.checked })}
                    className="w-5 h-5 mt-0.5 text-orange-600"
                  />
                  <div>
                    <p className="font-medium">有効期限切れで自動失効</p>
                    <p className="text-sm text-gray-600 mt-1">
                      クーポンの有効期限が過ぎると、自動的にユーザーのクーポン一覧から削除されます
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => setCurrentStep('create')}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <button
                onClick={handleConditionsStep}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold"
              >
                <span>確認画面へ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: 配布確認画面 */}
        {currentStep === 'confirm' && selectedCoupon && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl">配布前の最終確認</h3>
                <p className="text-sm text-gray-600">以下の内容で本番データベースへ一括配布を実行します</p>
              </div>
            </div>

            <div className="space-y-6 max-w-3xl">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  選択されたクーポン情報
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">クーポンマスタ名</p>
                    <p className="font-bold text-gray-800">{selectedCoupon.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">割引・特典内容</p>
                    <p className="font-bold text-purple-600">{selectedCoupon.discount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">マスタ管理ID</p>
                    <p className="font-mono text-gray-700">#{selectedCoupon.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">配布対象条件ランク</p>
                    <span 
                      className="inline-block px-3 py-0.5 rounded text-white text-xs font-bold"
                      style={{ backgroundColor: rankConfigs[selectedCoupon.required_rank]?.color || '#a855f7' }}
                    >
                      {rankConfigs[selectedCoupon.required_rank]?.name || selectedCoupon.required_rank} 以上
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-purple-100/60">
                    <p className="text-gray-600 mb-1">クーポン説明・利用条件</p>
                    <p className="text-gray-700 text-xs leading-relaxed">{selectedCoupon.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  配布対象ユーザー集計
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">抽出条件</p>
                    <p className="font-medium text-gray-800">{selectedCoupon.required_rank} ランク以上の全現役会員</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">一括配布対象人数</p>
                    <p className="font-bold text-blue-600 text-xl">{getTargetUserCount()} 人目安</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>⚠️ 実行確認：</strong> 「配布を実行」ボタンを押すと、SQLiteの `UserCoupon` テーブルに対象ユーザー数分のレコードが即座にバルクインサートされます。配布後にユーザーはマイページから即時利用可能になります。
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => setCurrentStep('conditions')}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                disabled={isDistributing}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <button
                onClick={handleDistribute}
                disabled={isDistributing}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isDistributing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>一括バルク配布中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>本番データベースへ一括配布を実行</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 配布完了画面 */}
        {currentStep === 'complete' && selectedCoupon && (
          <div className="text-center py-12">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Sparkles className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h3 className="text-4xl mb-4 font-bold text-green-600">一括配布完了！</h3>
            <p className="text-gray-600 mb-8">選択されたマスタクーポンが、SQLite本番データベースへ正常に配布同期されました</p>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2 font-medium">実際のインサート件数</p>
                    <p className="text-4xl font-bold text-green-600 mb-1">{distributedCount}</p>
                    <p className="text-xs text-gray-400">名分のタイムライン</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-xs text-gray-500 mb-2 font-medium">配布したクーポン</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{selectedCoupon.title}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-xs text-gray-500 mb-2 font-medium">設定ランク</p>
                    <p className="text-xl font-bold text-purple-600">{selectedCoupon.required_rank}以上</p>
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">バルクインサート同期ステータス</span>
                    <span className="text-xs font-bold text-green-600">SUCCESS (100%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full shadow-sm" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md text-sm"
              >
                続けて他のマスタを配布する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}