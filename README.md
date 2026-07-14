# お天気予報アプリ

OpenWeatherMap APIを使用した天気予報アプリです。ユーザー認証機能を持ち、お気に入りの都市をデータベースに保存できます。

## 使用技術

- **PHP** 8.3.13
- **Laravel** 8.83.29
- **MySQL** 8.0.26
- **Laravel Sanctum**（API認証）
- **OpenWeatherMap API**（天気データ取得）
- **Docker / Docker Compose**

## 機能

- 現在地の天気表示
- 都市名での天気検索
- 5日間予報の表示
- 検索履歴の保存
- ユーザー登録・ログイン・ログアウト
- お気に入り都市のDB保存・取得・削除（最大5件）
- レスポンシブデザイン（PC・タブレット・スマホ対応）

## セットアップ

### 1. リポジトリをクローン

\`\`\`bash
git clone git@github.com:yokoyonezawa/weather_-Laravel.git
cd weather_-Laravel
\`\`\`

### 2. 環境変数の設定

\`\`\`bash
cp src/.env.example src/.env
\`\`\`

`src/.env`を編集して以下を設定：

```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=laravel_pass

OPENWEATHER_API_KEY=（OpenWeatherMap APIキー）
```

### 3. Dockerコンテナを起動

\`\`\`bash
docker-compose up -d
\`\`\`

### 4. コンテナに入ってセットアップ

\`\`\`bash
docker exec -it weather-laravel-php-1 bash
\`\`\`

\`\`\`bash
composer install
php artisan key:generate
php artisan migrate
\`\`\`

### 5. アクセス

ブラウザで `http://localhost/index.html` を開く

## API エンドポイント

| メソッド | エンドポイント | 説明 | 認証 |
| -------- | --------------------- | --------------------------- | ---- |
| GET      | /api/weather          | 天気取得（city or lat/lon） | 不要 |
| POST     | /api/register         | ユーザー登録                | 不要 |
| POST     | /api/login            | ログイン                    | 不要 |
| POST     | /api/logout           | ログアウト                  | 必要 |
| GET      | /api/favorites        | お気に入り一覧              | 必要 |
| POST     | /api/favorites        | お気に入り追加              | 必要 |
| DELETE   | /api/favorites/{city} | お気に入り削除              | 必要 |
