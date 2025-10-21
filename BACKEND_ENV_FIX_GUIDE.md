# 後端環境變數修復指南

## 問題診斷

根據您的描述，後端雖然在運行，但 API 和資料庫連接失敗。這通常是因為 Render 後端服務沒有正確設置環境變數。

## 解決步驟

### 步驟 1：檢查 Render 後端環境變數

1. **前往 Render 儀表板**
   - 登入 https://render.com
   - 找到您的後端服務 `fact-check-backend`

2. **檢查環境變數設置**
   - 點擊後端服務
   - 點擊 "Environment" 標籤
   - 確認以下環境變數是否存在：

   ```
   DB_HOST = 35.221.147.151
   DB_PORT = 5432
   DB_NAME = linebot_v2
   DB_USER = postgres
   DB_PASS = @Aa123456
   ```

### 步驟 2：如果環境變數不存在，請添加

1. **在 Render 後端服務頁面**
   - 點擊 "Environment" 標籤
   - 點擊 "Add Environment Variable"
   - 逐一添加上述環境變數

2. **重新部署後端**
   - 添加環境變數後，點擊 "Manual Deploy" → "Deploy latest commit"
   - 等待部署完成（約 2-3 分鐘）

### 步驟 3：測試後端端點

部署完成後，請測試以下 URL：

1. **根路徑**：
   ```
   https://fact-check-backend-vqvl.onrender.com/
   ```

2. **資料庫連接測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/db-test
   ```
   **預期結果**：應該顯示資料庫連接成功和配置資訊

3. **健康檢查**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/health
   ```

4. **Session 端點**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/test-session-123
   ```

### 步驟 4：檢查前端連接

1. **訪問前端網站**：
   ```
   https://fact-check-system-static.onrender.com/
   ```

2. **檢查瀏覽器開發者工具**：
   - 按 F12 打開開發者工具
   - 查看 Console 標籤的錯誤訊息
   - 查看 Network 標籤的 API 請求

## 常見問題

### 問題 1：資料庫連接失敗

**症狀**：`/api/db-test` 返回錯誤

**解決方案**：
1. 檢查環境變數是否正確設置
2. 確認資料庫是否允許外部連接
3. 檢查資料庫連接資訊是否正確

### 問題 2：API 端點 404 錯誤

**症狀**：前端請求返回 404

**解決方案**：
1. 確認後端已重新部署
2. 檢查 API 端點路徑是否正確
3. 確認 CORS 設置是否正確

### 問題 3：CORS 錯誤

**症狀**：瀏覽器控制台顯示 CORS 錯誤

**解決方案**：
1. 檢查後端的 `ALLOWED_ORIGINS` 設置
2. 確認前端域名已添加到允許列表

## 測試腳本

您可以使用以下 JavaScript 代碼在瀏覽器控制台測試：

```javascript
// 測試後端端點
const testBackend = async () => {
  const BACKEND_URL = 'https://fact-check-backend-vqvl.onrender.com';
  
  try {
    // 測試資料庫連接
    const dbResponse = await fetch(`${BACKEND_URL}/api/db-test`);
    const dbData = await dbResponse.json();
    console.log('資料庫測試結果:', dbData);
    
    // 測試 Session 端點
    const sessionResponse = await fetch(`${BACKEND_URL}/api-proxy/apps/judge/users/user/sessions/test-session-123`);
    const sessionData = await sessionResponse.json();
    console.log('Session 測試結果:', sessionData);
    
  } catch (error) {
    console.error('測試失敗:', error);
  }
};

testBackend();
```

## 預期結果

修復完成後，您應該看到：

1. ✅ 資料庫連接成功
2. ✅ API 端點正常響應
3. ✅ 前端不再顯示 404 錯誤
4. ✅ Session 查詢成功
5. ✅ Cofact API 功能正常

## 如果問題持續存在

請告訴我：
1. 後端環境變數設置的截圖
2. `/api/db-test` 端點的響應結果
3. 前端瀏覽器控制台的具體錯誤訊息

我會根據具體情況提供進一步的解決方案。
