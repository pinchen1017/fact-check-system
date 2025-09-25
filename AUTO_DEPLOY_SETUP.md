# 🚀 自動部署設置指南

## ✅ 已修復的問題

### 1. 網頁顯示問題
- **問題**: 部署後網頁無法正常顯示
- **解決**: 添加了 `homepage` 字段到 `package.json`
- **修復**: 優化了 Vite 配置確保資源路徑正確

### 2. 資源路徑問題
- **問題**: 靜態資源無法正確加載
- **解決**: 設置正確的 `base: '/'` 配置

## 🔧 設置自動部署

### 1. 在 Render 上啟用 Auto-Deploy

1. **登入 Render Dashboard**
   - 前往 [https://dashboard.render.com/](https://dashboard.render.com/)
   - 選擇您的 `fact-check-system` 服務

2. **啟用自動部署**
   - 點擊 "Settings" 標籤
   - 找到 "Auto-Deploy" 設置
   - 確保設置為 "Yes"
   - 選擇 "main" 分支

3. **設置部署觸發**
   - 每次 GitHub 推送時自動部署
   - 部署前自動運行構建命令

### 2. GitHub Webhook 設置

1. **檢查 GitHub 倉庫設置**
   - 前往您的 GitHub 倉庫
   - 點擊 "Settings" → "Webhooks"
   - 確認 Render 的 webhook 已正確設置

2. **測試自動部署**
   - 推送一個小更改到 GitHub
   - 檢查 Render 是否自動開始部署

## 📋 部署流程

### 每次更新代碼時：

1. **本地修改**
   ```bash
   # 修改代碼
   # 測試本地構建
   npm run build
   ```

2. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "更新功能描述"
   git push origin main
   ```

3. **自動部署**
   - Render 自動檢測到 GitHub 更新
   - 自動拉取最新代碼
   - 自動運行構建命令
   - 自動部署到生產環境

4. **驗證部署**
   - 檢查 Render 部署日誌
   - 測試網站功能
   - 確認 session_id 功能正常

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

### 如果自動部署失敗：

1. **檢查 Render 日誌**
   - 查看構建日誌中的錯誤信息
   - 確認環境變量設置正確

2. **檢查 GitHub 連接**
   - 確認 webhook 設置正確
   - 檢查倉庫權限

3. **手動觸發部署**
   - 在 Render Dashboard 中點擊 "Manual Deploy"
   - 選擇 "Deploy latest commit"

### 如果網頁仍然無法顯示：

1. **檢查構建輸出**
   - 確認 `dist` 文件夾包含所有必要文件
   - 檢查 `index.html` 是否正確生成

2. **檢查資源路徑**
   - 確認所有 CSS 和 JS 文件路徑正確
   - 檢查圖片和字體文件

## ✅ 部署檢查清單

- [ ] Auto-Deploy 已啟用
- [ ] GitHub webhook 設置正確
- [ ] 本地構建測試通過
- [ ] 代碼已推送到 GitHub
- [ ] Render 自動部署成功
- [ ] 網站正常顯示
- [ ] session_id 功能正常

## 🎉 完成！

設置完成後，每次更新 GitHub 倉庫，您的網站都會自動更新！

**現在可以開始使用自動部署功能了！** 🚀
