# 🚀 部署檢查清單 - 今天完成！

## ✅ 準備工作 (已完成)
- [x] 前端構建測試通過
- [x] 後端依賴安裝成功
- [x] session_id 參數支持已添加
- [x] Cofact API 整合正常
- [x] 部署配置文件已創建

## 📋 部署步驟

### 1. 推送代碼到 GitHub
```bash
git add .
git commit -m "準備部署到 Render - 支持 session_id 參數"
git push origin main
```

### 2. 在 Render 部署前端
- [ ] 創建 Static Site
- [ ] 連接 GitHub 倉庫
- [ ] 設置 Root Directory: `echo_debate_of_school_project`
- [ ] 設置 Build Command: `npm install && npm run build`
- [ ] 設置 Publish Directory: `echo_debate_of_school_project/dist`
- [ ] 添加環境變量:
  - [ ] `VITE_COFACT_TOKEN`: 您的 Cofact Token
  - [ ] `VITE_API_URL`: 後端 URL (部署後更新)
  - [ ] `VITE_FASTAPI_URL`: `http://120.107.172.133:10001`

### 3. 在 Render 部署後端
- [ ] 創建 Web Service
- [ ] 連接 GitHub 倉庫
- [ ] 設置 Root Directory: `server`
- [ ] 設置 Build Command: `npm install`
- [ ] 設置 Start Command: `npm start`
- [ ] 添加環境變量:
  - [ ] `JWT_SECRET`: 自動生成
  - [ ] `PORT`: `10000`

### 4. 更新配置
- [ ] 獲取後端部署 URL
- [ ] 更新前端環境變量 `VITE_API_URL`
- [ ] 重新部署前端

### 5. 測試部署
- [ ] 測試主頁: `https://your-frontend-url.onrender.com`
- [ ] 測試 session_id: `https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc`
- [ ] 測試 Cofact API 功能
- [ ] 測試多模型分析結果顯示

## 🎯 預期結果

部署完成後，您將能夠：
1. 通過 URL 直接訪問網站
2. 使用 `?session_id=` 參數直接載入分析結果
3. 正常使用 Cofact API 進行事實查核
4. 查看完整的多模型分析結果

## ⚡ 快速測試 URL

```
https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
```

這個 URL 將直接跳轉到事實查核頁面並顯示「國高中改10點上課現在實施中」的分析結果。

## 🆘 如果遇到問題

1. 檢查 Render 部署日誌
2. 確認環境變量設置正確
3. 測試本地構建是否正常
4. 檢查瀏覽器控制台錯誤

**目標：今天完成部署並公開網站！** 🎉
