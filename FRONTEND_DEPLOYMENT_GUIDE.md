# 🚀 前端網站部署指南 - 支援 Cofact API 調用

## 📋 部署配置

### 您需要的是：**Static Site** (前端網站)
- ✅ 可以調用 Cofact API 獲取 JSON 數據
- ✅ 支援 session_id 參數直接載入分析結果
- ✅ 完整的 React 前端功能

## 🔧 在 Render 上部署 Static Site

### 1. 創建 Static Site

1. **訪問 Render Dashboard**
   - 前往 [https://dashboard.render.com/](https://dashboard.render.com/)

2. **創建新的 Static Site**
   - 點擊 "New +" → "Static Site"
   - 連接您的 GitHub 倉庫

3. **配置設置**
   - **Name**: `fact-check-system`
   - **Root Directory**: `echo_debate_of_school_project`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `echo_debate_of_school_project/dist`

### 2. 環境變量設置

在 Render 的環境變量中添加：

```
NODE_VERSION=18
VITE_COFACT_TOKEN=您的_Cofact_Token
VITE_API_URL=https://your-backend-url.onrender.com (如果需要後端)
VITE_FASTAPI_URL=http://120.107.172.133:10001
```

### 3. 啟用 Auto-Deploy

- **Auto-Deploy**: `Yes`
- **Branch**: `main`
- **Deploy Hook**: `On commit`

## 🎯 功能確認

### ✅ 您的網站將支援：

1. **Cofact API 調用**
   - 自動調用 `https://unknown4853458-cofacts-agent-rag.hf.space/agent/check_message`
   - 使用您的 `VITE_COFACT_TOKEN`
   - 獲取 JSON 格式的查證結果

2. **Session ID 功能**
   - 支援 `?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc` 參數
   - 直接跳轉到事實查核頁面
   - 載入預設的分析結果

3. **完整的前端功能**
   - React 單頁應用
   - 響應式設計
   - 多模型分析結果展示

## 📋 部署檢查清單

### 部署前：
- [ ] 創建 Static Site (不是 Web Service)
- [ ] Root Directory: `echo_debate_of_school_project`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `echo_debate_of_school_project/dist`
- [ ] 設置 `VITE_COFACT_TOKEN` 環境變量

### 部署後：
- [ ] 網站可以正常訪問
- [ ] 主頁顯示正常
- [ ] Cofact API 調用正常
- [ ] session_id 功能正常
- [ ] Auto-Deploy 已啟用

## 🧪 測試功能

### 1. 主頁測試
```
https://fact-check-system.onrender.com/
```

### 2. Session ID 測試
```
https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

### 3. Cofact API 測試
- 在事實查核頁面輸入查詢
- 檢查是否成功調用 Cofact API
- 確認 JSON 數據正確顯示

## 🔍 故障排除

### 如果 Cofact API 調用失敗：

1. **檢查環境變量**
   - 確認 `VITE_COFACT_TOKEN` 已正確設置
   - 檢查 Token 是否有效

2. **檢查 CORS 設置**
   - Cofact API 應該支援跨域請求
   - 如果失敗，可能需要代理設置

3. **檢查網路請求**
   - 使用瀏覽器開發者工具檢查網路請求
   - 查看是否有錯誤信息

### 如果網站無法訪問：

1. **檢查服務類型**
   - 確認部署的是 Static Site
   - 不是 Web Service

2. **檢查構建輸出**
   - 確認 `dist` 文件夾包含所有文件
   - 檢查 `index.html` 是否正確生成

## 🚀 部署步驟

### 1. 推送代碼
```bash
git add .
git commit -m "配置前端網站部署 - 支援 Cofact API"
git push origin main
```

### 2. 在 Render 創建 Static Site
- 按照上述配置創建 Static Site

### 3. 設置環境變量
- 添加 `VITE_COFACT_TOKEN` 等環境變量

### 4. 啟用 Auto-Deploy
- 設置自動部署

### 5. 測試功能
- 測試所有功能是否正常

## ✅ 預期結果

部署完成後，您將擁有：
- ✅ 完整的前端網站
- ✅ 支援 Cofact API 調用
- ✅ 支援 session_id 參數
- ✅ 自動部署功能
- ✅ 響應式設計

**現在可以開始部署前端網站了！** 🎉
