# 完整部署指南：從靜態網站到動態網站

## 概述

本指南將幫助您將現有的靜態網站升級為完整的動態網站，包括：
- 前端：React/Vite 部署在 Render
- 後端：FastAPI 部署在 Render  
- 資料庫：PostgreSQL (現有實驗室資料庫)

## 架構圖

```
GitHub (前端代碼) → Render (前端) → Render (後端) → 實驗室資料庫
     ↓                    ↓              ↓
  自動部署           靜態網站         API 服務
```

## 步驟 1：部署後端到 Render

### 1.1 準備後端代碼

1. 在 GitHub 上創建新倉庫：`fact-check-backend`
2. 將 `backend` 資料夾內容上傳到新倉庫

```bash
# 在 backend 資料夾中執行
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/您的用戶名/fact-check-backend.git
git push -u origin main
```

### 1.2 在 Render 上部署後端

1. 登入 [Render](https://render.com)
2. 點擊 "New +" → "Web Service"
3. 連接 GitHub 倉庫 `fact-check-backend`
4. 配置設定：
   - **Name**: `fact-check-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. 設置環境變數：
   ```
   DB_HOST=35.221.147.151
   DB_PORT=5432
   DB_NAME=linebot_v2
   DB_USER=postgres
   DB_PASS=@Aa123456
   ```

6. 點擊 "Create Web Service"

### 1.3 獲取後端 URL

部署完成後，您會得到類似這樣的 URL：
`https://fact-check-backend-xxxx.onrender.com`

**重要**：記住這個 URL，下一步需要用到！

## 步驟 2：更新前端配置

### 2.1 設置環境變數

1. 在 `echo_debate_of_school_project` 資料夾中創建 `.env.local` 文件：

```bash
# 將 xxxx 替換為您的實際後端 URL
VITE_API_BASE_URL=https://fact-check-backend-xxxx.onrender.com/api
```

### 2.2 測試本地開發

```bash
cd echo_debate_of_school_project
npm install
npm run dev
```

訪問 `http://localhost:5173` 測試前端是否能正常連接後端。

## 步驟 3：更新前端部署

### 3.1 更新 GitHub 倉庫

將修改後的前端代碼推送到 GitHub：

```bash
cd echo_debate_of_school_project
git add .
git commit -m "Add backend API integration"
git push origin main
```

### 3.2 更新 Render 前端部署

1. 在 Render 上找到您的前端服務
2. 在 "Environment" 部分添加環境變數：
   ```
   VITE_API_BASE_URL=https://fact-check-backend-xxxx.onrender.com/api
   ```
3. 觸發重新部署

## 步驟 4：測試完整系統

### 4.1 測試後端 API

訪問以下 URL 確認後端正常運行：
- `https://您的後端URL.onrender.com/api/health`
- `https://您的後端URL.onrender.com/docs`

### 4.2 測試前端連接

1. 訪問您的前端網站
2. 嘗試使用需要後端 API 的功能
3. 檢查瀏覽器開發者工具的 Network 標籤，確認 API 請求成功

## 步驟 5：優化配置

### 5.1 資料庫連接優化

如果遇到資料庫連接問題，考慮：

1. **使用雲端資料庫**：
   - 在 Render 上創建 PostgreSQL 資料庫
   - 更新後端環境變數

2. **連接池配置**：
   ```python
   # 在 main.py 中添加連接池
   from psycopg2 import pool
   
   # 創建連接池
   connection_pool = psycopg2.pool.SimpleConnectionPool(
       1, 20,  # 最小和最大連接數
       host=DB_HOST, port=DB_PORT, user=DB_USER, 
       password=DB_PASS, dbname=DB_NAME
   )
   ```

### 5.2 性能優化

1. **啟用 Gzip 壓縮**
2. **設置適當的緩存標頭**
3. **使用 CDN**（Render 自動提供）

## 故障排除

### 常見問題

1. **CORS 錯誤**：
   - 檢查後端的 `ALLOWED_ORIGINS` 設置
   - 確保包含前端域名

2. **資料庫連接失敗**：
   - 檢查資料庫是否允許外部連接
   - 驗證環境變數設置

3. **API 請求失敗**：
   - 檢查網路連接
   - 確認後端 URL 正確
   - 查看瀏覽器控制台錯誤

### 調試工具

1. **後端日誌**：在 Render 儀表板查看日誌
2. **前端調試**：使用瀏覽器開發者工具
3. **API 測試**：使用 Postman 或 curl 測試 API

## 免費方案限制

### Render 免費方案限制

1. **休眠機制**：15 分鐘無活動後休眠
2. **啟動時間**：首次訪問需要 30 秒啟動
3. **使用時間**：每月 750 小時
4. **記憶體**：512MB RAM

### 優化建議

1. **使用 Keep-Alive 服務**：定期 ping 服務保持活躍
2. **優化啟動時間**：減少依賴包大小
3. **監控使用量**：避免超出免費額度

## 下一步

1. **監控和日誌**：設置錯誤監控
2. **備份策略**：定期備份資料庫
3. **擴展計劃**：考慮升級到付費方案
4. **安全性**：實施 API 認證和授權

## 支援

如果遇到問題，請檢查：
1. Render 服務狀態
2. GitHub 部署日誌
3. 瀏覽器控制台錯誤
4. 網路連接狀態
