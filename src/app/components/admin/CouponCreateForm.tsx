// CouponCreateForm.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Gift, PlusCircle, AlertCircle } from 'lucide-react';
import { Rank } from '../../App'; // App.tsxで定義しているRank型をインポート

interface CouponCreateFormProps {
  onSuccess?: () => void; // 作成成功時に一覧を再読み込みするためのコールバック（任意）
}

export function CouponCreateForm({ onSuccess }: CouponCreateFormProps) {
  // 💡 入力項目に対応するState
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredRank, setRequiredRank] = useState<Rank>('BLUE');
  const [discount, setDiscount] = useState(''); // 例: "10% OFF", "ポテト無料"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 【修正点】'test' という固定の予備値を完全に排除
  // ローカルストレージに保存されている実際の店舗コードを動的に取得します
  const currentStoreCode = localStorage.getItem('store_code') || 
                           localStorage.getItem('storeCode') || 
                           localStorage.getItem('adminStoreCode') || 
                           '141';

  // 💡 送信処理（バックエンドAPIへのPOST通信）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 簡単なバリデーション
    if (!title.trim() || !description.trim()) {
      toast.error('クーポンタイトルと説明文は必須項目です');
      return;
    }

    setIsSubmitting(true);

    try {
      // バックエンドの作成APIを叩く
      const response = await fetch('http://localhost:5000/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-Code': currentStoreCode // 💡 念のためヘッダー側にも店舗コードを付与
        },
        body: JSON.stringify({
          title,
          description,
          required_rank: requiredRank, // バックエンドの命名規則に合わせる
          discount: discount || '特典',
          store_code: currentStoreCode // 💡 ここでログイン中の店舗コードをBodyに含める！
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'クーポンの作成に失敗しました');
      }

      // 💡 成功時の処理
      toast.success(`クーポン「${title}」をマスタに登録しました！`);
      
      // フォームをリreset
      setTitle('');
      setDescription('');
      setRequiredRank('BLUE');
      setDiscount('');

      // 親コンポーネント側での再ロードなどの処理があれば実行
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('クーポン作成エラー:', error);
      toast.error(error.message || 'サーバーとの通信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">新規クーポンマスタ登録</h2>
          <p className="text-sm text-gray-500">
            店舗コード <span className="font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">[{currentStoreCode}]</span> の専用クーポンとしてデータベースに登録します。
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* クーポンタイトル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            クーポンタイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 【雨の日限定】ドリンク1杯無料引換券"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={50}
          />
        </div>

        {/* 特典・割引内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            特典・割引内容（管理・表示用）
          </label>
          <input
            type="text"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="例: ドリンク無料、10% OFF、トッピングサービス"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* 対象会員ランク */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            利用可能な最小会員ランク <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(['BLUE', 'BRONZE', 'SILVER', 'GOLD'] as Rank[]).map((rank) => {
              const rankColors: Record<Rank, string> = {
                BLUE: 'border-blue-300 text-blue-700 bg-blue-50',
                BRONZE: 'border-amber-600 text-amber-800 bg-amber-50',
                SILVER: 'border-gray-400 text-gray-700 bg-gray-50',
                GOLD: 'border-yellow-500 text-yellow-700 bg-yellow-50',
              };
              const isSelected = requiredRank === rank;

              return (
                <button
                  key={rank}
                  type="button"
                  onClick={() => setRequiredRank(rank)}
                  className={`py-2 px-3 text-center text-xs font-bold rounded-lg border transition-all ${
                    isSelected 
                      ? `${rankColors[rank]} ring-2 ring-purple-600 border-transparent shadow-sm` 
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {rank}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-gray-400" />
            選択したランク以上の会員にのみ、後ほど一括配布することができます。
          </p>
        </div>

        {/* クーポン説明文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            クーポンの説明文・利用条件 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: 会計時に店舗スタッフへ3桁の店舗コードを提示してください。他クーポンとの併用はできません。"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* ボタン */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md ${
              isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            {isSubmitting ? 'データベースに登録中...' : '新しいクーポンマスタを登録する'}
          </button>
        </div>
      </form>
    </div>
  );
}