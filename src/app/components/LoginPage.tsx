import { useState } from 'react';
import { User } from '../App';
import { Lock, User as UserIcon, Shield, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User, isAdmin?: boolean) => void;
  onSignup?: () => void;
  onLoginError?: (errorMessage: string) => void;
}

export function LoginPage({ onLogin, onSignup, onLoginError }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // ⚡️ Flaskのバックエンドと実際に通信する関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 送信先URLを、管理者か一般ユーザーかで切り替える
    const url = isAdminMode 
      ? 'http://localhost:5000/api/admin/login' 
      : 'http://localhost:5000/api/auth/login';

    try {
      // 🚀 本物のネットワーク通信を実行！
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userId,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // バックエンドからエラーが返ってきた場合（401や400など）
        throw new Error(data.error || 'ログインに失敗しました');
      }

      // ログイン成功時：Flaskから返ってきた本物のユーザーデータをフロントの状態にセット
      if (isAdminMode) {
        onLogin({
          id: data.admin.id.toString(),
          name: data.admin.username,
          rank: 'GOLD', // 管理者は一律GOLD扱い
          points: 0,
          joinDate: new Date().toISOString()
        }, true);
      } else {
        onLogin({
          id: data.user.id.toString(),
          name: data.user.username,
          rank: data.user.rank,
          points: 15, // 初期BLUEポイント
          joinDate: new Date().toISOString()
        }, false);
      }

    } catch (err: any) {
      // エラーが起きたら画面に赤文字で表示
      const msg = err.message || 'サーバーとの通信に失敗しました';
      setError(msg);
      if (onLoginError) {
        onLoginError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <span className="text-white text-2xl">🔗</span>
            </div>
            <h1 className="text-3xl mb-2">Aoba Link</h1>
            <p className="text-gray-600">地域共創ロイヤリティシステム</p>
          </div>

          {/* ログインモード切替 */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setError('');
                setUserId('');
                setPassword('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                !isAdminMode
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              <UserIcon className="w-4 h-4 inline mr-1" />
              ユーザー
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setError('');
                setUserId('');
                setPassword('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                isAdminMode
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-1" />
              管理者
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                {isAdminMode ? '管理者ID' : 'ユーザーID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isAdminMode ? (
                    <Shield className="h-5 w-5 text-gray-400" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isAdminMode ? '管理者IDを入力' : 'ユーザーIDを入力'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="パスワードを入力"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full text-white py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                isAdminMode
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              ログイン
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              ⚡️ 本物のローカルバックエンド(Flask)とリアルタイム通信中
            </p>
          </div>

          {onSignup && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onSignup}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                新規登録
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}