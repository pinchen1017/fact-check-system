# 🚀 Render 部署指南 - 解決權限和版本問題

## ⚠️ 常見問題解決

### 1. Node.js 版本問題
- **問題**: Render 只支持 Node.js 18.x
- **解決**: 已設置 `"engines": { "node": "18.x" }`

### 2. Vite 權限問題
- **問題**: Vite 構建時權限錯誤
- **解決**: 
  - 關閉 sourcemap (`sourcemap: false`)
  - 設置正確的 host (`host: '0.0.0.0'`)
  - 優化 rollup 配置

### 3. 部署配置優化
- **問題**: 構建失敗或權限錯誤
- **解決**: 已優化所有配置文件

## 📋 部署步驟

### 1. 推送代碼
```bash
git add .
git commit -m "修復 Render 部署問題 - Node.js 18.x 和 Vite 權限"
git push origin main
```

### 2. 部署 Web Server (後端)

1. **訪問 Render Dashboard**
   - 前往 [https://dashboard.render.com/](https://dashboard.render.com/)

2. **創建 Web Service**
   - 點擊 "New +" → "Web Service"
   - 連接 GitHub 倉庫

3. **配置設置**
   - **Name**: `echo-debate-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **環境變量**
   - `NODE_VERSION`: `18`
   - `JWT_SECRET`: 點擊 "Generate" 自動生成
   - `PORT`: `10000`
   - `NODE_ENV`: `production`

5. **高級設置**
   - **Instance Type**: `Starter` (免費)
   - **Auto-Deploy**: `Yes`

### 3. 部署 Static Site (前端)

1. **創建 Static Site**
   - 點擊 "New +" → "Static Site"
   - 連接 GitHub 倉庫

2. **配置設置**
   - **Name**: `echo-debate-frontend`
   - **Root Directory**: `echo_debate_of_school_project`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `echo_debate_of_school_project/dist`

3. **環境變量**
   - `NODE_VERSION`: `18`
   - `VITE_COFACT_TOKEN`: 您的 Cofact Token
   - `VITE_API_URL`: 後端 URL (部署後更新)
   - `VITE_FASTAPI_URL`: `http://127.0.0.1:8000`

## 🔧 故障排除

### 構建失敗
- 檢查 Node.js 版本是否為 18.x
- 確認所有依賴已正確安裝
- 查看 Render 構建日誌

### 權限錯誤
- 確認 Vite 配置已優化
- 檢查文件權限設置
- 使用 `host: '0.0.0.0'` 配置

### API 連接問題
- 確認後端 URL 正確
- 檢查 CORS 設置
- 驗證環境變量

## ✅ 部署檢查清單

- [ ] Node.js 版本設置為 18.x
- [ ] Vite 配置已優化
- [ ] 後端 Web Service 已部署
- [ ] 前端 Static Site 已部署
- [ ] 環境變量已設置
- [ ] API 健康檢查通過
- [ ] session_id 功能正常

## 🎯 測試 URL

部署完成後測試：
```
https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

應該直接跳轉到 fact_check.jsx 並顯示分析結果。

## 🚨 重要提醒

1. **Node.js 版本**: 必須使用 18.x
2. **權限問題**: 已通過 Vite 配置優化解決
3. **環境變量**: 確保所有必要的變量都已設置
4. **CORS**: 後端已配置 CORS 支持

**現在可以順利部署了！** 🎉
