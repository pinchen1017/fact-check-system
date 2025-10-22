# 🔧 部署修復指南 - 解決 Cannot GET 錯誤

## 🚨 問題診斷

### 當前問題：
1. **Cannot GET 錯誤**: 您部署的是後端 API 服務，不是前端靜態網站
2. **Webhook 未設置**: 需要正確設置 GitHub webhook
3. **服務類型錯誤**: 需要部署 Static Site 而不是 Web Service

## 🔧 解決方案

### 1. 重新部署為 Static Site

#### 在 Render Dashboard 中：

1. **刪除現有服務** (如果需要的話)
   - 前往 [Render Dashboard](https://dashboard.render.com/)
   - 找到 `fact-check-system` 服務
   - 點擊 "Settings" → "Delete Service"

2. **創建新的 Static Site**
   - 點擊 "New +" → "Static Site"
   - 連接您的 GitHub 倉庫

3. **配置 Static Site**
   - **Name**: `fact-check-system`
   - **Root Directory**: `echo_debate_of_school_project`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `echo_debate_of_school_project/dist`

4. **環境變量**
   - `NODE_VERSION`: `18`
   - `VITE_COFACT_TOKEN`: 您的 Cofact Token
   - `VITE_API_URL`: 後端 API URL (如果需要)
   - `VITE_FASTAPI_URL`: `http://127.0.0.1:8000`

### 2. 設置 GitHub Webhook

#### 在 GitHub 倉庫中：

1. **前往倉庫設置**
   - 打開您的 GitHub 倉庫
   - 點擊 "Settings" 標籤

2. **添加 Webhook**
   - 點擊左側 "Webhooks"
   - 點擊 "Add webhook"

3. **配置 Webhook**
   - **Payload URL**: `https://api.render.com/deploy/srv-xxxxx` (從 Render 獲取)
   - **Content type**: `application/json`
   - **Secret**: 從 Render 獲取
   - **Events**: 選擇 "Just the push event"
   - **Active**: 勾選

### 3. 在 Render 中設置 Auto-Deploy

1. **啟用 Auto-Deploy**
   - 在 Render Dashboard 中選擇您的服務
   - 點擊 "Settings" 標籤
   - 找到 "Auto-Deploy" 設置
   - 設置為 "Yes"
   - 選擇 "main" 分支

2. **設置部署觸發**
   - 選擇 "On commit" (您已經設置了)
   - 確保 GitHub 連接正常

## 📋 部署檢查清單

### 部署前檢查：
- [ ] 創建了 Static Site (不是 Web Service)
- [ ] Root Directory 設置為 `echo_debate_of_school_project`
- [ ] Build Command 設置為 `npm install && npm run build`
- [ ] Publish Directory 設置為 `echo_debate_of_school_project/dist`
- [ ] 環境變量已設置

### 部署後檢查：
- [ ] 網站可以正常訪問
- [ ] 主頁顯示正常
- [ ] session_id 功能正常
- [ ] Auto-Deploy 已啟用
- [ ] GitHub webhook 已設置

## 🎯 測試 URL

部署完成後，測試以下 URL：

### 主頁
```
https://fact-check-system.onrender.com/
```

### Session ID 功能
```
https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

## 🔍 故障排除

### 如果仍然出現 Cannot GET 錯誤：

1. **檢查服務類型**
   - 確認部署的是 Static Site
   - 不是 Web Service

2. **檢查構建輸出**
   - 確認 `dist` 文件夾包含 `index.html`
   - 檢查構建日誌是否有錯誤

3. **檢查路由配置**
   - 確認 SPA 路由配置正確
   - 所有路由都重定向到 `index.html`

### 如果 Auto-Deploy 不工作：

1. **檢查 GitHub 連接**
   - 確認 Render 可以訪問您的 GitHub 倉庫
   - 檢查倉庫權限設置

2. **檢查 Webhook**
   - 確認 webhook URL 正確
   - 檢查 webhook 是否被觸發

3. **手動觸發部署**
   - 在 Render Dashboard 中點擊 "Manual Deploy"
   - 選擇 "Deploy latest commit"

## 🚀 快速修復步驟

1. **推送修復代碼**
   ```bash
   git add .
   git commit -m "修復部署配置 - 設置為 Static Site"
   git push origin main
   ```

2. **重新部署為 Static Site**
   - 按照上述步驟創建 Static Site

3. **設置 Webhook 和 Auto-Deploy**
   - 按照上述步驟設置

4. **測試網站**
   - 等待部署完成
   - 測試所有功能

## ✅ 預期結果

修復完成後：
- ✅ 網站可以正常訪問
- ✅ 主頁顯示正常
- ✅ session_id 功能正常
- ✅ 每次 GitHub 推送自動更新

**現在可以開始修復部署了！** 🚀
