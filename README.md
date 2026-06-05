Aoba Link (あおばリンク)

！環境構築！
VSコードのターミナルに次のコードをコピペしてください。
git clone <https://github.com/s24k1062rd-droid/DX_teamF.git>

必要なライブラリをインストールします。
pip install -r requirements.txt環境変数の設定を行います。
.env.example をコピーして .env を作成し、必要なAPIキー等を設定してください。
開発フローブランチ運用: feature/機能名 を使用して枝分かれさせます 。  
品質管理: PDCAサイクルを回し、品質基準（ゾーン分析等）に基づいたテストを実施します 。  
連携: 銀行基幹システムとの連携テストを最優先事項として実施します 。  
フォルダ構成Plaintextproject-root/

├── app/            # アプリケーション本体
├── tests/          # 品質検証用テストコード
├── docs/           # システム提案書等のドキュメント
├── .env.example    # 環境変数テンプレート
└── README.md
