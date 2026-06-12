import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { LoginErrorPage } from './components/LoginErrorPage';
import { SignupPage } from './components/SignupPage';
import { SignupCompletePage } from './components/SignupCompletePage';
import { MyPage } from './components/MyPage';
import { CouponList } from './components/CouponList';
import { CouponDetail } from './components/CouponDetail';
import { StoreCodeInput } from './components/StoreCodeInput';
import { CompletionScreen } from './components/CompletionScreen';
import { UsageHistory } from './components/UsageHistory';
import { PointsGuide } from './components/PointsGuide';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WelcomeBonusDialog } from './components/WelcomeBonusDialog';
import { Toaster } from './components/ui/sonner';
import { mockUsageRecords } from './utils/mockData';

export type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';

export interface PointsBreakdown {
  appLogin: number; // アプリログイン（月1回で5pt）
  utilities: number; // 公共料金・クレカ決済（10pt）
  deposit: number; // 預金残高（30万円以上で1pt）
  salaryPension: number; // 給与・年金受取（20pt）
  investment: number; // 積立NISA・iDeCo（30pt）
  loan: number; // 住宅・車ローン（50pt）
  petTrust: number; // ペット信託（30pt）
  continuousYears: number; // 継続利用年数（1pt/年）
}

export interface User {
  id: string;
  name: string;
  rank: Rank;
  points: number;
  joinDate: string;
  registeredAt: string;
  email?: string;
  pointsBreakdown?: PointsBreakdown;
}

export type UsageLimitType = 'once' | 'monthly' | 'lifetime' | 'unlimited';

export interface Coupon {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  requiredRank: Rank;
  validUntil: string;
  storeName: string;
  discount: string;
  usageLimitType: UsageLimitType;
  usageLimitCount?: number; // 制限回数（onceなら1、monthlyなら2、lifetimeなら2など）
  validityPeriodDays?: number; // 有効期限（日数、BLUEの場合90日など）
}

export interface Store {
  id: string;
  name: string;
  code: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  couponId: string;
  storeId: string;
  usedAt: string;
  couponTitle: string;
  storeName: string;
  discount: string;
}

type Screen = 
  | 'login' 
  | 'admin-login'
  | 'login-error'
  | 'admin-login-error'
  | 'signup'
  | 'signup-complete'
  | 'mypage' 
  | 'coupon-list' 
  | 'coupon-detail' 
  | 'store-code-input' 
  | 'completion'
  | 'usage-history'
  | 'points-guide'
  | 'admin-dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [usedCouponStore, setUsedCouponStore] = useState<{ coupon: Coupon; store: Store } | null>(null);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>(mockUsageRecords);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  // LocalStorageから使用履歴を読み込み
  useEffect(() => {
    const savedRecords = localStorage.getItem('usageRecords');
    if (savedRecords) {
      setUsageRecords(JSON.parse(savedRecords));
    }
  }, []);

  // 使用履歴を保存
  const saveUsageRecord = (record: UsageRecord) => {
    const newRecords = [...usageRecords, record];
    setUsageRecords(newRecords);
    localStorage.setItem('usageRecords', JSON.stringify(newRecords));
  };

  // 初回ログイン判定と初回特典付与
  const checkFirstLogin = (userId: string): boolean => {
    const firstLoginKey = `firstLogin_${userId}`;
    const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
    
    if (!hasLoggedInBefore) {
      // 初回ログイン: フラグを保存
      localStorage.setItem(firstLoginKey, 'true');
      return true;
    }
    return false;
  };

  const handleLogin = (userData: User, admin: boolean = false, isNewUser: boolean = false) => {
    setUser(userData);
    setIsAdmin(admin);
    
    if (admin) {
      setCurrentScreen('admin-dashboard');
    } else {
      if (isNewUser) {
        // 新規登録の場合は登録完了画面へ
        setCurrentScreen('signup-complete');
      } else {
        // 既存ユーザーのログインの場合は初回ログイン判定
        const isFirstLogin = checkFirstLogin(userData.id);
        
        if (isFirstLogin) {
          // 初回特典ダイアログを表示
          setShowWelcomeBonus(true);
        }
        
        setCurrentScreen('mypage');
      }
    }
  };

  const handleLoginError = (message: string) => {
    setLoginErrorMessage(message);
    // 現在の画面に基づいてエラー画面を決定
    if (currentScreen === 'admin-login') {
      setCurrentScreen('admin-login-error');
    } else {
      setCurrentScreen('login-error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentScreen('login');
  };

  const handleCouponSelect = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCurrentScreen('coupon-detail');
  };

  const handleUseCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCurrentScreen('store-code-input');
  };

  const handleStoreCodeSubmit = (store: Store) => {
    if (selectedCoupon && user) {
      const record: UsageRecord = {
        id: `usage_${Date.now()}`,
        userId: user.id,
        couponId: selectedCoupon.id,
        storeId: store.id,
        usedAt: new Date().toISOString(),
        couponTitle: selectedCoupon.title,
        storeName: store.name,
        discount: selectedCoupon.discount
      };
      saveUsageRecord(record);
      setUsedCouponStore({ coupon: selectedCoupon, store });
      setCurrentScreen('completion');
    }
  };

  const handleBackToMyPage = () => {
    setSelectedCoupon(null);
    setUsedCouponStore(null);
    setCurrentScreen('mypage');
  };

  const handleBackToCouponList = () => {
    setSelectedCoupon(null);
    setCurrentScreen('coupon-list');
  };

  const handleSignupComplete = () => {
    // 登録完了画面からログイン画面へ戻る
    setUser(null);
    setIsAdmin(false);
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === 'login' && (
        <LoginPage 
          onLogin={handleLogin} 
          onSignup={() => setCurrentScreen('signup')}
          onAdminLogin={() => setCurrentScreen('admin-login')}
          onLoginError={handleLoginError}
        />
      )}
      
      {currentScreen === 'admin-login' && (
        <AdminLoginPage 
          onLogin={handleLogin}
          onBackToUserLogin={() => setCurrentScreen('login')}
          onLoginError={handleLoginError}
        />
      )}
      
      {currentScreen === 'login-error' && (
        <LoginErrorPage 
          isAdminLogin={false}
          message={loginErrorMessage}
          onBack={() => setCurrentScreen('login')}
        />
      )}
      
      {currentScreen === 'admin-login-error' && (
        <LoginErrorPage 
          isAdminLogin={true}
          message={loginErrorMessage}
          onBack={() => setCurrentScreen('admin-login')}
        />
      )}
      
      {currentScreen === 'signup' && (
        <SignupPage 
          onSignup={handleLogin} 
          onBack={() => setCurrentScreen('login')}
        />
      )}
      
      {currentScreen === 'signup-complete' && user && (
        <SignupCompletePage 
          user={user}
          onContinue={handleSignupComplete}
        />
      )}
      
      {currentScreen === 'mypage' && user && !isAdmin && (
        <MyPage 
          user={user} 
          onViewCoupons={() => setCurrentScreen('coupon-list')}
          onViewHistory={() => setCurrentScreen('usage-history')}
          onViewPointsGuide={() => setCurrentScreen('points-guide')}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'coupon-list' && user && (
        <CouponList 
          user={user}
          usageRecords={usageRecords}
          onSelectCoupon={handleCouponSelect}
          onBack={handleBackToMyPage}
        />
      )}
      
      {currentScreen === 'coupon-detail' && selectedCoupon && user && (
        <CouponDetail 
          coupon={selectedCoupon}
          user={user}
          usageRecords={usageRecords}
          onUseCoupon={handleUseCoupon}
          onBack={handleBackToCouponList}
        />
      )}
      
      {currentScreen === 'store-code-input' && selectedCoupon && (
        <StoreCodeInput 
          coupon={selectedCoupon}
          onSubmit={handleStoreCodeSubmit}
          onBack={handleBackToCouponList}
        />
      )}
      
      {currentScreen === 'completion' && usedCouponStore && (
        <CompletionScreen 
          coupon={usedCouponStore.coupon}
          store={usedCouponStore.store}
          onComplete={handleBackToMyPage}
        />
      )}

      {currentScreen === 'usage-history' && user && (
        <UsageHistory 
          user={user}
          usageRecords={usageRecords}
          onBack={handleBackToMyPage}
        />
      )}

      {currentScreen === 'points-guide' && (
        <PointsGuide 
          onBack={handleBackToMyPage}
        />
      )}

      {currentScreen === 'admin-dashboard' && isAdmin && (
        <AdminDashboard
          usageRecords={usageRecords}
          onLogout={handleLogout}
        />
      )}
      
      {/* 初回特典通知ダイアログ */}
      {showWelcomeBonus && (
        <WelcomeBonusDialog onClose={() => setShowWelcomeBonus(false)} />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;