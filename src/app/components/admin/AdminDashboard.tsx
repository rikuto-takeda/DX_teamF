// AdminDashboard.tsx
import { useState } from 'react';
import { UsageRecord } from '../../App';
import { CouponManagement } from './CouponManagement';
import { StoreManagement } from './StoreManagement';
import { UsageAnalytics } from './UsageAnalytics';
import { CouponDistribution } from './CouponDistribution';
import { MemberManagement } from './MemberManagement';
import { CouponCreateForm } from './CouponCreateForm'; // 💡 新規作成フォームをインポート
import { LogOut, Gift, Store, BarChart3, Send, Users } from 'lucide-react';

interface AdminDashboardProps {
  usageRecords: UsageRecord[];
  onLogout: () => void;
}

type AdminTab = 'analytics' | 'members' | 'coupons' | 'distribution' | 'stores';

export function AdminDashboard({ usageRecords, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl text-white mb-1">管理者ダッシュボード</h1>
            <p className="text-purple-100 text-sm">Aoba Link 運営管理システム</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">ログアウト</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-purple-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>分析</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-white text-purple-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>クーポン管理</span>
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === 'distribution'
                ? 'bg-white text-purple-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>クーポン配布</span>
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === 'stores'
                ? 'bg-white text-purple-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>店舗管理</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-white text-purple-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>会員管理</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'analytics' && (
          <UsageAnalytics usageRecords={usageRecords} />
        )}
        {activeTab === 'members' && (
          <MemberManagement usageRecords={usageRecords} />
        )}
        {activeTab === 'coupons' && (
          <div className="space-y-8">
            {/* 💡 クーポン作成フォームを上部に配置し、既存の一覧（Management）を下部に並べる構造に最適化 */}
            <CouponCreateForm />
            <CouponManagement />
          </div>
        )}
        {activeTab === 'distribution' && (
          <CouponDistribution />
        )}
        {activeTab === 'stores' && (
          <StoreManagement />
        )}
      </div>
    </div>
  );
}