# 🔧 修復 Render 構建命令錯誤

## 🚨 問題診斷

### 錯誤信息：
```
bash: line 1: $: command not found
==> Build failed 😞
```

### 問題原因：
Render 的構建命令中包含了錯誤的 `$` 符號，導致 bash 無法識別命令。

## 🔧 解決方案

### 1. 在 Render Dashboard 中修復構建命令

1. **登入 Render Dashboard**
   - 前往 [https://dashboard.render.com/](https://dashboard.render.com/)
   - 選擇您的 `fact-check-system` 服務

2. **修復構建命令**
   - 點擊 "Settings" 標籤
   - 找到 "Build Command" 設置
   - 將構建命令改為：`npm install && npm run build`
   - **重要**：確保沒有 `$` 符號

3. **保存設置**
   - 點擊 "Save Changes"
   - 觸發重新部署

### 2. 正確的構建命令

**錯誤的構建命令**：
```
npm install && $ npm run build
```

**正確的構建命令**：
```
npm install && npm run build
```

### 3. 完整的部署配置

在 Render Dashboard 中設置：

- **Name**: `fact-check-system`
- **Root Directory**: `echo_debate_of_school_project`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `echo_debate_of_school_project/dist`

### 4. 環境變量設置

```
NODE_VERSION=18
VITE_COFACT_TOKEN=您的_Cofact_Token
VITE_FASTAPI_URL=http://127.0.0.1:8000
```

## 📋 修復步驟

### 1. 修復構建命令
- 在 Render Dashboard 中移除 `$` 符號
- 確保構建命令為：`npm install && npm run build`

### 2. 觸發重新部署
- 點擊 "Manual Deploy"
- 選擇 "Deploy latest commit"

### 3. 監控部署日誌
- 查看構建日誌確認沒有錯誤
- 等待部署完成

### 4. 測試網站
- 測試主頁：`https://fact-check-system.onrender.com/`
- 測試 session_id：`https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc`

## 🔍 故障排除

### 如果仍然失敗：

1. **檢查構建命令**
   - 確認沒有 `$` 符號
   - 確認命令格式正確

2. **檢查 Node.js 版本**
   - 確認設置為 Node.js 18
   - 檢查環境變量

3. **檢查依賴**
   - 確認 package.json 正確
   - 檢查是否有依賴衝突

### 如果構建成功但網站無法訪問：

1. **檢查 Publish Directory**
   - 確認設置為 `echo_debate_of_school_project/dist`
   - 檢查 dist 文件夾是否包含 index.html

2. **檢查路由配置**
   - 確認 SPA 路由配置正確
   - 所有路由重定向到 index.html

## ✅ 預期結果

修復完成後：
- ✅ 構建命令執行成功
- ✅ 網站可以正常訪問
- ✅ 所有功能正常工作
- ✅ session_id 功能正常

## 🚀 快速修復

1. **在 Render Dashboard 中**：
   - 修復構建命令（移除 `$` 符號）
   - 觸發重新部署

2. **等待部署完成**：
   - 監控構建日誌
   - 確認沒有錯誤

3. **測試網站**：
   - 訪問網站確認正常
   - 測試所有功能

**現在可以修復構建命令了！** 🔧
