import { useState } from 'react';
import { Coupon, Store } from '../App';
import { findStoreByCode } from '../utils/mockData';
import { ArrowLeft, Store as StoreIcon, AlertCircle } from 'lucide-react';

interface StoreCodeInputProps {
  coupon: Coupon;
  onSubmit: (store: Store) => void;
  onBack: () => void;
}

export function StoreCodeInput({ coupon, onSubmit, onBack }: StoreCodeInputProps) {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [error, setError] = useState('');

  const handleDigitChange = (
    value: string,
    setter: (v: string) => void,
    nextRef?: HTMLInputElement | null
  ) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setter(digit);
    setError('');
    
    if (digit && nextRef) {
      nextRef.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code1 || !code2 || !code3) {
      setError('3桁の店舗コードを入力してください');
      return;
    }

    const fullCode = code1 + code2 + code3;
    const store = findStoreByCode(fullCode);

    if (!store) {
      setError('店舗コードが正しくありません。もう一度確認してください。');
      return;
    }

    onSubmit(store);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 mb-6 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>戻る</span>
      </button>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <StoreIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-2">店舗コード入力</h2>
            <p className="text-sm text-gray-600">
              店舗スタッフから伝えられた3桁のコードを入力してください
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">利用クーポン:</p>
            <p className="text-lg">{coupon.title}</p>
            <p className="text-sm text-gray-500 mt-1">{coupon.storeName}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm mb-3 text-gray-700 text-center">
                店舗コード（3桁の数字）
              </label>
              <div className="flex justify-center gap-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code1}
                  onChange={(e) => handleDigitChange(
                    e.target.value,
                    setCode1,
                    document.getElementById('code2') as HTMLInputElement
                  )}
                  className="w-16 h-20 text-center text-3xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="code1"
                  autoFocus
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code2}
                  onChange={(e) => handleDigitChange(
                    e.target.value,
                    setCode2,
                    document.getElementById('code3') as HTMLInputElement
                  )}
                  className="w-16 h-20 text-center text-3xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="code2"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code3}
                  onChange={(e) => handleDigitChange(e.target.value, setCode3)}
                  className="w-16 h-20 text-center text-3xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="code3"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!code1 || !code2 || !code3}
            >
              クーポンを利用する
            </button>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-2">💡 ヒント</p>
          <p className="text-xs text-gray-500">
            店舗コードは、レジ付近のPOPやスタッフから確認できます。例: 1・2・3
          </p>
          <p className="text-xs text-gray-500 mt-2">
            テスト用コード: <span className="font-mono">123</span> (Aoba Cafe)
          </p>
        </div>
      </div>
    </div>
  );
}
