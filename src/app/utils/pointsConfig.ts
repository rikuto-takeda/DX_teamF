export interface PointCondition {
  category: string;
  items: {
    name: string;
    points: number;
    description?: string;
  }[];
}

export const pointConditions: PointCondition[] = [
  {
    category: 'アプリ利用',
    items: [
      { name: 'アプリログイン', points: 5, description: '最大月1回' }
    ]
  },
  {
    category: '決済・取引',
    items: [
      { name: '公共料金・クレジットカード決済', points: 10 },
      { name: '給与・年金受取', points: 20 }
    ]
  },
  {
    category: '資産運用・管理',
    items: [
      { name: '預金残高', points: 1, description: '30万円ごとに1pt' },
      { name: '積立NISA', points: 30 },
      { name: 'ペット信託', points: 30 }
    ]
  },
  {
    category: 'ローン契約',
    items: [
      { name: '住宅・車ローン契約', points: 50 }
    ]
  },
  {
    category: 'その他',
    items: [
      { name: '継続利用年数', points: 1, description: '1年ごとに1pt' }
    ]
  }
];

export const rankThresholds = [
  { rank: 'BLUE', minPoints: 0, maxPoints: 19, name: 'ブルー' },
  { rank: 'BRONZE', minPoints: 20, maxPoints: 59, name: 'ブロンズ' },
  { rank: 'SILVER', minPoints: 60, maxPoints: 99, name: 'シルバー' },
  { rank: 'GOLD', minPoints: 100, maxPoints: 999999, name: 'ゴールド' }
];
