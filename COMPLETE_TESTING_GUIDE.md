# 完整系統測試指南

## 修復完成！現在請按照以下步驟測試

### 🔧 已完成的修復

1. ✅ **後端 API 端點**：添加了所有必要的端點
2. ✅ **資料庫連接測試**：添加了 `/api/db-test` 端點
3. ✅ **前端 API 配置**：強制使用後端 URL
4. ✅ **代碼部署**：已推送到 GitHub，Render 會自動重新部署

### 🧪 測試步驟

#### 步驟 1：等待部署完成（約 3-5 分鐘）

等待 Render 自動重新部署前端和後端服務。

#### 步驟 2：測試後端 API

請依次訪問以下 URL 測試後端：

1. **根路徑測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/
   ```
   **預期結果**：`{"message":"Fact Check System Backend API","status":"running"}`

2. **健康檢查**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/health
   ```
   **預期結果**：`{"status":"ok"}`

3. **資料庫連接測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/db-test
   ```
   **預期結果**：包含資料庫連接狀態和配置資訊

4. **Session 端點測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/test-session-123
   ```
   **預期結果**：`{"status":"ok","session_id":"test-session-123",...}`

5. **Cofact API 測試**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/cofact/check?text=測試文本
   ```
   **預期結果**：包含 Cofact 分析結果

#### 步驟 3：測試前端網站

1. **訪問前端網站**：
   ```
   https://fact-check-system-static.onrender.com/
   ```

2. **檢查是否還有錯誤**：
   - 按 F12 打開開發者工具
   - 查看 Console 標籤
   - 查看 Network 標籤
   - 確認沒有 404 錯誤

3. **測試功能**：
   - 嘗試使用需要後端 API 的功能
   - 檢查 Session 查詢是否成功
   - 測試 Cofact API 功能

### 🔍 故障排除

#### 如果後端 API 測試失敗

1. **檢查 Render 後端服務狀態**：
   - 前往 Render 儀表板
   - 查看後端服務的部署日誌
   - 確認沒有構建錯誤

2. **檢查環境變數**：
   - 確認資料庫連接資訊正確
   - 檢查是否有遺漏的環境變數

#### 如果前端仍然顯示 404 錯誤

1. **檢查前端部署狀態**：
   - 前往 Render 儀表板
   - 查看前端服務的部署日誌
   - 確認前端已重新部署

2. **檢查 API 請求**：
   - 在瀏覽器開發者工具的 Network 標籤中
   - 查看 API 請求是否指向正確的後端 URL
   - 確認沒有 CORS 錯誤

#### 如果資料庫連接失敗

1. **檢查資料庫端點**：
   ```
   https://fact-check-backend-vqvl.onrender.com/api/db-test
   ```

2. **檢查錯誤訊息**：
   - 查看返回的錯誤詳細資訊
   - 確認資料庫連接參數是否正確

### 📊 預期結果

測試完成後，您應該看到：

1. ✅ **後端根路徑**：正常響應
2. ✅ **資料庫連接**：成功連接
3. ✅ **Session 查詢**：返回用戶資料
4. ✅ **Cofact API**：返回分析結果
5. ✅ **前端網站**：不再顯示 404 錯誤
6. ✅ **完整功能**：所有 API 調用正常

### 🚀 下一步

如果所有測試都通過，您的系統就完全正常了！

如果還有問題，請告訴我：
1. 具體哪個測試失敗了
2. 錯誤訊息是什麼
3. 瀏覽器控制台顯示什麼

我會根據具體情況提供進一步的解決方案。
