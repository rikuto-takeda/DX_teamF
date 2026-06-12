import { Rank } from '../App';

export interface RankConfig {
  name: string;
  color: string;
  bgColor: string;
  bgGradient: string;
  textColor: string;
  minPoints: number;
  maxPoints: number;
  description: string;
  benefits: string[];
}

export const rankConfigs: Record<Rank, RankConfig> = {
  BLUE: {
    name: 'ブルー',
    color: '#0066CC',
    bgColor: '#E6F2FF',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#003D7A',
    minPoints: 0,
    maxPoints: 19,
    description: '口座開設＋入金（1,000円以上）',
    benefits: ['防災グッズ引換', 'スターター特典']
  },
  BRONZE: {
    name: 'ブロンズ',
    color: '#CD7F32',
    bgColor: '#FFF5E6',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#8B5A00',
    minPoints: 20,
    maxPoints: 59,
    description: 'アルバイト等の給与振込（月15万円未満）',
    benefits: ['地域飲食店割引（10% OFF等）', '月2回まで利用可能']
  },
  SILVER: {
    name: 'シルバー',
    color: '#C0C0C0',
    bgColor: '#F5F5F5',
    bgGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#6B6B6B',
    minPoints: 60,
    maxPoints: 99,
    description: 'NISA契約など資産形成層',
    benefits: ['レジャー施設割引', '無制限利用', 'ブロンズ特典も利用可能']
  },
  GOLD: {
    name: 'ゴールド',
    color: '#FFD700',
    bgColor: '#FFFACD',
    bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#B8860B',
    minPoints: 100,
    maxPoints: 999999,
    description: '住宅ローン契約、長期優良顧客',
    benefits: ['プレミアム特典', '生涯2回利用可能', '全ランク特典利用可能']
  }
};

export const getNextRank = (currentRank: Rank): Rank | null => {
  const ranks: Rank[] = ['BLUE', 'BRONZE', 'SILVER', 'GOLD'];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex < ranks.length - 1) {
    return ranks[currentIndex + 1];
  }
  return null;
};

export const getPointsToNextRank = (currentPoints: number, currentRank: Rank): number | null => {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return null;
  
  const nextRankConfig = rankConfigs[nextRank];
  return nextRankConfig.minPoints - currentPoints;
};

export const getRankByPoints = (points: number): Rank => {
  if (points >= 100) return 'GOLD';
  if (points >= 60) return 'SILVER';
  if (points >= 20) return 'BRONZE';
  return 'BLUE';
};