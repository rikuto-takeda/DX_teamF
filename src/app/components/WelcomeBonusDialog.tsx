import { Gift, Sparkles, X } from 'lucide-react';

interface WelcomeBonusDialogProps {
  onClose: () => void;
}

export function WelcomeBonusDialog({ onClose }: WelcomeBonusDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Gift className="w-16 h-16 text-white" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl text-white mb-2">
            🎉 会員登録完了！
          </h2>
          <p className="text-purple-100 text-sm">
            初回特典を獲得しました
          </p>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                BLUEランク特典
              </div>
            </div>
            
            <h3 className="text-lg mb-2">
              防災グッズ無料引換券
            </h3>
            
            <p className="text-sm text-gray-600 mb-3">
              新規会員向けスターター特典。提携企業ダイシンにて防災グッズと無料で引き換えできます。
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">店舗名: ダイシン</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">特典内容: 防災グッズ1点無料</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">使用制限: 1回のみ</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">有効期限: 登録から90日間</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>💡 ご利用方法：</strong><br/>
              マイページの「クーポンを見る」から特典を確認し、店舗でコードを入力してご利用ください。
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            マイページへ進む
          </button>
        </div>
      </div>
    </div>
  );
}
