import { useState, useEffect } from 'react';
import { TrendingUp, Users, Gift, Store, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface DBUsageRecord {
  id: number;
  userId: string | number;
  username: string;
  userRank: 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';
  couponId: string | number;
  couponTitle: string;
  discount: string;
  storeId: string | number;
  storeName: string;
  storeCode: string;
  usedAt: string;
}

export function UsageAnalytics() {
  const [usageRecords, setUsageRecords] = useState<DBUsageRecord[]>([]);
  const [masterStats, setMasterStats] = useState({ coupons: 0, stores: 0 });
  const [loading, setLoading] = useState(true);

  // 💡 店舗コードの取得
  const currentStoreCode = localStorage.getItem('store_code') || 
                           localStorage.getItem('storeCode') || 
                           localStorage.getItem('adminStoreCode') || '';

  useEffect(() => {
    async function fetchAnalytics() {
      if (!currentStoreCode) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/admin/analytics?store_code=${currentStoreCode}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'X-Store-Code': currentStoreCode }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsageRecords(data.usageRecords || []);
          setMasterStats({
            coupons: data.uniqueCouponsCount || 0,
            stores: data.uniqueStoresCount || 0
          });
        }
      } catch (error) {
        console.error("通信エラー:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [currentStoreCode]);

  const totalUsages = usageRecords.length;
  const uniqueUsers = new Set(usageRecords.map(r => r.userId?.toString())).size;
  const uniqueCoupons = masterStats.coupons || new Set(usageRecords.map(r => r.couponId?.toString())).size;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          現在表示中のデータソース: <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">店舗コード [{currentStoreCode || '未設定'}]</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">解析中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">自店累計使用回数</p>
            <p className="text-3xl text-blue-600">{totalUsages}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">自店アクティブ顧客数</p>
            <p className="text-3xl text-green-600">{uniqueUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">自店クーポン総数</p>
            <p className="text-3xl text-purple-600">{uniqueCoupons}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">データ対象範囲</p>
            <p className="text-lg font-bold text-orange-600">自店舗のみ</p>
          </div>
        </div>
      )}
    </div>
  );
}