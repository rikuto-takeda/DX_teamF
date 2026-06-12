import { User } from '../App';
import { CheckCircle, Sparkles, Gift, Building2, ArrowLeft } from 'lucide-react';
import { rankConfigs } from '../utils/rankConfig';

interface SignupCompletePageProps {
  user: User;
  onContinue: () => void;
}

export function SignupCompletePage({ user, onContinue }: SignupCompletePageProps) {
  const rankConfig = rankConfigs[user.rank];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-white" />
          <h1 className="text-2xl text-white">Aoba Link</h1>
        </div>
        <p className="text-purple-100 text-sm">新規会員登録完了</p>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* 成功アイコン */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* 完了メッセージ */}
        <div className="text-center mb-8">
          <h2 className="text-3xl text-gray-800 mb-3">
            会員登録が完了しました！
          </h2>
          <p className="text-gray-600">
            ようこそ、{user.name}さん
          </p>
        </div>

        {/* 会員情報カード */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            あなたの会員情報
          </h3>

          <div className="space-y-4">
            {/* 会員ID */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">会員ID</p>
                <p className="text-lg font-mono text-gray-800 font-bold">
                  {user.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-600 font-medium">ログイン時に使用</p>
              </div>
            </div>

            {/* 会員ランク */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">会員ランク</p>
                <div className="flex items-center gap-2">
                  <span
                    className="px-4 py-2 rounded-lg text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: rankConfig.color }}
                  >
                    {rankConfig.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">初期ランク</p>
              </div>
            </div>

            {/* ポイント */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">保有ポイント</p>
                <p className="text-2xl text-gray-800">
                  {user.points.toLocaleString()}
                  <span className="text-sm text-gray-500 ml-1">pt</span>
                </p>
              </div>
            </div>

            {/* 登録日 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">登録日</p>
                <p className="text-gray-800">
                  {new Date(user.joinDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ログイン画面へ戻るボタン */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg text-lg font-medium"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>ログイン画面へ戻る</span>
        </button>

        {/* サポート情報 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ご不明な点がございましたら、
            <a href="#" className="text-blue-600 hover:underline ml-1">
              よくある質問
            </a>
            または
            <a href="#" className="text-blue-600 hover:underline ml-1">
              お問い合わせ
            </a>
            をご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}
