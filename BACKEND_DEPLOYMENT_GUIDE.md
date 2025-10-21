# 後端部署到 Render 完整指南

## 步驟 1：準備後端代碼

1. 確保您的 `backend` 資料夾包含以下文件：
   - `main.py` (FastAPI 應用程式)
   - `requirements.txt` (Python 依賴)
   - `Dockerfile` (Docker 配置)
   - `render.yaml` (Render 配置)

## 步驟 2：創建後端 GitHub 倉庫

1. 在 GitHub 上創建一個新的倉庫，例如：`fact-check-backend`
2. 將 `backend` 資料夾的內容上傳到這個倉庫

```bash
# 在 backend 資料夾中執行
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/您的用戶名/fact-check-backend.git
git push -u origin main
```

## 步驟 3：在 Render 上部署後端

1. 登入 [Render](https://render.com)
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub 倉庫 `fact-check-backend`
4. 配置設定：
   - **Name**: `fact-check-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. 在 Environment Variables 中設置：
   ```
   DB_HOST=35.221.147.151
   DB_PORT=5432
   DB_NAME=linebot_v2
   DB_USER=postgres
   DB_PASS=@Aa123456
   ```

6. 點擊 "Create Web Service"

## 步驟 4：獲取後端 URL

部署完成後，您會得到一個 URL，例如：
`https://fact-check-backend-xxxx.onrender.com`

記住這個 URL，下一步需要用它來更新前端配置。

## 步驟 5：測試後端 API

部署完成後，測試以下端點：
- `https://您的後端URL.onrender.com/api/health`
- `https://您的後端URL.onrender.com/docs` (FastAPI 自動文檔)

## 注意事項

1. **免費方案限制**：
   - 服務會在 15 分鐘無活動後休眠
   - 首次訪問可能需要 30 秒啟動時間
   - 每月有使用時間限制

2. **資料庫連接**：
   - 確保您的資料庫允許外部連接
   - 考慮使用雲端資料庫服務（如 Render PostgreSQL）

3. **CORS 設置**：
   - 後端已配置允許前端域名訪問
   - 如需添加其他域名，請修改 `ALLOWED_ORIGINS`
