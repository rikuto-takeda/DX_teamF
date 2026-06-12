import { useState } from 'react';
import { User } from '../../App';
import { Lock, Shield, AlertTriangle, CheckCircle, XCircle, Activity, BarChart3 } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (user: User, isAdmin: boolean) => void;
  onBackToUserLogin?: () => void;
  onLoginError?: (errorMessage: string) => void;
}

type ErrorType = 'none' | 'auth' | 'network' | 'system';

export function AdminLoginPage({ onLogin, onBackToUserLogin, onLoginError }: AdminLoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ErrorType>('none');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('none');
    setErrorMessage('');
    setIsLoading(true);

    // 認証処理のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 800));

    if (userId === 'admin' && password === 'admin123') {
      setIsLoading(false);
      onLogin(
        {
          id: 'admin',
          name: '管理者',
          rank: 'GOLD',
          points: 0,
          joinDate: new Date().toISOString()
        },
        true
      );
    } else {
      setIsLoading(false);
      const msg = '管理者IDまたはパスワードが正しくありません。再度入力してください。';
      setError('auth');
      setErrorMessage(msg);
      // エラー画面に遷移
      if (onLoginError) {
        setTimeout(() => {
          onLoginError(msg);
        }, 1500); // 1.5秒後にエラー画面へ遷移
      }
    }
  };

  // エラータイプ別のスタイル
  const getErrorStyle = () => {
    switch (error) {
      case 'auth':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'network':
        return 'bg-orange-50 border-orange-300 text-orange-800';
      case 'system':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      default:
        return '';
    }
  };

  const getErrorIcon = () => {
    switch (error) {
      case 'auth':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'network':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'system':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">管理者ログイン</h1>
          <p className="text-purple-200">Aoba Link 管理システム</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-200">
          {/* システムステータス */}
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm text-gray-800">システムステータス</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">データベース: 正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">認証サーバー: 正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">分析エンジン: 稼働中</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">API: 利用可能</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-gray-800">
                管理者ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setError('none');
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="管理者IDを入力"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-800">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('none');
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* エラー表示 */}
            {error !== 'none' && (
              <div className={`border-2 px-4 py-3 rounded-lg ${getErrorStyle()} animate-shake`}>
                <div className="flex items-start gap-3">
                  {getErrorIcon()}
                  <div className="flex-1">
                    <p className="text-sm mb-1">
                      {error === 'auth' && '認証エラー'}
                      {error === 'network' && 'ネットワークエラー'}
                      {error === 'system' && 'システムエラー'}
                    </p>
                    <p className="text-xs opacity-90">{errorMessage}</p>
                    {error === 'auth' && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs">
                          <strong>ヒント:</strong> デモ環境では ID: <code className="bg-red-100 px-1 rounded">admin</code>, パスワード: <code className="bg-red-100 px-1 rounded">admin123</code> でログインできます。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>認証中...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>管理者ログイン</span>
                </>
              )}
            </button>
          </form>

          {/* 管理者情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-purple-900">管理者デモアカウント</p>
              </div>
              <div className="text-xs text-gray-700 space-y-1 bg-white p-3 rounded border border-purple-100">
                <p>ID: <code className="font-mono bg-purple-100 px-2 py-0.5 rounded">admin</code></p>
                <p>パスワード: <code className="font-mono bg-purple-100 px-2 py-0.5 rounded">admin123</code></p>
              </div>
              <div className="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>管理者として、店舗管理、クーポン登録、利用分析などの機能にアクセスできます。</span>
                </p>
              </div>
            </div>
          </div>

          {/* ユーザーログインへ戻る */}
          {onBackToUserLogin && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onBackToUserLogin}
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                ← ユーザーログインに戻る
              </button>
            </div>
          )}
        </div>

        {/* セキュリティ情報 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-200/80">
            🔒 このページは SSL/TLS で保護されています
          </p>
          <p className="text-xs text-purple-200/60 mt-1">
            © 2026 Aoba Link - 仙台あおば銀行
          </p>
        </div>
      </div>
    </div>
  );
}