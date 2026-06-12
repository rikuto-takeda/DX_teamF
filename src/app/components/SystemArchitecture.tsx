import { 
  Users, 
  Store as StoreIcon, 
  ShieldCheck, 
  Monitor, 
  Smartphone, 
  Tablet,
  Server,
  Database,
  Cloud,
  Lock,
  ArrowLeftRight,
  Building2,
  Wallet,
  TrendingUp,
  UserPlus
} from 'lucide-react';

export function SystemArchitecture() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* タイトル */}
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-2">Aoba Link システム全体構成図</h1>
          <p className="text-gray-600">地域共創型ロイヤリティシステム - クライアントサーバ方式</p>
          <p className="text-sm text-gray-500 mt-2">仙台あおば銀行 若年層メインバンク化促進システム</p>
        </div>

        <div className="space-y-8">
          {/* システムの目的 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-lg mb-3">システムの目的</h2>
            <p className="text-sm leading-relaxed">
              仙台あおば銀行における若年層のメインバンク化を促進し、将来的な優良顧客へ育成（ロイヤリティ化）。
              金融取引（NISA、ローン、給与受取等）をポイント化し、4段階の会員ランク（BLUE, BRONZE, SILVER, GOLD）に応じて
              地元提携企業の特典を提供することで、継続的な利用動機を創出する。
            </p>
          </div>

          {/* ユーザー層 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg">ユーザー層</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm">銀行会員ユーザー</p>
                <p className="text-xs text-gray-600 mt-1">会員ランク: BLUE/BRONZE/SILVER/GOLD</p>
                <p className="text-xs text-gray-600">会員登録・ランク確認・クーポン利用</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <StoreIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm">地元提携店舗</p>
                <p className="text-xs text-gray-600 mt-1">店舗コード入力・クーポン確認</p>
                <p className="text-xs text-gray-600">特典提供・利用実績管理</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm">銀行運営管理者</p>
                <p className="text-xs text-gray-600 mt-1">分析・管理ダッシュボード</p>
                <p className="text-xs text-gray-600">クロス集計・RFM分析・最適化</p>
              </div>
            </div>
          </div>

          {/* 通信プロトコル */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm">HTTPS/TLS暗号化通信</span>
            </div>
          </div>

          {/* クライアント層 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-green-600" />
              <h2 className="text-lg">クライアント層（フロントエンド）</h2>
            </div>
            
            {/* デバイス */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs">PC</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs">スマートフォン</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Tablet className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                <p className="text-xs">タブレット</p>
              </div>
            </div>

            {/* 技術スタック */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
              <p className="text-sm mb-3">Webブラウザアプリケーション</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">UI Framework</p>
                  <p className="text-sm">React 18 + TypeScript</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">スタイリング</p>
                  <p className="text-sm">Tailwind CSS v4</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">状態管理</p>
                  <p className="text-sm">React Hooks</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">データ保存</p>
                  <p className="text-sm">LocalStorage / Supabase</p>
                </div>
              </div>
            </div>

            {/* 主要機能 */}
            <div className="border-t pt-4">
              <h3 className="text-sm mb-3">① ユーザ機能（会員向け機能）</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="border border-gray-200 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-600">会員登録機能</p>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• 新規会員登録</li>
                    <li>• 銀行口座連携</li>
                    <li>• プロフィール設定</li>
                  </ul>
                </div>
                <div className="border border-gray-200 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2">ランク・特典管理</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• マイページ（ランク・ポイント表示）</li>
                    <li>• 利用可能特典情報の閲覧</li>
                    <li>• ポイント獲得ガイド</li>
                  </ul>
                </div>
                <div className="border border-gray-200 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2">クーポン利用</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• クーポン一覧・詳細閲覧</li>
                    <li>• 店舗コード入力による利用</li>
                    <li>• 使用制限の自動チェック</li>
                  </ul>
                </div>
                <div className="border border-gray-200 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2">履歴管理</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• 使用履歴確認</li>
                    <li>• 残り使用回数表示</li>
                    <li>• 取引履歴の記録</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ネットワーク層 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
              <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              <span className="text-sm">RESTful API / WebSocket</span>
            </div>
          </div>

          {/* サーバ層 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg">サーバ層（バックエンド）</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Webサーバ */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-orange-600" />
                  <p className="text-sm">Webサーバ</p>
                </div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 静的ファイル配信</li>
                  <li>• SPA（React）ホスティング</li>
                  <li>• CDN連携</li>
                  <li>• 負荷分散</li>
                </ul>
              </div>

              {/* APIサーバ */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-5 h-5 text-orange-600" />
                  <p className="text-sm">APIサーバ（Supabase）</p>
                </div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• RESTful API提供</li>
                  <li>• 認証・認可（Auth）</li>
                  <li>• リアルタイム通信</li>
                  <li>• Row Level Security</li>
                </ul>
              </div>
            </div>

            {/* ロジック機能 */}
            <div className="border-t pt-4">
              <h3 className="text-sm mb-3">② ロジック機能（バックエンド処理）</h3>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white p-2 rounded text-xs text-center">
                    ポイント計算<br/>アルゴリズム
                  </div>
                  <div className="bg-white p-2 rounded text-xs text-center">
                    ランク判定<br/>ロジック
                  </div>
                  <div className="bg-white p-2 rounded text-xs text-center">
                    クーポン使用<br/>制限チェック
                  </div>
                  <div className="bg-white p-2 rounded text-xs text-center">
                    会員登録<br/>処理
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-700">
                  <p>• 正確なポイント計算とランク判定情報の提供</p>
                  <p>• 銀行取引データに基づくポイント自動付与</p>
                  <p>• リアルタイム使用制限チェック</p>
                </div>
              </div>
            </div>
          </div>

          {/* データベース層 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
              <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              <span className="text-sm">SQL / PostgreSQL Protocol</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg">データベース層</h2>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-indigo-600" />
                <p className="text-sm">PostgreSQL on Supabase</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="border border-indigo-200 bg-white p-3 rounded-lg">
                <p className="text-xs text-indigo-600 mb-2">会員情報</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• ユーザーID</li>
                  <li>• 氏名</li>
                  <li>• 性別・年齢</li>
                  <li>• 会員ランク</li>
                  <li>• ポイント数</li>
                  <li>• 銀行口座情報</li>
                  <li>• 登録日</li>
                </ul>
              </div>
              <div className="border border-indigo-200 bg-white p-3 rounded-lg">
                <p className="text-xs text-indigo-600 mb-2">銀行取引データ</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 給与・年金受取</li>
                  <li>• NISA積立</li>
                  <li>• ペット信託</li>
                  <li>• 住宅・車ローン</li>
                  <li>• 預金残高</li>
                  <li>• 継続利用年数</li>
                </ul>
              </div>
              <div className="border border-indigo-200 bg-white p-3 rounded-lg">
                <p className="text-xs text-indigo-600 mb-2">クーポン・店舗情報</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• クーポンID</li>
                  <li>• タイトル・割引内容</li>
                  <li>• 必要ランク</li>
                  <li>• 使用制限</li>
                  <li>• 店舗ID・店舗名</li>
                  <li>• 店舗コード</li>
                  <li>• カテゴリ</li>
                </ul>
              </div>
              <div className="border border-indigo-200 bg-white p-3 rounded-lg">
                <p className="text-xs text-indigo-600 mb-2">利用履歴</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 履歴ID</li>
                  <li>• ユーザーID</li>
                  <li>• クーポンID</li>
                  <li>• 店舗ID</li>
                  <li>• 使用日時</li>
                  <li>• 残り回数</li>
                  <li>• ログイン頻度</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 管理機能 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg">③ 管理機能（運営者向け機能）</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">最適なサービス環境を提供するための管理基盤</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-purple-200 bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 mb-2">基本管理</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• クーポン管理（CRUD）</li>
                  <li>• 店舗管理</li>
                  <li>• 会員管理</li>
                  <li>• 使用履歴管理</li>
                </ul>
              </div>
              <div className="border border-purple-200 bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 mb-2">利用実績ダッシュボード</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• リアルタイム統計</li>
                  <li>• ランク分布可視化</li>
                  <li>• 利用率グラフ</li>
                  <li>• KPI監視</li>
                </ul>
              </div>
              <div className="border border-purple-200 bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 mb-2">システム運用</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• データクリア機能</li>
                  <li>• バックアップ管理</li>
                  <li>• ログ監視</li>
                  <li>• パフォーマンス管理</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 分析機能 */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg p-6 border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-700" />
              <h2 className="text-lg">分析機能の概略</h2>
            </div>
            
            <div className="mb-4 bg-white p-4 rounded-lg">
              <h3 className="text-sm text-purple-700 mb-2">分析の目的</h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                ユーザーに対して適切なランク昇格の動機付けを行い、銀行サービスの利用率（クロスセル）および
                提携店でのクーポン利用率を向上させるための情報を提供。
                また、利用の少ない特典等の見直しやコスト削減の判断材料とする。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-sm text-purple-700 mb-2">データ収集方法</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs mb-1">会員情報:</p>
                    <p className="text-xs text-gray-600">性別、年齢</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1">銀行取引項目:</p>
                    <p className="text-xs text-gray-600">給与・年金受取、NISA積立、ペット信託、住宅・車ローン、預金残高、継続利用年数</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1">アプリ利用項目:</p>
                    <p className="text-xs text-gray-600">ログイン頻度、クーポン使用履歴</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-sm text-purple-700 mb-2">分析手法</h3>
                <p className="text-xs text-gray-600 mb-2">クロス集計および相関分析</p>
                <ul className="text-xs text-gray-700 space-y-2">
                  <li>
                    <span className="text-purple-600">• ランク達成要因分析:</span><br/>
                    銀行取引項目（NISA、ローン、給与振込等）が上位ランク（Gold/Silver）の維持に最も寄与している要因を分析し、販促の注力ポイントを特定
                  </li>
                  <li>
                    <span className="text-purple-600">• 特典利用率分析:</span><br/>
                    ランクごとのクーポン使用率を分析し、利用頻度の高い提携企業（仙台っ子、ベニーランド等）と低い企業を可視化し、提携先ラインナップを最適化
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-sm text-purple-700 mb-2">実装済み分析機能</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-50 p-2 rounded text-xs text-center">
                  クロス集計<br/>（ランク×店舗等）
                </div>
                <div className="bg-purple-50 p-2 rounded text-xs text-center">
                  RFM分析<br/>（Recency/Frequency/Monetary）
                </div>
                <div className="bg-purple-50 p-2 rounded text-xs text-center">
                  時系列分析<br/>グラフ可視化
                </div>
              </div>
            </div>
          </div>

          {/* 外部連携システム */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-full">
              <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              <span className="text-sm">API連携 / バッチ処理による定期同期</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg">外部連携システム</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm">仙台あおば銀行システム</p>
                </div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 顧客取引実績データ連携</li>
                  <li>• ポイント算出用データ提供</li>
                  <li>• 会員ランク判定データ</li>
                  <li>• 給与・年金受取情報</li>
                  <li>• NISA積立・ローン契約情報</li>
                  <li>• バッチ処理による定期同期</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <StoreIcon className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm">地元提携店舗システム</p>
                </div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 店舗コード認証</li>
                  <li>• クーポン利用確認</li>
                  <li>• リアルタイム在庫連携</li>
                  <li>• 利用実績フィードバック</li>
                  <li>• 提携企業（仙台っ子、ベニーランド等）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* セキュリティ対策 */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-red-600" />
              <h2 className="text-lg">セキュリティ対策</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded text-center">
                <p className="text-xs">通信暗号化</p>
                <p className="text-xs text-gray-600 mt-1">TLS 1.3</p>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <p className="text-xs">認証</p>
                <p className="text-xs text-gray-600 mt-1">JWT Token</p>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <p className="text-xs">アクセス制御</p>
                <p className="text-xs text-gray-600 mt-1">RLS Policy</p>
              </div>
              <div className="bg-white p-3 rounded text-center">
                <p className="text-xs">データ保護</p>
                <p className="text-xs text-gray-600 mt-1">暗号化保存</p>
              </div>
            </div>
          </div>

          {/* システム特性 */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-300">
            <h2 className="text-lg mb-4">システム特性</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600 mb-2">会員ランク制度（4段階）</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• BLUE: 1回のみ使用可能</li>
                  <li>• BRONZE: 月2回まで使用可能</li>
                  <li>• SILVER: 無制限使用可能</li>
                  <li>• GOLD: 生涯2回まで使用可能</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">※従来の5階層から4階層へ再編</p>
              </div>
              <div>
                <p className="text-sm text-green-600 mb-2">クーポン利用方式</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 店舗コード入力方式</li>
                  <li>• リアルタイム使用制限チェック</li>
                  <li>• 使用履歴の即時記録</li>
                  <li>• 不正利用防止機能</li>
                  <li>• 残り回数の自動計算</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-purple-600 mb-2">期待効果</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 若年層メインバンク化促進</li>
                  <li>• 優良顧客へのロイヤリティ化</li>
                  <li>• システム運用コスト削減</li>
                  <li>• 地域経済のハブ化</li>
                  <li>• 銀行サービス利用率向上</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Aoba Link - 地域共創型ロイヤリティシステム</p>
          <p className="text-xs mt-1">仙台あおば銀行 / クライアントサーバ方式 / Web経由でサービスを提供</p>
        </div>
      </div>
    </div>
  );
}
