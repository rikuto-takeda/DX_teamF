// MemberManagement.tsx
import { useState, useEffect } from 'react';
import { UsageRecord } from '../../App';
import { Users, Search, Filter, ChevronDown, ChevronUp, Calendar, Gift, TrendingUp, PiggyBank, CreditCard, Banknote, Smartphone, Zap, Clock, Dog, Home, Download, Upload, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface MemberManagementProps {
  usageRecords: UsageRecord[];
}

type RankFilter = 'ALL' | 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
type SortField = 'name' | 'rank' | 'points' | 'registeredAt' | 'usageCount';
type SortOrder = 'asc' | 'desc';

// APIから返ってくる会員データの型定義
interface DBUser {
  id: string | number;
  username: string;
  rank: 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
  total_points: number;
  created_at: string;
  email?: string;
  pointsBreakdown?: {
    appLogin: number;
    utilities: number;
    deposit: number;
    salaryPension: number;
    investment: number;
    loan: number;
    petTrust: number;
    continuousYears: number;
  };
}

export function MemberManagement({ usageRecords }: MemberManagementProps) {
  const [members, setMembers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<RankFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedMemberId, setSelectedMemberId] = useState<string | number | null>(null);

  // 💡 バックエンドから本物の会員一覧を取得する
  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('http://localhost:5000/api/admin/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        } else {
          toast.error('会員データの取得に失敗しました');
        }
      } catch (error) {
        console.error("通信エラー:", error);
        toast.error('サーバーに接続できませんでした');
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  // ランク条件の定義
  const rankRequirements = {
    BLUE: { min: 0, max: 29, description: '新規会員' },
    BRONZE: { min: 30, max: 69, description: '銀行取引実績に応じて昇格' },
    SILVER: { min: 70, max: 99, description: '継続的な取引実績が必要' },
    GOLD: { min: 100, max: Infinity, description: '最高ランク会員' }
  };

  // ユーザーごとの使用回数を計算
  const userUsageCount = usageRecords.reduce((acc, record) => {
    acc[record.userId] = (acc[record.userId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 会員リストの取得・フィルタリング・ソート
  const getFilteredMembers = () => {
    let result = [...members];

    // ランクでフィルタリング
    if (rankFilter !== 'ALL') {
      result = result.filter(user => user.rank === rankFilter);
    }

    // 検索クエリでフィルタリング（会員名のみ）
    if (searchQuery) {
      result = result.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ソート
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'name':
          compareValue = a.username.localeCompare(b.username, 'ja');
          break;
        case 'rank':
          const rankOrder = { 'BLUE': 1, 'BRONZE': 2, 'SILVER': 3, 'GOLD': 4 };
          compareValue = rankOrder[a.rank] - rankOrder[b.rank];
          break;
        case 'points':
          compareValue = a.total_points - b.total_points;
          break;
        case 'registeredAt':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'usageCount':
          compareValue = (userUsageCount[a.id] || 0) - (userUsageCount[b.id] || 0);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  };

  const filteredMembers = getFilteredMembers();

  // 💡 本番データに基づいたランク別の統計
  const rankStats = {
    BLUE: members.filter(u => u.rank === 'BLUE').length,
    BRONZE: members.filter(u => u.rank === 'BRONZE').length,
    SILVER: members.filter(u => u.rank === 'SILVER').length,
    GOLD: members.filter(u => u.rank === 'GOLD').length,
  };

  // ソートボタンのハンドラー
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // ランク色の取得
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'BLUE': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'BRONZE': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'SILVER': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'GOLD': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // 💡 選択された会員の詳細情報
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const memberUsageRecords = selectedMemberId
    ? usageRecords.filter(r => String(r.userId) === String(selectedMemberId)).sort((a, b) =>
        new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
      )
    : [];

  // 💡 内訳データがない場合のデフォルトフォールバック
  const defaultBreakdown = {
    appLogin: 5,
    utilities: selectedMember && selectedMember.total_points >= 40 ? 10 : 0,
    deposit: 0,
    salaryPension: selectedMember && selectedMember.total_points >= 60 ? 20 : 0,
    investment: selectedMember && selectedMember.total_points >= 100 ? 30 : 0,
    loan: 0,
    petTrust: 0,
    continuousYears: 1
  };

  const currentBreakdown = selectedMember?.pointsBreakdown || defaultBreakdown;

  // Excelテンプレートをダウンロード
  const handleDownloadExcel = () => {
    // Excelのデータを作成
    const excelData = members.map(member => ({
      '会員ID': member.id,
      '会員名': member.username,
      '公共料金・クレカ': member.pointsBreakdown?.utilities ? 1 : 0,
      '預金残高30万円以上': member.pointsBreakdown?.deposit ? 1 : 0,
      '給与・年金受取口座': member.pointsBreakdown?.salaryPension ? 1 : 0,
      '積立NISA・iDeCo': member.pointsBreakdown?.investment ? 1 : 0,
      '住宅・車ローン': member.pointsBreakdown?.loan ? 1 : 0,
      'ペット信託': member.pointsBreakdown?.petTrust ? 1 : 0
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '会員管理データ');
    XLSX.writeFile(wb, `会員管理データ_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.xlsx`);
  };

  // Excelファイルをアップロードしてデータを更新（シミュレーションのまま残置）
  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.loading('Excelファイルを読み込んでいます...', { id: 'excel-upload' });
    setTimeout(() => {
      toast.dismiss('excel-upload');
      toast.success('会員データを更新しました（デモ）');
      event.target.value = '';
    }, 1500);
  };

  // 会員を削除（シミュレーションのまま残置）
  const handleDeleteMember = (userId: string | number) => {
    setMembers(prev => prev.filter(m => m.id !== userId));
    toast.success('会員を削除しました');
    setSelectedMemberId(null);
  };

  return (
    <div className="space-y-6">
      {/* Loading 表示 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">会員データを同期中...</div>
      ) : (
        <>
          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">総会員数</p>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl text-purple-600">{members.length}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">BLUE</p>
              </div>
              <p className="text-3xl text-blue-600">{rankStats.BLUE}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">BRONZE</p>
              </div>
              <p className="text-3xl text-amber-600">{rankStats.BRONZE}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">SILVER</p>
              </div>
              <p className="text-3xl text-gray-600">{rankStats.SILVER}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">GOLD</p>
              </div>
              <p className="text-3xl text-yellow-600">{rankStats.GOLD}</p>
              <p className="text-xs text-gray-500 mt-1">人</p>
            </div>
          </div>

          {/* ランク条件の説明 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm text-gray-700">会員ランク制度（本番DB同期中）</h4>
            </div>
            <div className="flex flex-wrap gap-3 text-xs mb-3">
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300">BLUE</span>
                <span className="text-gray-600">0～29pt</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded border border-amber-300">BRONZE</span>
                <span className="text-gray-600">30～69pt</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-300">SILVER</span>
                <span className="text-gray-600">70～99pt</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded border border-yellow-300">GOLD</span>
                <span className="text-gray-600">100pt以上</span>
              </div>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="会員名（username）で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <select
                    value={rankFilter}
                    onChange={(e) => setRankFilter(e.target.value as RankFilter)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">全ランク</option>
                    <option value="BLUE">BLUE</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>会員データをExcelでダウンロード</span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredMembers.length}件の会員が見つかりました</span>
            </div>
          </div>

          {/* 会員一覧テーブル */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                        会員名 {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => handleSort('rank')} className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                        ランク {sortField === 'rank' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => handleSort('points')} className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                        ポイント {sortField === 'points' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => handleSort('registeredAt')} className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                        登録日 {sortField === 'registeredAt' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button onClick={() => handleSort('usageCount')} className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900">
                        利用回数 {sortField === 'usageCount' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{member.username}</p>
                          <p className="text-xs text-gray-500">ID: {member.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getRankColor(member.rank)}`}>
                          {member.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{member.total_points}</span>
                        <span className="text-xs text-gray-500 ml-1">pt</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {member.created_at}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-purple-600">
                          {userUsageCount[member.id] || 0}回
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedMemberId(member.id)}
                          className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">該当する会員が見つかりませんでした</p>
              </div>
            )}
          </div>

          {/* 会員詳細モーダル */}
          {selectedMember && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg">{selectedMember.username}</h3>
                        <p className="text-sm text-gray-500">ID: {selectedMember.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">削除</span>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>会員を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。会員「{selectedMember.username}」のデータがすべて削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMember(selectedMember.id)} className="bg-red-600 hover:bg-red-700">
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <button onClick={() => setSelectedMemberId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 基本情報 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> 基本情報
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">会員ランク</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getRankColor(selectedMember.rank)}`}>
                          {selectedMember.rank}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">登録日</p>
                        <p className="text-gray-900 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {selectedMember.created_at}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">保有ポイント</p>
                        <p className="text-gray-900">
                          <span className="text-lg text-purple-600">{selectedMember.total_points}</span>
                          <span className="text-xs text-gray-500 ml-1">pt</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">ランク条件</p>
                        <p className="text-xs text-gray-700">
                          {rankRequirements[selectedMember.rank].min}～
                          {rankRequirements[selectedMember.rank].max === Infinity ? '∞' : rankRequirements[selectedMember.rank].max}pt
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ポイント内訳 */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-blue-600" /> 保有ポイント内訳（銀行実績シミュレーション値）
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-gray-600">アプリログイン</p>
                        </div>
                        <p className="text-lg text-gray-900">{currentBreakdown.appLogin}pt</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-yellow-600" />
                          <p className="text-xs text-gray-600">公共料金・クレカ</p>
                        </div>
                        <p className="text-lg text-gray-900">{currentBreakdown.utilities}pt</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-gray-600">預金残高</p>
                        </div>
                        <p className="text-lg text-gray-900">{currentBreakdown.deposit}pt</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          <p className="text-xs text-gray-600">給与・年金受取</p>
                        </div>
                        <p className="text-lg text-gray-900">{currentBreakdown.salaryPension}pt</p>
                      </div>
                    </div>
                  </div>

                  {/* 利用履歴 */}
                  <div>
                    <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> クーポン利用履歴
                    </h4>
                    {memberUsageRecords.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs text-gray-600">利用日時</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-600">クーポン名</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {memberUsageRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-white transition-colors">
                                <td className="px-4 py-2 text-gray-700">{new Date(record.usedAt).toLocaleString('ja-JP')}</td>
                                <td className="px-4 py-2 text-gray-900">{record.couponTitle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">まだクーポンを利用していません</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}