// App.tsx
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
import { toast } from 'sonner';

export type Rank = 'BLUE' | 'BRONZE' | 'SILVER' | 'GOLD';

export interface PointsBreakdown {
  appLogin: number;
  utilities: number;
  deposit: number;
  salaryPension: number;
  investment: number;
  loan: number;
  petTrust: number;
  continuousYears: number;
}

export interface User {
  id: string | number;
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
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  requiredRank: Rank;
  required_rank?: Rank; // 安全対策
  validUntil: string;
  storeName: string;
  discount: string;
  usageLimitType: UsageLimitType;
  usageLimitCount?: number;
  validityPeriodDays?: number;
}

export interface Store {
  id: string | number;
  name: string;
  code: string;
}

export interface UsageRecord {
  id: string | number;
  userId: string | number;
  couponId: string | number;
  storeId: string | number;
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
  
  // 初期状態は空配列にして、本物と同期させる
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  // アプリ起動時および画面切り替え時に、バックエンドの本物データを強制ロード
  const syncWithBackendDB = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        const mappedRecords: UsageRecord[] = (data.usageRecords || []).map((r: any) => ({
          id: r.id,
          userId: r.userId,
          couponId: r.couponId,
          storeId: r.storeId,
          usedAt: r.usedAt,
          couponTitle: r.couponTitle,
          storeName: r.storeName,
          discount: r.discount
        }));
        setUsageRecords(mappedRecords);
      }
    } catch (error) {
      console.error("履歴のバックエンド同期エラー:", error);
    }
  };

  useEffect(() => {
    syncWithBackendDB();
  }, [currentScreen]); // 画面が切り替わるたびに自動で裏側から本物データをリロード

  // 使用履歴を保存
  const saveUsageRecord = (record: UsageRecord) => {
    const newRecords = [record, ...usageRecords];
    setUsageRecords(newRecords);
  };

  // 初回ログイン判定
  const checkFirstLogin = (userId: string | number): boolean => {
    const firstLoginKey = `firstLogin_${userId}`;
    const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
    if (!hasLoggedInBefore) {
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
        setCurrentScreen('signup-complete');
      } else {
        const isFirstLogin = checkFirstLogin(userData.id);
        if (isFirstLogin) {
          setShowWelcomeBonus(true);
        }
        setCurrentScreen('mypage');
      }
    }
  };

  const handleLoginError = (message: string) => {
    setLoginErrorMessage(message);
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

  // 【修正確定版】バックエンドのUserCouponテーブルに実在する所持IDを送るロジック
  const handleStoreCodeSubmit = async (store: Store) => {
    if (selectedCoupon && user) {
      try {
        // 💡 1. マスタのcouponIdではなく、バックエンドが要求する所持レコードID（user_coupon_id）を安全に抽出
        const targetUserCouponId = (selectedCoupon as any).user_coupon_id || selectedCoupon.id;

        // 💡 2. 正しいパラメータ（所持IDと店舗の3桁コード）でPOST送信
        const response = await fetch('http://localhost:5000/api/coupon/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_coupon_id: targetUserCouponId,
            shop_code: store.code
          })
        });

        const resData = await response.json();

        // 💡 3. バックエンドが返した400エラー（無効なコード、あるいはIDミスマッチ）をトースト表示
        if (!response.ok) {
          toast.error(resData.error || 'クーポンの適用に失敗しました');
          return;
        }

        // 💡 4. 成功したらフロント側の利用履歴の配列を更新して完了画面へ
        const record: UsageRecord = {
          id: resData.user_coupon_id || `usage_${Date.now()}`,
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
        
        toast.success('データベースの消込が正常に完了しました！');
        setCurrentScreen('completion');

      } catch (error) {
        console.error("消込API通信エラー:", error);
        toast.error('サーバーへの消込リクエストに失敗しました');
      }
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
      
      {showWelcomeBonus && (
        <WelcomeBonusDialog onClose={() => setShowWelcomeBonus(false)} />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;