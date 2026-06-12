import { useState } from 'react';
import { mockUsers } from '../../utils/mockData';
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

export function MemberManagement({ usageRecords }: MemberManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<RankFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('registeredAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

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

  // 会員リストの取得とフィルタリング
  const getFilteredMembers = () => {
    let members = Object.values(mockUsers);

    // ランクでフィルタリング
    if (rankFilter !== 'ALL') {
      members = members.filter(user => user.rank === rankFilter);
    }

    // 検索クエリでフィルタリング（会員名のみ）
    if (searchQuery) {
      members = members.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ソート
    members.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name, 'ja');
          break;
        case 'rank':
          const rankOrder = { 'BLUE': 1, 'BRONZE': 2, 'SILVER': 3, 'GOLD': 4 };
          compareValue = rankOrder[a.rank] - rankOrder[b.rank];
          break;
        case 'points':
          compareValue = a.points - b.points;
          break;
        case 'registeredAt':
          compareValue = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
          break;
        case 'usageCount':
          compareValue = (userUsageCount[a.id] || 0) - (userUsageCount[b.id] || 0);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return members;
  };

  const filteredMembers = getFilteredMembers();

  // ランク別の統計
  const rankStats = {
    BLUE: Object.values(mockUsers).filter(u => u.rank === 'BLUE').length,
    BRONZE: Object.values(mockUsers).filter(u => u.rank === 'BRONZE').length,
    SILVER: Object.values(mockUsers).filter(u => u.rank === 'SILVER').length,
    GOLD: Object.values(mockUsers).filter(u => u.rank === 'GOLD').length,
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

  // 選択された会員の詳細情報
  const selectedMember = selectedMemberId ? mockUsers[selectedMemberId] : null;
  const memberUsageRecords = selectedMemberId
    ? usageRecords.filter(r => r.userId === selectedMemberId).sort((a, b) =>
        new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
      )
    : [];

  // Excelテンプレートをダウンロード
  const handleDownloadExcel = () => {
    const members = Object.values(mockUsers);

    // Excelのデータを作成
    const excelData = members.map(member => ({
      '会員ID': member.id,
      '会員名': member.name,
      '公共料金・クレカ': member.pointsBreakdown?.utilities ? 1 : 0,
      '預金残高30万円以上': member.pointsBreakdown?.deposit ? 1 : 0,
      '給与・年金受取口座': member.pointsBreakdown?.salaryPension ? 1 : 0,
      '積立NISA・iDeCo': member.pointsBreakdown?.investment ? 1 : 0,
      '住宅・車ローン': member.pointsBreakdown?.loan ? 1 : 0,
      'ペット信託': member.pointsBreakdown?.petTrust ? 1 : 0
    }));

    // ワークシートを作成
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 列幅を設定
    ws['!cols'] = [
      { wch: 15 }, // 会員ID
      { wch: 20 }, // 会員名
      { wch: 20 }, // 公共料金・クレカ
      { wch: 20 }, // 預金残高30万円以上
      { wch: 20 }, // 給与・年金受取口座
      { wch: 20 }, // 積立NISA・iDeCo
      { wch: 20 }, // 住宅・車ローン
      { wch: 15 }  // ペット信託
    ];

    // ワークブックを作成
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '会員管理データ');

    // ファイルをダウンロード
    XLSX.writeFile(wb, `会員管理データ_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.xlsx`);
  };

  // Excelファイルをアップロードしてデータを更新
  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル読み込み開始を通知
    toast.loading('Excelファイルを読み込んでいます...', {
      id: 'excel-upload',
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // JSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // 更新統計
        let updatedCount = 0;
        let rankChanges: { name: string; oldRank: string; newRank: string }[] = [];

        // データを更新
        jsonData.forEach((row) => {
          const userId = row['会員ID'];
          if (userId && mockUsers[userId]) {
            const user = mockUsers[userId];
            const oldRank = user.rank;

            // ポイント内訳を更新（1の場合のみポイントを付与）
            if (user.pointsBreakdown) {
              user.pointsBreakdown.utilities = row['公共料金・クレカ'] == 1 ? 10 : 0;
              user.pointsBreakdown.deposit = row['預金残高30万円以上'] == 1 ? 1 : 0;
              user.pointsBreakdown.salaryPension = row['給与・年金受取口座'] == 1 ? 20 : 0;
              user.pointsBreakdown.investment = row['積立NISA・iDeCo'] == 1 ? 30 : 0;
              user.pointsBreakdown.loan = row['住宅・車ローン'] == 1 ? 50 : 0;
              user.pointsBreakdown.petTrust = row['ペット信託'] == 1 ? 30 : 0;

              // 合計ポイントを再計算
              user.points =
                user.pointsBreakdown.appLogin +
                user.pointsBreakdown.utilities +
                user.pointsBreakdown.deposit +
                user.pointsBreakdown.salaryPension +
                user.pointsBreakdown.investment +
                user.pointsBreakdown.loan +
                user.pointsBreakdown.petTrust +
                user.pointsBreakdown.continuousYears;

              // ランクを更新
              let newRank = user.rank;
              if (user.points >= 100) {
                newRank = 'GOLD';
              } else if (user.points >= 70) {
                newRank = 'SILVER';
              } else if (user.points >= 30) {
                newRank = 'BRONZE';
              } else {
                newRank = 'BLUE';
              }

              // ランク変更があった場合は記録
              if (oldRank !== newRank) {
                rankChanges.push({
                  name: user.name,
                  oldRank,
                  newRank
                });
              }

              user.rank = newRank;
              updatedCount++;
            }
          }
        });

        // 読み込み中の通知を閉じる
        toast.dismiss('excel-upload');

        // 成功通知を表示
        toast.success('会員データを更新しました', {
          description: `${updatedCount}件の会員データを更新しました。${rankChanges.length > 0 ? `うち${rankChanges.length}件のランク変更がありました。` : ''}`,
          duration: 5000,
        });

        // フォームをリセット
        event.target.value = '';
      } catch (error) {
        console.error('Excel読み込みエラー:', error);
        // 読み込み中の通知を閉じる
        toast.dismiss('excel-upload');
        toast.error('Excelファイルの読み込みに失敗しました', {
          description: 'ファイル形式が正しいか確認してください。',
          duration: 5000,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 会員を削除
  const handleDeleteMember = (userId: string) => {
    const user = mockUsers[userId];
    if (!user) return;

    // mockUsersから削除
    delete mockUsers[userId];

    toast.success('会員を削除しました', {
      description: `${user.name}（${userId}）を削除しました。`,
      duration: 4000,
    });

    // モーダルを閉じる
    setSelectedMemberId(null);
  };

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">総会員数</p>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl text-purple-600">{Object.keys(mockUsers).length}</p>
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
          <h4 className="text-sm text-gray-700">会員ランク制度（銀行取引実績ポイント基準）</h4>
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
        <div className="bg-white rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-gray-700 mb-2">📊 ポイント獲得方法：</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
            <div>📱 アプリログイン：5pt（月1回）</div>
            <div>⚡ 公共料金・クレカ：10pt</div>
            <div>💰 預金残高：30万円以上で1pt</div>
            <div>📈 給与・年金受取：20pt</div>
            <div>🐷 積立NISA・iDeCo：30pt</div>
            <div>🏠 住宅・車ローン：50pt</div>
            <div>🐕 ペット信託：30pt</div>
            <div>⏰ 継続利用：1pt/年</div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="会員名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* ランクフィルター */}
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

          {/* Excel操作ボタン */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>会員データをExcelでダウンロード</span>
            </button>

            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Excelをアップロードして更新</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUploadExcel}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 mb-2">📋 Excel操作の使い方：</p>
            <ol className="text-xs text-blue-700 space-y-1 ml-4">
              <li>1. 「会員データをExcelでダウンロード」をクリックして現在の会員データをダウンロード</li>
              <li>2. ダウンロードしたExcelで各会員の銀行取引情報を半角数字で更新（該当する場合：1、該当しない場合：0）</li>
              <li>3. 「Excelをアップロードして更新」から編集したファイルをアップロード</li>
              <li>4. システムが自動的にポイントとランクを計算して更新します</li>
            </ol>
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
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    会員名
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('rank')}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    ランク
                    {sortField === 'rank' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('points')}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    ポイント
                    {sortField === 'points' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('registeredAt')}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    登録日
                    {sortField === 'registeredAt' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('usageCount')}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    利用回数
                    {sortField === 'usageCount' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
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
                      <p className="text-sm text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getRankColor(member.rank)}`}>
                      {member.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{member.points}</span>
                    <span className="text-xs text-gray-500 ml-1">pt</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(member.registeredAt).toLocaleDateString('ja-JP')}
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
                    <h3 className="text-lg">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-500">{selectedMember.id}</p>
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
                          この操作は取り消せません。会員「{selectedMember.name}」（{selectedMember.id}）のデータがすべて削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMember(selectedMember.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
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
                  <Users className="w-4 h-4" />
                  基本情報
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
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedMember.registeredAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">保有ポイント</p>
                    <p className="text-gray-900">
                      <span className="text-lg text-purple-600">{selectedMember.points}</span>
                      <span className="text-xs text-gray-500 ml-1">pt</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">ランク条件</p>
                    <p className="text-xs text-gray-700">
                      {rankRequirements[selectedMember.rank].min}～
                      {rankRequirements[selectedMember.rank].max === Infinity
                        ? '∞'
                        : rankRequirements[selectedMember.rank].max}pt
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">メールアドレス</p>
                    <p className="text-gray-900 text-xs">{selectedMember.email || '未登録'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">クーポン利用回数</p>
                    <p className="text-purple-600 flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      {userUsageCount[selectedMember.id] || 0}回
                    </p>
                  </div>
                </div>
              </div>

              {/* ポイント内訳 */}
              {selectedMember.pointsBreakdown && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-blue-600" />
                    保有ポイント内訳（銀行取引実績）
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-600">アプリログイン</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.appLogin}</p>
                      <p className="text-xs text-gray-500">pt（月1回5pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-gray-600">公共料金・クレカ</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.utilities}</p>
                      <p className="text-xs text-gray-500">pt（10pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Banknote className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-600">預金残高</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.deposit}</p>
                      <p className="text-xs text-gray-500">pt（30万円以上で1pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs text-gray-600">給与・年金受取</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.salaryPension}</p>
                      <p className="text-xs text-gray-500">pt（20pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <PiggyBank className="w-4 h-4 text-purple-600" />
                        <p className="text-xs text-gray-600">積立NISA・iDeCo</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.investment}</p>
                      <p className="text-xs text-gray-500">pt（30pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-rose-600" />
                        <p className="text-xs text-gray-600">住宅・車ローン</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.loan}</p>
                      <p className="text-xs text-gray-500">pt（50pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Dog className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-gray-600">ペット信託</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.petTrust}</p>
                      <p className="text-xs text-gray-500">pt（30pt）</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">継続利用年数</p>
                      </div>
                      <p className="text-lg text-gray-900">{selectedMember.pointsBreakdown.continuousYears}</p>
                      <p className="text-xs text-gray-500">pt（1pt/年）</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-3 shadow-sm border-2 border-purple-300">
                      <p className="text-xs text-purple-700 mb-1">合計ポイント</p>
                      <p className="text-2xl text-purple-600">{selectedMember.points}</p>
                      <p className="text-xs text-purple-700">pt</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 利用履歴 */}
              <div>
                <h4 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  クーポン利用履歴
                </h4>
                {memberUsageRecords.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">利用日時</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">クーポン名</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">店舗名</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">割引内容</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {memberUsageRecords.map((record) => (
                            <tr key={record.id} className="hover:bg-white transition-colors">
                              <td className="px-4 py-2 text-gray-700">
                                {new Date(record.usedAt).toLocaleString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-4 py-2 text-gray-900">{record.couponTitle}</td>
                              <td className="px-4 py-2 text-gray-700">{record.storeName}</td>
                              <td className="px-4 py-2 text-gray-700">{record.discount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
    </div>
  );
}
