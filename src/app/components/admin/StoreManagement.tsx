// StoreManagement.tsx
import { useState, useEffect } from 'react';
import { Trash2, Plus, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { StoreRegistrationComplete } from './StoreRegistrationComplete';

interface Store {
  id: number; // バックエンドの主キー（数値型）に合わせる
  name: string;
  code: string;
  status: 'active' | 'inactive';
  loginId?: string;
  createdAt: string;
}

export function StoreManagement() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [completedStore, setCompletedStore] = useState<{
    name: string;
    code: string;
    loginId: string;
    password: string;
  } | null>(null);
  const [newStore, setNewStore] = useState({
    name: '',
    category: ''
  });

  // 💡 バックエンドから店舗一覧を同期・取得する関数
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/stores');
      if (!response.ok) {
        throw new Error('店舗一覧の取得に失敗しました');
      }
      const data = await response.json();
      
      // バックエンドのスキーマ構造をフロント側のプロパティ名にマッピング
      const formattedStores: Store[] = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        code: s.store_code, // バックエンド側のカラム名
        status: 'active',
        loginId: s.login_id || `store_${s.store_code}`,
        createdAt: s.created_at || new Date().toISOString()
      }));
      
      setStores(formattedStores);
    } catch (error: any) {
      print('Fetch stores error:', error);
      toast.error(error.message || 'サーバーから店舗データを取得できませんでした');
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 初回レンダリング時に実データを取得
  useEffect(() => {
    fetchStores();
  }, []);

  // 3桁の店舗コードを自動生成
  const generateStoreCode = () => {
    const existingCodes = stores.map(s => s.code);
    let code;
    do {
      code = Math.floor(100 + Math.random() * 900).toString();
    } while (existingCodes.includes(code));
    return code;
  };

  // ログインID/パスワードを自動生成
  const generateCredentials = (storeCode: string) => {
    const loginId = `store_${storeCode}`;
    const password = Math.random().toString(36).slice(-8).toUpperCase();
    return { loginId, password };
  };

  // 💡 新規店舗登録（バックエンド API 連携版）
  const handleAddStore = async () => {
    if (!newStore.name.trim()) {
      toast.error('店舗名を入力してください');
      return;
    }

    const storeCode = generateStoreCode();
    const { loginId, password } = generateCredentials(storeCode);
    
    try {
      // バックエンドの店舗作成APIを叩く
      const response = await fetch('http://localhost:5000/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStore.name,
          store_code: storeCode,
          login_id: loginId,
          password: password // バックエンド側で保存・ハッシュ化等を想定
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || '店舗のDB登録に失敗しました');
      }

      toast.success(`店舗「${newStore.name}」をデータベースに登録しました！`);
      
      // 登録成功したらモーダルを閉じて画面をリロード
      setShowAddModal(false);
      setNewStore({ name: '', category: '' });
      setCompletedStore({ name: newStore.name, code: storeCode, loginId, password });
      setShowCompleteScreen(true);
      
      // 最新のリストに更新
      fetchStores();

    } catch (error: any) {
      console.error('Add store error:', error);
      toast.error(error.message || '通信エラーが発生しました');
    }
  };

  // 💡 店舗削除（バックエンド API 連携版）
  const handleDeleteStore = async (storeId: number, storeName: string) => {
    if (confirm(`店舗「${storeName}」をシステムから完全に削除しますか？\n※この店舗に紐づくデータが消去される可能性があります。`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/stores/${storeId}`, {
          method: 'DELETE',
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.error || '店舗の削除に失敗しました');
        }

        toast.success('データベースから店舗を削除しました');
        // フロントのStateからも即時除外
        setStores(stores.filter(store => store.id !== storeId));

      } catch (error: any) {
        console.error('Delete store error:', error);
        toast.error(error.message || '削除処理中にエラーが発生しました');
      }
    }
  };

  const copyCode = (code: string) => {
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(`店舗コード「${code}」をコピーしました`);
      } catch (err) {
        toast.error('コピーに失敗しました');
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast.success(`店舗コード「${code}」をコピーしました`);
        })
        .catch(() => {
          fallbackCopy(code);
        });
    } else {
      fallbackCopy(code);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">店舗管理</h2>
          <p className="text-sm text-gray-600">提携店舗の登録・店舗コード管理（SQLite同期済み）</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStores}
            className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            同期・リロード
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>店舗登録</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            データベースから店舗マスタを読み込み中...
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            登録されている店舗がありません。「店舗登録」ボタンから追加してください。
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-gray-600">店舗名</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">店舗コード</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">ログインID</th>
                <th className="px-6 py-3 text-right text-sm text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={store.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{store.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg text-purple-600">{store.code}</span>
                      <button
                        onClick={() => copyCode(store.code)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="コピー"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{store.loginId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteStore(store.id, store.name)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg mb-3">店舗コード について</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 各店舗に3桁の固有コードを割り当て</li>
            <li>• ユーザーはクーポン利用時にこのコードを入力</li>
            <li>• レジ付近のPOPに掲示することを推奨</li>
            <li>• 専用機器は不要、運用コストゼロ</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg mb-3">登録店舗統計</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">総登録店舗数</span>
              <span className="text-2xl text-purple-600">{stores.length}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                最終更新: {new Date().toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 店舗登録時に3桁コードとログイン情報が自動生成されます。アカウント停止機能により、指定店舗のログインを無効化できます。
        </p>
      </div>

      {/* 店舗登録モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">新規店舗登録</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="例: カフェ・ド・仙台"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">カテゴリ（任意）</label>
                <input
                  type="text"
                  value={newStore.category}
                  onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
                  placeholder="例: 飲食店"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>自動生成される情報：</strong><br />
                  • 3桁の店舗コード<br />
                  • ログインID（store_XXX形式）<br />
                  • 初期パスワード（8桁英数字）
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddStore}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  登録する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 登録完了画面 */}
      {showCompleteScreen && completedStore && (
        <StoreRegistrationComplete
          storeName={completedStore.name}
          storeCode={completedStore.code}
          loginId={completedStore.loginId}
          password={completedStore.password}
          onClose={() => setShowCompleteScreen(false)}
        />
      )}
    </div>
  );
}