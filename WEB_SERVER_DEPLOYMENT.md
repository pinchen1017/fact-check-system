# 🚀 Web Server 部署指南

## 📋 部署步驟

### 1. 推送代碼到 GitHub
```bash
git add .
git commit -m "準備部署 Web Server"
git push origin main
```

### 2. 在 Render 上部署 Web Server

1. **訪問 Render Dashboard**
   - 前往 [https://dashboard.render.com/](https://dashboard.render.com/)
   - 登入您的帳戶

2. **創建新的 Web Service**
   - 點擊 "New +" 按鈕
   - 選擇 "Web Service"

3. **連接 GitHub 倉庫**
   - 選擇您的 GitHub 倉庫
   - 授權 Render 訪問

4. **配置 Web Service**
   - **Name**: `echo-debate-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **設置環境變量**
   - `JWT_SECRET`: 點擊 "Generate" 自動生成
   - `PORT`: `10000`
   - `NODE_ENV`: `production`

6. **部署設置**
   - **Instance Type**: `Starter` (免費方案)
   - **Auto-Deploy**: `Yes` (自動部署)

### 3. 部署完成後

1. **獲取部署 URL**
   - 部署完成後，您會得到一個 URL，例如：
   - `https://echo-debate-api.onrender.com`

2. **測試 API 端點**
   - 健康檢查: `https://echo-debate-api.onrender.com/api/health`
   - 應該返回: `{"ok": true}`

### 4. 更新前端配置

部署完成後，需要更新前端的 API URL：

1. **在 Render 前端服務中**
   - 添加環境變量: `VITE_API_URL`
   - 值: `https://echo-debate-api.onrender.com`

2. **重新部署前端**
   - 前端會自動重新部署

## 🔧 API 端點說明

您的 Web Server 提供以下 API 端點：

- `GET /api/health` - 健康檢查
- `POST /api/runs` - 創建新的分析任務
- `GET /api/runs/:id` - 獲取分析結果
- `GET /api/runs/:id/stream` - 實時分析流
- `POST /api/runs/:id/update` - 更新分析結果

## 📊 監控和日誌

- 在 Render Dashboard 中查看部署狀態
- 監控日誌以確保服務正常運行
- 檢查錯誤和性能指標

## 🚨 故障排除

### 常見問題：

1. **部署失敗**
   - 檢查 `package.json` 中的依賴
   - 確認 Node.js 版本兼容性

2. **API 無法訪問**
   - 檢查 CORS 設置
   - 確認環境變量正確設置

3. **服務重啟**
   - Render 免費方案會在 15 分鐘無活動後休眠
   - 首次請求可能需要幾秒鐘喚醒

## ✅ 部署檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] Render Web Service 已創建
- [ ] 環境變量已設置
- [ ] 部署成功完成
- [ ] API 健康檢查通過
- [ ] 前端配置已更新

## 🎯 預期結果

部署完成後，您將擁有：
- 一個穩定的 Web API 服務
- 支持實時分析功能
- 與前端完美整合
- 可擴展的架構

**準備好開始部署了嗎？** 🚀
