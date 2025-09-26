# 🚀 GitHub Pages 部署錯誤修復指南

## 🚨 問題確認

錯誤信息：
```
Error: Failed to create deployment (status: 404) with build version 0c3828597c4e6c15514f92a36327176516af7888
Ensure GitHub Pages has been enabled: https://github.com/pinchen1017/fact-check-system/settings/pages
```

## ✅ 解決步驟

### 1. 啟用 GitHub Pages

1. **訪問 GitHub Pages 設置**：
   ```
   https://github.com/pinchen1017/fact-check-system/settings/pages
   ```

2. **配置 GitHub Pages**：
   - **Source**: 選擇 "GitHub Actions"
   - **Branch**: 選擇 "main" (或您的主要分支)
   - 點擊 "Save"

### 2. 檢查倉庫權限

確保您的倉庫有以下設置：
- **倉庫是公開的** (Public)
- **GitHub Pages 已啟用**
- **Actions 權限已啟用**

### 3. 重新觸發部署

啟用 GitHub Pages 後，重新觸發部署：

1. **推送一個小更改**：
   ```bash
   git add .
   git commit -m "啟用 GitHub Pages 後重新部署"
   git push origin main
   ```

2. **或者手動觸發 Actions**：
   - 訪問：`https://github.com/pinchen1017/fact-check-system/actions`
   - 點擊 "Deploy Vite (subfolder) to GitHub Pages"
   - 點擊 "Run workflow"

### 4. 檢查部署狀態

1. **檢查 Actions 狀態**：
   ```
   https://github.com/pinchen1017/fact-check-system/actions
   ```

2. **檢查 Pages 狀態**：
   ```
   https://github.com/pinchen1017/fact-check-system/settings/pages
   ```

3. **訪問部署的網站**：
   ```
   https://pinchen1017.github.io/fact-check-system/
   ```

## 🔧 替代方案：使用 Render

如果 GitHub Pages 仍有問題，建議繼續使用 Render：

### 1. 確保 Render 部署正常

1. **檢查 Render 狀態**：
   ```
   https://dashboard.render.com/
   ```

2. **確認網站可訪問**：
   ```
   https://fact-check-system-static.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
   ```

### 2. 測試 SLM 分析

1. **打開瀏覽器開發者工具** (F12)
2. **切換到 Console 標籤**
3. **訪問網站並點擊 SLM 按鈕**
4. **檢查調試信息**

## 📋 檢查清單

- [ ] GitHub Pages 已啟用
- [ ] Source 設置為 "GitHub Actions"
- [ ] 倉庫是公開的
- [ ] Actions 權限已啟用
- [ ] 重新觸發了部署
- [ ] 檢查了部署狀態

## 🎯 預期結果

成功後，您應該能夠訪問：
```
https://pinchen1017.github.io/fact-check-system/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

## 📞 如果問題仍然存在

請提供以下信息：
1. **GitHub Pages 設置截圖**
2. **Actions 運行狀態**
3. **任何錯誤信息**

**建議：先啟用 GitHub Pages，如果仍有問題，繼續使用 Render 部署！** 🚀
