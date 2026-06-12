import { useState } from 'react';
import { mockCoupons } from '../../utils/mockData';
import { rankConfigs } from '../../utils/rankConfig';
import { Edit, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';

interface CouponFormData {
  id?: string;
  title: string;
  description: string;
  discount: string;
  requiredRank: Rank;
  validFrom: string;
  validUntil: string;
  imagePath: string;
  storeName: string;
}

export function CouponManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    title: '',
    description: '',
    discount: '',
    requiredRank: 'BLUE',
    validFrom: '',
    validUntil: '',
    imagePath: '',
    storeName: ''
  });

  const handleCreateCoupon = () => {
    if (!formData.title || !formData.description || !formData.discount || !formData.validUntil) {
      toast.error('必須項目を入力してください');
      return;
    }

    if (editingCoupon) {
      // 編集モード
      toast.success('クーポンを更新しました');
    } else {
      // 新規作成モード
      toast.success('クーポンを登録しました');
    }
    
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      title: '',
      description: '',
      discount: '',
      requiredRank: 'BLUE',
      validFrom: '',
      validUntil: '',
      imagePath: '',
      storeName: ''
    });
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm('このクーポンを削除しますか？')) {
      toast.success('クーポンを削除しました');
    }
  };

  const handleEditCoupon = (couponId: string) => {
    const coupon = mockCoupons.find(c => c.id === couponId);
    if (coupon) {
      setFormData({
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        discount: coupon.discount,
        requiredRank: coupon.requiredRank,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        imagePath: coupon.imageUrl,
        storeName: coupon.storeName
      });
      setEditingCoupon(couponId);
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">クーポン管理</h2>
          <p className="text-sm text-gray-600">クーポンの編集・削除</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-32">
              <img
                src={coupon.imageUrl}
                alt={coupon.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <div
                  className="px-2 py-1 rounded text-xs text-white backdrop-blur-sm"
                  style={{ backgroundColor: rankConfigs[coupon.requiredRank].color }}
                >
                  {rankConfigs[coupon.requiredRank].name}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="mb-2">{coupon.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {coupon.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <p className="text-gray-500">店舗</p>
                  <p className="text-gray-700">{coupon.storeName}</p>
                </div>
                <div>
                  <p className="text-gray-500">割引</p>
                  <p className="text-gray-700">{coupon.discount}</p>
                </div>
                <div>
                  <p className="text-gray-500">有効期限</p>
                  <p className="text-gray-700">{coupon.validUntil}</p>
                </div>
                <div>
                  <p className="text-gray-500">使用制限</p>
                  <p className="text-gray-700">
                    {coupon.usageLimitType === 'unlimited' && '無制限'}
                    {coupon.usageLimitType === 'once' && '1回のみ'}
                    {coupon.usageLimitType === 'monthly' && '月2回'}
                    {coupon.usageLimitType === 'lifetime' && '生涯2回'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm" onClick={() => handleEditCoupon(coupon.id)}>
                  <Edit className="w-4 h-4" />
                  <span>編集</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                  <Trash2 className="w-4 h-4" />
                  <span>削除</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 この画面はデモ版です。実際の環境では、ここでクーポンの新規作成・編集・削除が可能になります。
        </p>
      </div>

      {/* クーポン登録モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">{editingCoupon ? 'クーポン編集' : 'クーポン新規登録'}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCoupon(null);
                  setFormData({
                    title: '',
                    description: '',
                    discount: '',
                    requiredRank: 'BLUE',
                    validFrom: '',
                    validUntil: '',
                    imagePath: '',
                    storeName: ''
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: カフェ10%割引"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    店舗名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="例: カフェ・ド・仙台"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="クーポンの詳細を入力してください"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    割引内容 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="例: 10% OFF"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    必要ランク <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.requiredRank}
                    onChange={(e) => setFormData({ ...formData, requiredRank: e.target.value as Rank })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BLUE">BLUE（ブルー）</option>
                    <option value="BRONZE">BRONZE（ブロンズ）</option>
                    <option value="SILVER">SILVER（シルバー）</option>
                    <option value="GOLD">GOLD（ゴールド）</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">有効期間（開始）</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    有効期間（終了） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">画像パス（任意）</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imagePath}
                    onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                    placeholder="/images/coupon/sample.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">アップロード</span>
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>💡 マスタデータ登録：</strong><br />
                  入力情報（期間・ランク・画像パス）はクーポンマスタDBに保存されます。
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleCreateCoupon}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingCoupon ? '更新する' : '登録する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}