# Echo Debate 部署指南 - 今天完成！

## 🚀 快速部署步驟

### 1. 推送代碼到 GitHub
```bash
git add .
git commit -m "準備部署到 Render"
git push origin main
```

### 2. 在 Render 上部署前端

1. 訪問 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 "New +" → "Static Site"
3. 連接您的 GitHub 倉庫
4. 設置以下配置：
   - **Name**: `echo-debate-frontend`
   - **Root Directory**: `echo_debate_of_school_project`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `echo_debate_of_school_project/dist`
   - **Environment Variables**:
     - `VITE_COFACT_TOKEN`: 您的 Cofact API Token
     - `VITE_API_URL`: 後端 URL (部署後更新)
     - `VITE_FASTAPI_URL`: `http://120.107.172.133:10001`

### 3. 在 Render 上部署後端

1. 點擊 "New +" → "Web Service"
2. 連接您的 GitHub 倉庫
3. 設置以下配置：
   - **Name**: `echo-debate-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `JWT_SECRET`: 自動生成
     - `PORT`: `10000`

### 4. 更新前端環境變量

1. 獲取後端部署 URL (例如: `https://echo-debate-backend.onrender.com`)
2. 在前端服務的環境變量中更新 `VITE_API_URL`

### 5. 測試部署

部署完成後，測試以下 URL：
```
https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

## ✅ 部署檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] 前端 Static Site 已創建
- [ ] 後端 Web Service 已創建
- [ ] 環境變量已設置
- [ ] 前端 URL 已更新
- [ ] 測試 URL 正常工作

## 🔧 故障排除

### 前端構建失敗
- 檢查 Node.js 版本 (需要 18+)
- 確認所有依賴已安裝
- 檢查環境變量設置

### 後端啟動失敗
- 檢查 PORT 環境變量
- 確認 JWT_SECRET 已設置
- 查看 Render 日誌

### CORS 錯誤
- 確認後端 CORS 設置正確
- 檢查前端 API URL 配置

## 📞 緊急支援

如果遇到問題，請檢查：
1. Render 部署日誌
2. 瀏覽器控制台錯誤
3. 網路請求狀態

部署完成後，您的網站將可以通過 URL 參數直接載入分析結果！
