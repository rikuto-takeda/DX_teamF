import { useState } from 'react';
import { User, Rank } from '../App';
import { UserPlus, ArrowLeft, Building2 } from 'lucide-react';

interface SignupPageProps {
  onSignup: (user: User, admin?: boolean, isNewUser?: boolean) => void;
  onBack: () => void;
}

export function SignupPage({ onSignup, onBack }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
    bankAccount: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '氏名を入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (!formData.gender) {
      newErrors.gender = '性別を選択してください';
    }

    if (!formData.age) {
      newErrors.age = '年齢を入力してください';
    }

    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = '銀行口座番号を入力してください';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 新規ユーザーを作成（初期ランクはBLUE）
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: formData.name,
      rank: 'BLUE' as Rank,
      points: 0,
      joinDate: new Date().toISOString()
    };

    // LocalStorageに保存（実際にはバックエンドAPI呼び出し）
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 新規ユーザーとして登録（第3引数にtrueを渡す）
    onSignup(newUser, false, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">ログイン画面へ戻る</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-white" />
          <h1 className="text-2xl text-white">Aoba Link</h1>
        </div>
        <p className="text-purple-100 text-sm">新規会員登録</p>
      </div>

      {/* Form */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg">会員情報の入力</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 氏名 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="山田 太郎"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8文字以上"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="パスワードを再入力"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                性別 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm">男性</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm">女性</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm">その他</span>
                </label>
              </div>
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>

            {/* 年齢 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                年齢 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 25"
                min="18"
                max="100"
              />
              {errors.age && (
                <p className="text-xs text-red-500 mt-1">{errors.age}</p>
              )}
            </div>

            {/* 銀行口座番号 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                仙台あおば銀行 口座番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567"
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  仙台あおば銀行の口座番号を入力してください
                </p>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-blue-800">
                    口座番号はハッシュ化され、システムには保存されません
                  </p>
                </div>
              </div>
              {errors.bankAccount && (
                <p className="text-xs text-red-500 mt-1">{errors.bankAccount}</p>
              )}
            </div>

            {/* 利用規約同意 */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-700">
                  <a href="#" className="text-blue-600 hover:underline">利用規約</a>
                  および
                  <a href="#" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                  に同意します <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-red-500 mt-1">{errors.agreeTerms}</p>
              )}
            </div>

            {/* 説明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong>会員登録について：</strong><br/>
                登録完了後、初期ランクは「BLUE」となります。銀行取引（NISA、ローン、給与受取等）に応じてポイントが付与され、
                ランクアップすることで地元提携店舗での特典が利用可能になります。
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>会員登録する</span>
            </button>
          </form>
        </div>

        {/* 既存会員の方 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちの方は
            <button
              onClick={onBack}
              className="text-blue-600 hover:underline ml-1"
            >
              こちらからログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}