import { AlertTriangle, XCircle, WifiOff, Server, RefreshCw, Home, ChevronRight } from 'lucide-react';

export type ErrorPageType = 'auth' | 'network' | 'system' | 'notfound' | 'permission';

interface ErrorDisplayPageProps {
  type: ErrorPageType;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ErrorDisplayPage({ type, message, onRetry, onGoHome }: ErrorDisplayPageProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'auth':
        return {
          icon: <XCircle className="w-20 h-20 text-red-500" />,
          title: '認証エラー',
          defaultMessage: 'ログイン情報が正しくありません。再度ログインしてください。',
          bgColor: 'from-red-50 to-red-100',
          iconBg: 'bg-red-100',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          code: 'AUTH-401'
        };
      case 'network':
        return {
          icon: <WifiOff className="w-20 h-20 text-orange-500" />,
          title: 'ネットワークエラー',
          defaultMessage: 'ネットワーク接続を確認してください。インターネット接続が不安定です。',
          bgColor: 'from-orange-50 to-orange-100',
          iconBg: 'bg-orange-100',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
          code: 'NET-503'
        };
      case 'system':
        return {
          icon: <Server className="w-20 h-20 text-yellow-500" />,
          title: 'システムエラー',
          defaultMessage: 'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。',
          bgColor: 'from-yellow-50 to-yellow-100',
          iconBg: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          code: 'SYS-500'
        };
      case 'notfound':
        return {
          icon: <AlertTriangle className="w-20 h-20 text-blue-500" />,
          title: 'ページが見つかりません',
          defaultMessage: 'お探しのページは存在しないか、移動または削除された可能性があります。',
          bgColor: 'from-blue-50 to-blue-100',
          iconBg: 'bg-blue-100',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          code: 'HTTP-404'
        };
      case 'permission':
        return {
          icon: <XCircle className="w-20 h-20 text-purple-500" />,
          title: 'アクセス権限がありません',
          defaultMessage: 'このページへのアクセス権限がありません。管理者に問い合わせてください。',
          bgColor: 'from-purple-50 to-purple-100',
          iconBg: 'bg-purple-100',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-900',
          code: 'AUTH-403'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgColor} px-4 py-12`}>
      <div className="max-w-2xl w-full">
        {/* エラーカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gray-200">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className={`${config.iconBg} rounded-full p-6 shadow-lg`}>
              {config.icon}
            </div>
          </div>

          {/* タイトル */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-4xl mb-2 ${config.textColor}`}>
              {config.title}
            </h1>
            <p className="text-sm text-gray-500">エラーコード: {config.code}</p>
          </div>

          {/* メッセージ */}
          <div className={`border-2 ${config.borderColor} rounded-xl p-6 mb-8`}>
            <p className="text-gray-700 text-center leading-relaxed">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* 詳細情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <h3 className="text-sm mb-3 text-gray-800">📋 対処方法</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {type === 'auth' && (
                <>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>ログインIDとパスワードが正しいか確認してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>Caps Lockがオンになっていないか確認してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>アカウントがロックされている場合は管理者に連絡してください</p>
                  </div>
                </>
              )}
              {type === 'network' && (
                <>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>インターネット接続を確認してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>Wi-Fiまたはモバイルデータ通信がオンになっているか確認してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>ファイアウォールやセキュリティソフトの設定を確認してください</p>
                  </div>
                </>
              )}
              {type === 'system' && (
                <>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>数分待ってから再度お試しください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>問題が解決しない場合はシステム管理者に連絡してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>エラーコードをメモしてお問い合わせください</p>
                  </div>
                </>
              )}
              {type === 'notfound' && (
                <>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>URLが正しいか確認してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>ブックマークが古い可能性があります</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>トップページから目的のページを探してください</p>
                  </div>
                </>
              )}
              {type === 'permission' && (
                <>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>管理者権限が必要なページです</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>アクセス権限が必要な場合は管理者に申請してください</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>ログアウトして管理者アカウントで再ログインしてください</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col md:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${
                  type === 'auth' ? 'from-red-500 to-red-600' :
                  type === 'network' ? 'from-orange-500 to-orange-600' :
                  type === 'system' ? 'from-yellow-500 to-yellow-600' :
                  type === 'notfound' ? 'from-blue-500 to-blue-600' :
                  'from-purple-500 to-purple-600'
                } text-white rounded-lg hover:shadow-lg transition-all`}
              >
                <RefreshCw className="w-5 h-5" />
                <span>再試行</span>
              </button>
            )}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 hover:shadow-lg transition-all"
              >
                <Home className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
            )}
          </div>

          {/* タイムスタンプ */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              発生日時: {new Date().toLocaleString('ja-JP')}
            </p>
          </div>
        </div>

        {/* サポート情報 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            問題が解決しない場合
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📧 support@aoba-link.jp | 📞 0120-XXX-XXX (平日 9:00-17:00)
          </p>
        </div>
      </div>
    </div>
  );
}
