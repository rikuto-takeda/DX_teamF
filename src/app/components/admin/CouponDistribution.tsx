// CouponDistribution.tsx
import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
type DistributionStep = 'create' | 'conditions' | 'confirm' | 'complete';

interface CouponData {
  title: string;
  description: string;
  discount: string;
  requiredRank: Rank;
  validUntil: string;
  storeName: string;
}

interface DistributionConditions {
  startDate: string;
  endDate: string;
  usageLimit: number;
  autoExpire: boolean;
}

export function CouponDistribution() {
  const [currentStep, setCurrentStep] = useState<DistributionStep>('create');
  const [couponData, setCouponData] = useState<CouponData>({
    title: '',
    description: '',
    discount: '',
    requiredRank: 'BLUE',
    validUntil: '',
    storeName: ''
  });

  const [conditions, setConditions] = useState<DistributionConditions>({
    startDate: '',
    endDate: '',
    usageLimit: 1,
    autoExpire: true
  });

  const [isDistributing, setIsDistributing] = useState(false);
  const [distributedCount, setDistributedCount] = useState(0);

  const getTargetUserCount = () => {
    return 13; 
  };

  const handleCreateStep = () => {
    if (!couponData.title || !couponData.description || !couponData.discount || !couponData.validUntil || !couponData.storeName) {
      toast.error('すべての項目を入力してください');
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

  // 💡 配布実行（バックエンドの required_rank に完全対応）
  const handleDistribute = async () => {
    setIsDistributing(true);
    try {
      // 1. クーポンマスタ作成 API を実行
      const createRes = await fetch('http://localhost:5000/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: couponData.title,
          description: couponData.description,
          required_rank: couponData.requiredRank // 💡 DBのカラム名に適合
        })
      });

      if (!createRes.ok) {
        throw new Error('クーポンマスタの作成に失敗しました');
      }
      const createData = await createRes.json();
      const newCouponId = createData.coupon.id;

      // 2. クーポン一括配布 API を実行
      const distributeRes = await fetch('http://localhost:5000/api/admin/coupons/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_id: newCouponId,
          target_rank: couponData.requiredRank
        })
      });

      if (!distributeRes.ok) {
        throw new Error('クーポンの配布処理に失敗しました');
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
    setCouponData({
      title: '',
      description: '',
      discount: '',
      requiredRank: 'BLUE',
      validUntil: '',
      storeName: ''
    });
    setConditions({
      startDate: '',
      endDate: '',
      usageLimit: 1,
      autoExpire: true
    });
  };

  const steps = [
    { key: 'create', label: 'クーポン作成', icon: Gift },
    { key: 'conditions', label: '配布条件', icon: Settings },
    { key: 'confirm', label: '確認', icon: CheckCircle },
    { key: 'complete', label: '完了', icon: Check }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">クーポン配布</h2>
        <p className="text-sm text-gray-600">新しいクーポンを作成して配布します</p>
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
        {/* ステップ1: クーポン作成画面 */}
        {currentStep === 'create' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl">クーポン作成</h3>
                <p className="text-sm text-gray-600">配布するクーポンの内容を設定してください</p>
              </div>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  クーポン名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={couponData.title}
                  onChange={(e) => setCouponData({ ...couponData, title: e.target.value })}
                  placeholder="例: 新規登録キャンペーン"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  説明文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={couponData.description}
                  onChange={(e) => setCouponData({ ...couponData, description: e.target.value })}
                  placeholder="クーポンの詳細を入力してください"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  割引内容 <span className="text-red-500">*</span>
                </label>
                <select
                  value={couponData.discount}
                  onChange={(e) => setCouponData({ ...couponData, discount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">選択してください</option>
                  <option value="5%OFF">5%OFF</option>
                  <option value="10%OFF">10%OFF</option>
                  <option value="15%OFF">15%OFF</option>
                  <option value="20%OFF">20%OFF</option>
                  <option value="25%OFF">25%OFF</option>
                  <option value="30%OFF">30%OFF</option>
                  <option value="300円引き">300円引き</option>
                  <option value="500円引き">500円引き</option>
                  <option value="1,000円引き">1,000円引き</option>
                  <option value="1,500円引き">1,500円引き</option>
                  <option value="2,000円引き">2,000円引き</option>
                  <option value="ドリンク1杯無料">ドリンク1杯無料</option>
                  <option value="デザート1品無料">デザート1品無料</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={couponData.storeName}
                  onChange={(e) => setCouponData({ ...couponData, storeName: e.target.value })}
                  placeholder="例: カフェ・ド・仙台"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    必要ランク <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={couponData.requiredRank}
                    onChange={(e) => setCouponData({ ...couponData, requiredRank: e.target.value as Rank })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BLUE">BLUE</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    有効期限 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={couponData.validUntil}
                    onChange={(e) => setCouponData({ ...couponData, validUntil: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleCreateStep}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>次へ</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <button
                onClick={handleConditionsStep}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>次へ</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: 配布確認画面 */}
        {currentStep === 'confirm' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl">配布確認</h3>
                <p className="text-sm text-gray-600">以下の内容で配布を実行します</p>
              </div>
            </div>

            <div className="space-y-6 max-w-3xl">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  クーポン情報
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">クーポン名</p>
                    <p className="font-medium">{couponData.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">割引内容</p>
                    <p className="font-medium text-purple-600">{couponData.discount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">店舗名</p>
                    <p className="font-medium">{couponData.storeName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">対象条件ランク</p>
                    <span 
                      className="inline-block px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: rankConfigs[couponData.requiredRank].color }}
                    >
                      {rankConfigs[couponData.requiredRank].name} 以上
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">説明</p>
                    <p className="font-medium">{couponData.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  配布対象
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">対象タイプ</p>
                    <p className="font-medium">{couponData.requiredRank} ランク以上の会員</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">対象人数（システム抽出）</p>
                    <p className="font-medium text-blue-600 text-xl">{getTargetUserCount()}人目安</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ 注意：</strong> 配布を実行すると、データベースに即座に保存され、対象ランクのユーザーに配布されます。
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => setCurrentStep('conditions')}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDistributing}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <button
                onClick={handleDistribute}
                disabled={isDistributing}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDistributing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>配布・DB保存中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>配布を実行（本番同期）</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 配布完了画面 */}
        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Sparkles className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h3 className="text-4xl mb-4 text-green-600">配布完了！</h3>
            <p className="text-gray-600 mb-8">本物のデータベースへ正常に保存・配布が完了しました</p>

            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">実際の配布人数</p>
                    <p className="text-4xl text-green-600 mb-1">{distributedCount}</p>
                    <p className="text-xs text-gray-500">人</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">クーポン名</p>
                    <p className="text-lg text-gray-800 line-clamp-2">{couponData.title}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">割引内容</p>
                    <p className="text-2xl text-purple-600">{couponData.discount}</p>
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">本番データ進捗</span>
                    <span className="text-sm text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-sm transition-all duration-1000" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md"
              >
                新しいクーポンを配布
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                管理画面に戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}