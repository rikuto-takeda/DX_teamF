import { Check, Copy, Download, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StoreRegistrationCompleteProps {
  storeName: string;
  storeCode: string;
  loginId: string;
  password: string;
  onClose: () => void;
}

export function StoreRegistrationComplete({
  storeName,
  storeCode,
  loginId,
  password,
  onClose
}: StoreRegistrationCompleteProps) {
  const [copied, setCopied] = useState<{
    code: boolean;
    loginId: boolean;
    password: boolean;
  }>({
    code: false,
    loginId: false,
    password: false
  });

  const copyToClipboard = (text: string, type: 'code' | 'loginId' | 'password') => {
    const labels = {
      code: '店舗コード',
      loginId: 'ログインID',
      password: 'パスワード'
    };

    // フォールバック付きのコピー機能
    const fallbackCopy = (textToCopy: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied({ ...copied, [type]: true });
        setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
        toast.success(`${labels[type]}をコピーしました`);
      } catch (err) {
        toast.error('コピーに失敗しました');
      }
      document.body.removeChild(textArea);
    };

    // Clipboard APIを試行し、失敗したらフォールバック
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied({ ...copied, [type]: true });
          setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
          toast.success(`${labels[type]}をコピーしました`);
        })
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const downloadCredentials = () => {
    const content = `店舗登録情報
━━━━━━━━━━━━━━━━━━━━
店舗名: ${storeName}
店舗コード: ${storeCode}
ログインID: ${loginId}
パスワード: ${password}
━━━━━━━━━━━━━━━━━━━━
登録日時: ${new Date().toLocaleString('ja-JP')}

【重要】
この情報は店舗様にお渡しください。
特にパスワードは再表示できませんので、
必ず保存してください。
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `店舗登録情報_${storeName}_${storeCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('登録情報をダウンロードしました');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-3xl text-center mb-2">店舗登録完了</h2>
          <p className="text-center text-purple-100 text-sm">
            新しい店舗が正常に登録されました
          </p>
        </div>

        {/* コンテンツ */}
        <div className="p-8 space-y-6">
          {/* 店舗名 */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">登録店舗名</p>
            <p className="text-2xl text-gray-800">{storeName}</p>
          </div>

          {/* 重要な情報の警告 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm">
              <strong>⚠️ 重要：</strong> 以下の情報は店舗様にお渡しください。<br />
              <strong>特にパスワードは再表示できません</strong>ので、必ず保存してください。
            </p>
          </div>

          {/* 店舗コード */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-600">店舗コード</label>
              <button
                onClick={() => copyToClipboard(storeCode, 'code')}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                {copied.code ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>コピー済み</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>コピー</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-center">
              <p className="font-mono text-5xl text-purple-600 tracking-widest">{storeCode}</p>
              <p className="text-xs text-gray-500 mt-2">ユーザーがクーポン利用時に入力するコード</p>
            </div>
          </div>

          {/* ログインID */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">ログインID</label>
                <p className="font-mono text-lg text-gray-800">{loginId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(loginId, 'loginId')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied.loginId ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* パスワード */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">初期パスワード</label>
                <p className="font-mono text-lg text-gray-800">{password}</p>
              </div>
              <button
                onClick={() => copyToClipboard(password, 'password')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied.password ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* 次のステップ */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm text-blue-800 mb-2">📋 次のステップ</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>登録情報をダウンロードして保存</li>
              <li>店舗様に店舗コードとログイン情報を共有</li>
              <li>店舗様にレジ付近への店舗コード掲示を依頼</li>
              <li>店舗様が初回ログインして動作確認</li>
            </ol>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={downloadCredentials}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>登録情報をダウンロード</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>店舗一覧に戻る</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
