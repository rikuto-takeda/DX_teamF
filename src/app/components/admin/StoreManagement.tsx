import { useState } from 'react';
import { mockStores } from '../../utils/mockData';
import { Trash2, Plus, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { StoreRegistrationComplete } from './StoreRegistrationComplete';

interface Store {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  loginId?: string;
  createdAt: string;
}

export function StoreManagement() {
  const [stores, setStores] = useState<Store[]>(
    mockStores.map(store => ({
      ...store,
      status: 'active' as const,
      loginId: `store_${store.code}`,
      createdAt: new Date().toISOString()
    }))
  );
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

  // 新規店舗登録
  const handleAddStore = () => {
    if (!newStore.name.trim()) {
      toast.error('店舗名を入力してください');
      return;
    }

    const storeCode = generateStoreCode();
    const { loginId, password } = generateCredentials(storeCode);
    
    const store: Store = {
      id: `store_${Date.now()}`,
      name: newStore.name,
      code: storeCode,
      status: 'active',
      loginId,
      createdAt: new Date().toISOString()
    };

    setStores([...stores, store]);
    toast.success(`店舗を登録しました\nログインID: ${loginId}\nパスワード: ${password}`);
    
    setShowAddModal(false);
    setNewStore({ name: '', category: '' });
    setCompletedStore({ name: newStore.name, code: storeCode, loginId, password });
    setShowCompleteScreen(true);
  };

  // 店舗削除
  const handleDeleteStore = (storeId: string) => {
    if (confirm('この店舗を削除しますか？')) {
      setStores(stores.filter(store => store.id !== storeId));
      toast.success('店舗を削除しました');
    }
  };

  const copyCode = (code: string) => {
    // フォールバック付きのコピー機能
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

    // Clipboard APIを試行し、失敗したらフォールバック
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
          <p className="text-sm text-gray-600">提携店舗の登録・店舗コード管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>店舗登録</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                <td className="px-6 py-4 text-sm">{store.name}</td>
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
                      onClick={() => handleDeleteStore(store.id)}
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