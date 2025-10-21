# 前端環境變數設置指南

## 問題分析

前端仍然顯示 404 錯誤，這是因為前端沒有正確連接到後端 API。需要設置環境變數讓前端知道後端的 URL。

## 解決步驟

### 步驟 1：在 Render 上設置前端環境變數

1. **登入 Render 儀表板**
   - 前往 https://render.com
   - 找到您的前端服務 `fact-check-system-static`

2. **添加環境變數**
   - 點擊前端服務
   - 點擊 "Environment" 標籤
   - 點擊 "Add Environment Variable"
   - 添加以下變數：
     ```
     Key: VITE_API_BASE_URL
     Value: https://fact-check-backend-vqvl.onrender.com/api
     ```

3. **重新部署前端**
   - 點擊 "Manual Deploy" → "Deploy latest commit"
   - 等待部署完成（約 2-3 分鐘）

### 步驟 2：驗證設置

部署完成後，測試以下 URL：

1. **後端根路徑**：
   ```
   https://fact-check-backend-vqvl.onrender.com/
   ```

2. **後端健康檢查**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/health
   ```

3. **資料庫連接測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/db-test
   ```

4. **Session 端點測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/test-session-123
   ```

### 步驟 3：檢查前端連接

1. **訪問前端網站**：
   ```
   https://fact-check-system-static.onrender.com/
   ```

2. **檢查瀏覽器開發者工具**：
   - 按 F12 打開開發者工具
   - 查看 Console 標籤是否有錯誤
   - 查看 Network 標籤確認 API 請求

## 如果環境變數設置失敗

### 替代方案：直接修改前端代碼

如果無法在 Render 上設置環境變數，我們可以直接修改前端代碼：

1. **修改 API 配置文件**：
   ```javascript
   // 在 src/config/api.js 中
   const getApiBaseUrl = () => {
     // 強制使用後端 URL
     return 'https://fact-check-backend-vqvl.onrender.com/api';
   };
   ```

2. **重新部署前端**：
   - 推送代碼到 GitHub
   - Render 會自動重新部署

## 預期結果

設置完成後，您應該看到：

1. ✅ 前端不再顯示 404 錯誤
2. ✅ Session 查詢成功
3. ✅ 資料庫連接正常
4. ✅ Cofact API 功能正常

## 故障排除

### 如果仍然有 404 錯誤

1. **檢查環境變數是否正確設置**
2. **確認前端已重新部署**
3. **檢查後端是否正常運行**
4. **查看瀏覽器控制台的具體錯誤訊息**

### 如果資料庫連接失敗

1. **檢查後端環境變數**：
   - 確認 Render 後端服務的環境變數設置正確
   - 檢查資料庫連接資訊

2. **測試資料庫端點**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/db-test
   ```

3. **檢查資料庫是否允許外部連接**

## 下一步

完成環境變數設置後，我們將：
1. 測試完整的 API 功能
2. 驗證 Cofact API 整合
3. 確保所有功能正常運作
