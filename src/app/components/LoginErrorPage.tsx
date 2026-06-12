import { XCircle, AlertTriangle, RefreshCw, ArrowLeft, Shield, User } from 'lucide-react';

interface LoginErrorPageProps {
  isAdminLogin?: boolean;
  message?: string;
  onBack: () => void;
}

export function LoginErrorPage({ 
  isAdminLogin = false, 
  message,
  onBack
}: LoginErrorPageProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isAdminLogin 
        ? 'bg-gradient-to-br from-red-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-red-50 via-red-100 to-orange-100'
    }`}>
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* パルスエフェクト */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl animate-pulse delay-75"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* エラーアイコンと背景 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* 背景リング アニメーション */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-red-500/30 rounded-full animate-pulse"></div>
            
            {/* メインアイコン */}
            <div className={`relative ${
              isAdminLogin 
                ? 'bg-gradient-to-br from-red-600 to-red-800' 
                : 'bg-gradient-to-br from-red-500 to-orange-600'
            } rounded-full p-8 shadow-2xl`}>
              <XCircle className="w-24 h-24 text-white" strokeWidth={2.5} />
            </div>

            {/* 警告バッジ */}
            <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-3 shadow-lg animate-bounce">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* エラーカード */}
        <div className={`${
          isAdminLogin 
            ? 'bg-white/95 backdrop-blur-sm border-red-800' 
            : 'bg-white'
        } rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-red-300 animate-shake`}>
          
          {/* タイトル */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              {isAdminLogin ? (
                <Shield className="w-6 h-6 text-red-600" />
              ) : (
                <User className="w-6 h-6 text-red-600" />
              )}
              <h1 className="text-4xl text-red-700">
                ログイン失敗
              </h1>
            </div>
            <p className="text-red-600 text-lg">
              {isAdminLogin ? '管理者認証エラー' : 'ユーザー認証エラー'}
            </p>
          </div>

          {/* エラーコード */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-red-800">エラーコード: AUTH-401-FAILED</p>
            </div>
            <p className="text-center text-red-700">
              {message || (
                isAdminLogin 
                  ? '管理者IDまたはパスワードが正しくありません'
                  : 'ユーザーIDまたはパスワードが正しくありません'
              )}
            </p>
          </div>

          {/* 詳細情報 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-200">
            <h3 className="text-red-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>ログインに失敗した理由</span>
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-red-100">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs">1</span>
                </div>
                <div>
                  <p className="text-red-800 mb-1">入力情報の誤り</p>
                  <p className="text-xs text-gray-600">IDまたはパスワードが間違っている可能性があります</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-red-100">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs">2</span>
                </div>
                <div>
                  <p className="text-red-800 mb-1">Caps Lockの確認</p>
                  <p className="text-xs text-gray-600">大文字と小文字が区別されます</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-red-100">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs">3</span>
                </div>
                <div>
                  <p className="text-red-800 mb-1">アカウントの状態</p>
                  <p className="text-xs text-gray-600">アカウントがロックされている可能性があります</p>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨アクション */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-blue-900 mb-3 text-sm">💡 次に試すこと</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>入力したIDとパスワードをもう一度確認してください</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>キーボードのCaps Lockがオフになっているか確認してください</span>
              </p>
              {isAdminLogin ? (
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>デモ環境では ID: <code className="bg-blue-100 px-1 rounded">admin</code> / パスワード: <code className="bg-blue-100 px-1 rounded">admin123</code> を使用してください</span>
                </p>
              ) : (
                <p className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>デモ環境では ID: <code className="bg-blue-100 px-1 rounded">user1</code> / パスワード: <code className="bg-blue-100 px-1 rounded">password</code> を使用してください</span>
                </p>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ログイン画面に戻る</span>
            </button>
          </div>

          {/* セキュリティ情報 */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 text-center mb-2">
                🔒 セキュリティのため、複数回ログインに失敗するとアカウントが一時的にロックされる場合があります
              </p>
              <p className="text-xs text-gray-500 text-center">
                発生日時: {new Date().toLocaleString('ja-JP', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* サポート情報 */}
        <div className={`mt-8 text-center ${isAdminLogin ? 'text-purple-200' : 'text-gray-700'}`}>
          <p className="text-sm mb-2">ログインでお困りですか？</p>
          <div className="space-y-1 text-xs">
            <p>📧 support@aoba-link.jp</p>
            <p>📞 0120-XXX-XXX (平日 9:00-17:00)</p>
          </div>
          <p className={`text-xs mt-4 ${isAdminLogin ? 'text-purple-300/60' : 'text-gray-500'}`}>
            © 2026 Aoba Link - 仙台あおば銀行
          </p>
        </div>
      </div>
    </div>
  );
}