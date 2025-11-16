# Ngrok 使用指南

本指南說明如何通過 ngrok 公開服務並確保 API 和數據庫連接正常工作。

## 快速開始

### 1. 獲取 Ngrok Auth Token

1. 前往 [Ngrok 官網](https://dashboard.ngrok.com/signup) 註冊免費賬號
2. 登入後到 [Auth Token 頁面](https://dashboard.ngrok.com/get-started/your-authtoken) 複製您的 authtoken

### 2. 創建 .env 文件

在專案根目錄創建 `.env` 文件：

```bash
NGROK_AUTHTOKEN=您的實際ngrok_authtoken
```

### 3. 啟動服務

```bash
# 啟動應用服務
docker-compose up -d

# 啟動 ngrok 服務
docker-compose --profile ngrok up -d ngrok-frontend
```

### 4. 獲取公開網址

```bash
# 查看 ngrok 日誌
docker-compose --profile ngrok logs ngrok-frontend
```

您會看到類似以下的輸出：

```
tunnels:
  - name: frontend
    url: https://xxxx-xxx-xxxx.ngrok-free.app
  - name: backend
    url: https://yyyy-yyy-yyyy.ngrok-free.app
```

## 重要配置說明

### 前端和後端使用不同的 Ngrok URL

由於前端（端口 3000）和後端（端口 4000）使用不同的 ngrok tunnel，您需要告訴前端後端的 ngrok URL。

有兩種方法：

#### 方法 1：通過 URL 參數（推薦）

在訪問前端時，添加 `backend_url` 參數：

```
https://xxxx-xxx-xxxx.ngrok-free.app/?backend_url=https://yyyy-yyy-yyyy.ngrok-free.app
```

這樣前端會自動使用指定的後端 URL，並保存到 sessionStorage 中。

#### 方法 2：通過瀏覽器控制台

打開瀏覽器開發者工具（F12），在控制台執行：

```javascript
sessionStorage.setItem('backend_ngrok_url', 'https://yyyy-yyy-yyyy.ngrok-free.app');
location.reload();
```

### 訪問示例

假設您獲取的 URL 是：
- 前端：`https://abc123.ngrok-free.app`
- 後端：`https://def456.ngrok-free.app`

**正確的訪問方式：**

```
https://abc123.ngrok-free.app/?backend_url=https://def456.ngrok-free.app&session_id=your-session-id
```

## 功能說明

### 已實現的功能

✅ **動態 API 配置**
- 自動檢測當前環境（ngrok/本地/生產）
- 支持通過 URL 參數設置後端 URL
- 自動保存配置到 sessionStorage

✅ **數據庫連接**
- 已在 `docker-compose.yml` 中配置
- 使用 Cloud SQL PostgreSQL
- 自動處理 SSL 連接

✅ **API 代理**
- 前端通過 `/local-api` 訪問本地後端（端口 4000）
- 前端通過 `/api-proxy` 訪問外部 FastAPI（端口 10001）
- 在 ngrok 環境中自動調整 URL

### API 端點

**本地後端 API（端口 4000）：**
- `GET /api/health` - 健康檢查
- `GET /get_user_by_session` - 根據 session_id 查詢 user_id
- `POST /save_session_record` - 保存 session 記錄
- `GET /api/runs/:id` - 獲取分析結果
- `GET /api/runs/:id/stream` - SSE 實時更新

**外部 FastAPI（端口 10001）：**
- `POST /apps/judge/users/{userId}/sessions` - 創建 session
- `GET /apps/judge/users/{userId}/sessions/{sessionId}` - 查詢 session
- `POST /run` - 發送訊息進行分析

## 故障排除

### 問題：無法連接到後端 API

**解決方案：**
1. 確認後端 ngrok URL 已正確設置（通過 URL 參數或 sessionStorage）
2. 檢查瀏覽器控制台的 API_CONFIG 日誌
3. 確認後端容器正在運行：`docker-compose ps`

### 問題：數據庫連接失敗

**檢查：**
1. 確認 `.env` 文件中的數據庫配置（在 `docker-compose.yml` 中）
2. 檢查網絡連接和防火牆設置
3. 查看後端日誌：`docker-compose logs echo-debate-app`

### 問題：CORS 錯誤

**解決方案：**
- 後端已配置 CORS 允許所有來源（開發環境）
- 如果仍有問題，檢查 `server/index.js` 中的 CORS 配置

## 常用命令

```bash
# 查看所有容器狀態
docker-compose ps

# 查看 ngrok 日誌
docker-compose --profile ngrok logs -f ngrok-frontend

# 查看應用日誌
docker-compose logs -f echo-debate-app

# 重啟服務
docker-compose restart echo-debate-app
docker-compose --profile ngrok restart ngrok-frontend

# 停止所有服務
docker-compose --profile ngrok down
```

## 注意事項

1. **免費版限制**：Ngrok 免費版每次啟動會產生隨機網址，重啟後網址會變更
2. **後端 URL 配置**：通過 ngrok 訪問時，務必設置正確的後端 URL
3. **HTTPS**：Ngrok 自動提供 HTTPS 加密連線
4. **頻寬限制**：免費版有頻寬和連線數限制

## 技術細節

### 配置文件

- `ngrok.yml` - Ngrok 隧道配置
- `echo_debate_of_school_project/public/config.js` - 前端 API 配置
- `echo_debate_of_school_project/src/utils/apiConfig.js` - API 配置工具函數
- `docker-compose.yml` - Docker 服務配置

### 自動檢測機制

系統會自動檢測當前環境：
1. **Ngrok 環境**：域名包含 `ngrok`
2. **本地環境**：`localhost` 或 `127.0.0.1`
3. **生產環境**：其他域名

根據環境自動調整 API URL。

