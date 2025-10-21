# 逐步部署指南

## 目前狀態
✅ 前端已部署：https://fact-check-system-static.onrender.com/
✅ 後端代碼已推送到 GitHub：https://github.com/pinchen1017/fact-check-backend

## 下一步：部署後端到 Render

### 步驟 1：在 Render 上創建後端服務

1. **登入 Render**
   - 前往 https://render.com
   - 使用您的 GitHub 帳號登入

2. **創建新的 Web Service**
   - 點擊 "New +" 按鈕
   - 選擇 "Web Service"

3. **連接 GitHub 倉庫**
   - 在 "Connect a repository" 部分
   - 選擇 `pinchen1017/fact-check-backend`
   - 如果沒有看到，請確保 GitHub 連接正常

4. **配置服務設定**
   ```
   Name: fact-check-backend
   Environment: Python 3
   Region: Oregon (US West)
   Branch: master
   Plan: Free
   ```

5. **設置構建和部署命令**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

6. **添加環境變數**
   在 "Environment Variables" 部分添加：
   ```
   DB_HOST = 35.221.147.151
   DB_PORT = 5432
   DB_NAME = linebot_v2
   DB_USER = postgres
   DB_PASS = @Aa123456
   ```

7. **部署服務**
   - 點擊 "Create Web Service"
   - 等待部署完成（約 2-3 分鐘）

### 步驟 2：獲取後端 URL

部署完成後，您會得到一個 URL，例如：
`https://fact-check-backend-xxxx.onrender.com`

**重要**：請記住這個 URL！

### 步驟 3：測試後端 API

訪問以下 URL 確認後端正常運行：
- `https://您的後端URL.onrender.com/api/health`
- `https://您的後端URL.onrender.com/docs`

### 步驟 4：更新前端環境變數

1. **在 Render 上更新前端服務**
   - 前往您的前端服務頁面
   - 點擊 "Environment" 標籤
   - 添加環境變數：
     ```
     VITE_API_BASE_URL = https://您的後端URL.onrender.com/api
     ```

2. **重新部署前端**
   - 點擊 "Manual Deploy" → "Deploy latest commit"
   - 等待部署完成

### 步驟 5：測試完整系統

1. **訪問前端網站**
   - 前往 https://fact-check-system-static.onrender.com/

2. **測試 API 連接**
   - 嘗試使用需要後端 API 的功能
   - 檢查瀏覽器開發者工具的 Network 標籤

3. **檢查錯誤**
   - 如果遇到 CORS 錯誤，檢查後端的 `ALLOWED_ORIGINS` 設置
   - 如果 API 請求失敗，檢查後端 URL 是否正確

## 故障排除

### 常見問題

1. **後端部署失敗**
   - 檢查 `requirements.txt` 是否包含所有必要依賴
   - 確認 `main.py` 文件存在且語法正確

2. **資料庫連接失敗**
   - 檢查環境變數是否正確設置
   - 確認資料庫允許外部連接

3. **前端無法連接後端**
   - 檢查 `VITE_API_BASE_URL` 環境變數
   - 確認後端 URL 正確且可訪問

4. **CORS 錯誤**
   - 檢查後端的 `ALLOWED_ORIGINS` 設置
   - 確保包含前端域名

### 調試工具

1. **後端日誌**：在 Render 儀表板查看日誌
2. **前端調試**：使用瀏覽器開發者工具
3. **API 測試**：使用 Postman 或 curl 測試 API

## 完成後的架構

```
GitHub (前端) → Render (前端) → Render (後端) → 實驗室資料庫
     ↓              ↓              ↓
  自動部署      靜態網站        API 服務
```

## 下一步

1. **監控服務狀態**
2. **設置錯誤監控**
3. **優化性能**
4. **考慮升級到付費方案**

## 支援

如果遇到問題，請檢查：
1. Render 服務狀態
2. GitHub 倉庫連接
3. 環境變數設置
4. 網路連接狀態
