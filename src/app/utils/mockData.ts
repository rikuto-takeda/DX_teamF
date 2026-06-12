import { User, Coupon, Store, Rank, UsageRecord, PointsBreakdown } from '../App';

// モックユーザーデータ
export const mockUsers: Record<string, User> = {
  'user1': {
    id: 'user1',
    name: '山田 太郎',
    rank: 'GOLD',
    points: 99,
    joinDate: '2023-04-15',
    registeredAt: '2023-04-15',
    email: 'yamada.taro@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 210万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 30,
      loan: 0,
      petTrust: 30,
      continuousYears: 3 // 2023年登録、約3年
    }
  },
  'user2': {
    id: 'user2',
    name: '佐藤 花子',
    rank: 'SILVER',
    points: 68,
    joinDate: '2023-09-20',
    registeredAt: '2023-09-20',
    email: 'sato.hanako@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 240万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 30,
      loan: 0,
      petTrust: 0,
      continuousYears: 2 // 2023年9月登録、約2年
    }
  },
  'user3': {
    id: 'user3',
    name: '鈴木 一郎',
    rank: 'BRONZE',
    points: 35,
    joinDate: '2024-06-10',
    registeredAt: '2024-06-10',
    email: 'suzuki.ichiro@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 0,
      salaryPension: 20,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年6月登録、1年未満
    }
  },
  'demo': {
    id: 'demo',
    name: 'デモ ユーザー',
    rank: 'BLUE',
    points: 15,
    joinDate: '2024-11-01',
    registeredAt: '2024-11-01',
    email: 'demo@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 0,
      salaryPension: 0,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年11月登録、1年未満
    }
  },
  'user4': {
    id: 'user4',
    name: '高橋 美咲',
    rank: 'GOLD',
    points: 119,
    joinDate: '2023-02-10',
    registeredAt: '2023-02-10',
    email: 'takahashi.misaki@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 60万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 30,
      loan: 50,
      petTrust: 0,
      continuousYears: 3 // 2023年2月登録、約3年
    }
  },
  'user5': {
    id: 'user5',
    name: '田中 健太',
    rank: 'SILVER',
    points: 68,
    joinDate: '2023-07-15',
    registeredAt: '2023-07-15',
    email: 'tanaka.kenta@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 540万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 30,
      loan: 0,
      petTrust: 0,
      continuousYears: 2 // 2023年7月登録、約2年
    }
  },
  'user6': {
    id: 'user6',
    name: '伊藤 優子',
    rank: 'BRONZE',
    points: 37,
    joinDate: '2024-03-20',
    registeredAt: '2024-03-20',
    email: 'ito.yuko@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 270万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 1 // 2024年3月登録、約1年
    }
  },
  'user7': {
    id: 'user7',
    name: '渡辺 大輔',
    rank: 'BLUE',
    points: 16,
    joinDate: '2024-09-05',
    registeredAt: '2024-09-05',
    email: 'watanabe.daisuke@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 150万円の預金（30万円以上で1pt）
      salaryPension: 0,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年9月登録、1年未満
    }
  },
  'user8': {
    id: 'user8',
    name: '中村 愛',
    rank: 'BRONZE',
    points: 36,
    joinDate: '2024-05-12',
    registeredAt: '2024-05-12',
    email: 'nakamura.ai@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 150万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年5月登録、1年未満
    }
  },
  'user9': {
    id: 'user9',
    name: '小林 翔太',
    rank: 'SILVER',
    points: 78,
    joinDate: '2023-11-28',
    registeredAt: '2023-11-28',
    email: 'kobayashi.shota@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 390万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 30,
      loan: 0,
      petTrust: 0,
      continuousYears: 2 // 2023年11月登録、約2年
    }
  },
  'user10': {
    id: 'user10',
    name: '加藤 美穂',
    rank: 'GOLD',
    points: 110,
    joinDate: '2023-05-18',
    registeredAt: '2023-05-18',
    email: 'kato.miho@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 0,
      salaryPension: 20,
      investment: 30,
      loan: 50,
      petTrust: 0,
      continuousYears: 5 // 2023年5月登録、約3年（調整して5年相当）
    }
  },
  'user11': {
    id: 'user11',
    name: '吉田 航',
    rank: 'BLUE',
    points: 16,
    joinDate: '2024-10-30',
    registeredAt: '2024-10-30',
    email: 'yoshida.wataru@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 300万円の預金（30万円以上で1pt）
      salaryPension: 0,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年10月登録、1年未満
    }
  },
  'user12': {
    id: 'user12',
    name: '山本 彩香',
    rank: 'BRONZE',
    points: 36,
    joinDate: '2024-04-08',
    registeredAt: '2024-04-08',
    email: 'yamamoto.ayaka@example.com',
    pointsBreakdown: {
      appLogin: 5,
      utilities: 10,
      deposit: 1, // 450万円の預金（30万円以上で1pt）
      salaryPension: 20,
      investment: 0,
      loan: 0,
      petTrust: 0,
      continuousYears: 0 // 2024年4月登録、1年未満
    }
  }
};

// モッククーポンデータ
export const mockCoupons: Coupon[] = [
  // BLUE ランク（スターターパック）
  {
    id: 'coupon_blue_1',
    title: '防災グッズ無料引換券',
    description: '新規会員向けスターター特典。提携企業ダイシンにて防災グッズと無料で引き換えできます。',
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
    requiredRank: 'BLUE',
    validUntil: '2025-03-31',
    storeName: 'ダイシン',
    discount: '防災グッズ1点無料',
    usageLimitType: 'once',
    usageLimitCount: 1,
    validityPeriodDays: 90
  },
  
  // BRONZE ランク
  {
    id: 'coupon_bronze_1',
    title: 'らーめん堂 仙台っ子 10% OFF',
    description: '人気ラーメン店での会計が10%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    requiredRank: 'BRONZE',
    validUntil: '2025-12-31',
    storeName: 'らーめん堂 仙台っ子',
    discount: '会計10% OFF',
    usageLimitType: 'monthly',
    usageLimitCount: 2
  },
  {
    id: 'coupon_bronze_2',
    title: 'ハミングバード 10% OFF',
    description: 'ゲームセンターでのご利用が10%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    requiredRank: 'BRONZE',
    validUntil: '2025-12-31',
    storeName: 'ハミングバード',
    discount: 'ゲーム代10% OFF',
    usageLimitType: 'monthly',
    usageLimitCount: 2
  },
  {
    id: 'coupon_bronze_3',
    title: 'うまい鮨勘 10% OFF',
    description: '回転寿司での会計が10%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
    requiredRank: 'BRONZE',
    validUntil: '2025-12-31',
    storeName: 'うまい鮨勘',
    discount: '会計10% OFF',
    usageLimitType: 'monthly',
    usageLimitCount: 2
  },
  
  // SILVER ランク
  {
    id: 'coupon_silver_1',
    title: 'サンピアの湯 20% OFF',
    description: '温浴施設の入館料が20%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    requiredRank: 'SILVER',
    validUntil: '2025-12-31',
    storeName: 'サンピアの湯',
    discount: '入館料20% OFF',
    usageLimitType: 'unlimited'
  },
  {
    id: 'coupon_silver_2',
    title: 'ボウル・サンシャイン 20% OFF',
    description: 'ボウリング場のゲーム代が20%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1562077772-3bd90403f7f0?w=800',
    requiredRank: 'SILVER',
    validUntil: '2025-12-31',
    storeName: 'ボウル・サンシャイン',
    discount: 'ゲーム代20% OFF',
    usageLimitType: 'unlimited'
  },
  {
    id: 'coupon_silver_3',
    title: '八木山ベニーランド 20% OFF',
    description: '遊園地の入園料・フリーパスが20%オフになります。',
    imageUrl: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=800',
    requiredRank: 'SILVER',
    validUntil: '2025-12-31',
    storeName: '八木山ベニーランド',
    discount: '入園料/フリーパス20% OFF',
    usageLimitType: 'unlimited'
  },
  
  // GOLD ランク
  {
    id: 'coupon_gold_1',
    title: '仙台ロイヤルパークホテル 80% OFF',
    description: 'プレミアムホテルの基本料金が80%オフになります。生涯2回までご利用いただけます。',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    requiredRank: 'GOLD',
    validUntil: '2025-12-31',
    storeName: '仙台ロイヤルパークホテル',
    discount: '基本料金80% OFF',
    usageLimitType: 'lifetime',
    usageLimitCount: 2
  },
  {
    id: 'coupon_gold_2',
    title: '清月記 80% OFF',
    description: '高級レストランの基本料金が80%オフになります。生涯2回までご利用いただけます。',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    requiredRank: 'GOLD',
    validUntil: '2025-12-31',
    storeName: '清月記',
    discount: '基本料金80% OFF',
    usageLimitType: 'lifetime',
    usageLimitCount: 2
  }
];

// モック店舗データ
export const mockStores: Store[] = [
  { id: 'store1', name: 'ダイシン', code: '001' },
  { id: 'store2', name: 'らーめん堂 仙台っ子', code: '123' },
  { id: 'store3', name: 'ハミングバード', code: '456' },
  { id: 'store4', name: 'うまい鮨勘', code: '789' },
  { id: 'store5', name: 'サンピアの湯', code: '234' },
  { id: 'store6', name: 'ボウル・サンシャイン', code: '567' },
  { id: 'store7', name: '八木山ベニーランド', code: '890' },
  { id: 'store8', name: '仙台ロイヤルパークホテル', code: '345' },
  { id: 'store9', name: '清月記', code: '678' }
];

// ランクの階層順序
const rankOrder: Rank[] = ['BLUE', 'BRONZE', 'SILVER', 'GOLD'];

// ユーザーのランクに応じて利用可能なクーポンをフィルタリング
export const getAvailableCoupons = (userRank: Rank): Coupon[] => {
  const userRankIndex = rankOrder.indexOf(userRank);
  return mockCoupons.filter(coupon => {
    const couponRankIndex = rankOrder.indexOf(coupon.requiredRank);
    return couponRankIndex <= userRankIndex;
  });
};

// 店舗コードから店舗を検索
export const findStoreByCode = (code: string): Store | null => {
  return mockStores.find(store => store.code === code) || null;
};

// クーポンの残り使用回数を計算
export const getRemainingUsageCount = (
  coupon: Coupon,
  userId: string,
  usageRecords: UsageRecord[]
): number | null => {
  if (coupon.usageLimitType === 'unlimited') {
    return null; // 無制限
  }

  const userRecords = usageRecords.filter(
    record => record.userId === userId && record.couponId === coupon.id
  );

  if (coupon.usageLimitType === 'once' || coupon.usageLimitType === 'lifetime') {
    const usedCount = userRecords.length;
    return (coupon.usageLimitCount || 1) - usedCount;
  }

  if (coupon.usageLimitType === 'monthly') {
    // 今月の使用回数を計算
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // BRONZEランクの場合、すべてのBRONZEクーポンの使用回数を合計
    const bronzeCouponIds = mockCoupons
      .filter(c => c.requiredRank === 'BRONZE')
      .map(c => c.id);

    const monthlyRecords = usageRecords.filter(record => {
      const recordDate = new Date(record.usedAt);
      return (
        record.userId === userId &&
        bronzeCouponIds.includes(record.couponId) &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    const usedCount = monthlyRecords.length;
    return (coupon.usageLimitCount || 2) - usedCount;
  }

  return 0;
};

// クーポンが使用可能かチェック
export const canUseCoupon = (
  coupon: Coupon,
  userId: string,
  usageRecords: UsageRecord[]
): boolean => {
  const remaining = getRemainingUsageCount(coupon, userId, usageRecords);
  return remaining === null || remaining > 0;
};

// モック利用履歴データ（サンプル）
export const mockUsageRecords: UsageRecord[] = [
  // 2025年12月のデータ
  {
    id: 'usage_1',
    userId: 'user1',
    couponId: 'coupon_gold_1',
    storeId: 'store8',
    usedAt: '2025-12-05T14:30:00',
    couponTitle: '仙台ロイヤルパークホテル 80% OFF',
    storeName: '仙台ロイヤルパークホテル',
    discount: '基本料金80% OFF'
  },
  {
    id: 'usage_2',
    userId: 'user2',
    couponId: 'coupon_silver_1',
    storeId: 'store5',
    usedAt: '2025-12-10T18:20:00',
    couponTitle: 'サンピアの湯 20% OFF',
    storeName: 'サンピアの湯',
    discount: '入館料20% OFF'
  },
  {
    id: 'usage_3',
    userId: 'user3',
    couponId: 'coupon_bronze_1',
    storeId: 'store2',
    usedAt: '2025-12-12T12:15:00',
    couponTitle: 'らーめん堂 仙台っ子 10% OFF',
    storeName: 'らーめん堂 仙台っ子',
    discount: '会計10% OFF'
  },
  {
    id: 'usage_4',
    userId: 'demo',
    couponId: 'coupon_blue_1',
    storeId: 'store1',
    usedAt: '2025-12-15T10:00:00',
    couponTitle: '防災グッズ無料引換券',
    storeName: 'ダイシン',
    discount: '防災グッズ1点無料'
  },
  {
    id: 'usage_5',
    userId: 'user1',
    couponId: 'coupon_gold_2',
    storeId: 'store9',
    usedAt: '2025-12-18T19:30:00',
    couponTitle: '清月記 80% OFF',
    storeName: '清月記',
    discount: '基本料金80% OFF'
  },
  
  // 2026年1月のデータ
  {
    id: 'usage_6',
    userId: 'user2',
    couponId: 'coupon_silver_2',
    storeId: 'store6',
    usedAt: '2026-01-02T15:45:00',
    couponTitle: 'ボウル・サンシャイン 20% OFF',
    storeName: 'ボウル・サンシャイン',
    discount: 'ゲーム代20% OFF'
  },
  {
    id: 'usage_7',
    userId: 'user3',
    couponId: 'coupon_bronze_2',
    storeId: 'store3',
    usedAt: '2026-01-02T16:20:00',
    couponTitle: 'ハミングバード 10% OFF',
    storeName: 'ハミングバード',
    discount: 'ゲーム代10% OFF'
  },
  {
    id: 'usage_8',
    userId: 'user1',
    couponId: 'coupon_silver_3',
    storeId: 'store7',
    usedAt: '2026-01-03T11:00:00',
    couponTitle: '八木山ベニーランド 20% OFF',
    storeName: '八木山ベニーランド',
    discount: '入園料/フリーパス20% OFF'
  },
  {
    id: 'usage_9',
    userId: 'user2',
    couponId: 'coupon_silver_1',
    storeId: 'store5',
    usedAt: '2026-01-03T17:30:00',
    couponTitle: 'サンピアの湯 20% OFF',
    storeName: 'サンピアの湯',
    discount: '入館料20% OFF'
  },
  {
    id: 'usage_10',
    userId: 'user3',
    couponId: 'coupon_bronze_3',
    storeId: 'store4',
    usedAt: '2026-01-03T18:45:00',
    couponTitle: 'うまい鮨勘 10% OFF',
    storeName: 'うまい鮨勘',
    discount: '会計10% OFF'
  },
  {
    id: 'usage_11',
    userId: 'user1',
    couponId: 'coupon_silver_2',
    storeId: 'store6',
    usedAt: '2026-01-03T14:20:00',
    couponTitle: 'ボウル・サンシャイン 20% OFF',
    storeName: 'ボウル・サンシャイン',
    discount: 'ゲーム代20% OFF'
  },
  {
    id: 'usage_12',
    userId: 'user3',
    couponId: 'coupon_bronze_1',
    storeId: 'store2',
    usedAt: '2026-01-03T12:30:00',
    couponTitle: 'らーめん堂 仙台っ子 10% OFF',
    storeName: 'らーめん堂 仙台っ子',
    discount: '会計10% OFF'
  },
  {
    id: 'usage_13',
    userId: 'user2',
    couponId: 'coupon_silver_3',
    storeId: 'store7',
    usedAt: '2026-01-03T10:15:00',
    couponTitle: '八木山ベニーランド 20% OFF',
    storeName: '八木山ベニーランド',
    discount: '入園料/フリーパス20% OFF'
  },
  {
    id: 'usage_14',
    userId: 'user1',
    couponId: 'coupon_silver_1',
    storeId: 'store5',
    usedAt: '2026-01-03T19:00:00',
    couponTitle: 'サンピアの湯 20% OFF',
    storeName: 'サンピアの湯',
    discount: '入館料20% OFF'
  },
  {
    id: 'usage_15',
    userId: 'user3',
    couponId: 'coupon_bronze_2',
    storeId: 'store3',
    usedAt: '2026-01-03T13:45:00',
    couponTitle: 'ハミングバード 10% OFF',
    storeName: 'ハミングバード',
    discount: 'ゲーム代10% OFF'
  }
];