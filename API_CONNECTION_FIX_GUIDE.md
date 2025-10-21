# API 連接問題解決指南

## 問題分析

根據您提供的錯誤訊息，主要問題包括：

1. **後端根路徑 404 錯誤**：`GET / HTTP/1.1" 404 Not Found`
2. **Session 查詢失敗**：`Session查詢失敗: 404 - Not Found`
3. **API 端點不匹配**：前端嘗試訪問不存在的端點

## 已完成的修復

### ✅ 1. 後端修復

我已經更新了 `backend/main.py`，添加了以下端點：

```python
# 根路徑處理
@app.get("/")
def root():
    return {"message": "Fact Check System Backend API", "status": "running"}

# Session 相關端點
@app.get("/api-proxy/apps/judge/users/user/sessions/{session_id}")
def get_user_session(session_id: str):
    # 返回 session 資料

# Cofact API 端點
@app.get("/api/cofact/check")
def cofact_check(text: str):
    # 返回 Cofact 分析結果
```

### ✅ 2. 前端修復

我已經更新了前端配置：

- 更新了 `src/config/api.js` 以包含新的 API 端點
- 創建了 `src/services/apiService.js` 來處理 API 調用
- 添加了 session 和 Cofact API 的整合

## 下一步操作

### 步驟 1：等待 Render 自動部署

1. 後端代碼已經推送到 GitHub
2. Render 會自動檢測到變更並重新部署
3. 等待約 2-3 分鐘讓部署完成

### 步驟 2：測試後端 API

使用以下 URL 測試後端是否正常：

```
https://fact-check-backend-vqvl.onrender.com/
https://fact-check-backend-vqvl.onrender.com/api/health
https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/test-session-123
```

### 步驟 3：更新前端環境變數

在 Render 前端服務中添加環境變數：

1. 前往您的前端服務頁面
2. 點擊 "Environment" 標籤
3. 添加環境變數：
   ```
   VITE_API_BASE_URL = https://fact-check-backend-vqvl.onrender.com/api
   ```
4. 重新部署前端

### 步驟 4：測試完整系統

1. 訪問前端網站：https://fact-check-system-static.onrender.com/
2. 檢查瀏覽器開發者工具的 Console 和 Network 標籤
3. 確認沒有 404 錯誤

## 故障排除

### 如果後端仍然返回 404

1. **檢查 Render 部署狀態**：
   - 前往 Render 儀表板
   - 查看後端服務的部署日誌
   - 確認沒有構建錯誤

2. **檢查環境變數**：
   - 確認資料庫連接資訊正確
   - 檢查是否有遺漏的環境變數

3. **手動觸發重新部署**：
   - 在 Render 後端服務頁面
   - 點擊 "Manual Deploy" → "Deploy latest commit"

### 如果前端仍然無法連接

1. **檢查環境變數**：
   - 確認 `VITE_API_BASE_URL` 設置正確
   - 檢查前端是否重新部署

2. **檢查 CORS 設置**：
   - 確認後端的 `ALLOWED_ORIGINS` 包含前端域名
   - 檢查是否有 CORS 錯誤

3. **檢查網路連接**：
   - 使用瀏覽器直接訪問後端 URL
   - 確認後端可以正常響應

## 測試腳本

我已經創建了 `test-api-connection.js` 腳本，您可以用它來測試 API 連接：

```javascript
// 在瀏覽器控制台執行
const testAPI = async () => {
  const BACKEND_URL = 'https://fact-check-backend-vqvl.onrender.com';
  
  try {
    // 測試根路徑
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ 根路徑響應:', rootData);
    
    // 測試 session 端點
    const sessionResponse = await fetch(`${BACKEND_URL}/api-proxy/apps/judge/users/user/sessions/test-session-123`);
    const sessionData = await sessionResponse.json();
    console.log('✅ Session 響應:', sessionData);
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error);
  }
};

testAPI();
```

## 預期結果

修復完成後，您應該看到：

1. **後端根路徑**：返回 `{"message": "Fact Check System Backend API", "status": "running"}`
2. **Session 查詢**：返回用戶 session 資料
3. **前端網站**：不再顯示 404 錯誤
4. **API 調用**：正常連接後端服務

## 如果問題持續存在

如果按照以上步驟操作後問題仍然存在，請提供：

1. 後端服務的部署日誌
2. 前端瀏覽器控制台的錯誤訊息
3. 網路請求的詳細資訊

我會根據具體的錯誤訊息提供進一步的解決方案。
