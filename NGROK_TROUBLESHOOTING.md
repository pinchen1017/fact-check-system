# Ngrok 連接問題排查指南

## 您遇到的問題

無法連接到：
```
https://corolitic-anabelle-imperturbably.ngrok-free.devsess/?session_id=2201ec48-e823-4376-8ee7-fdc2d573e79a
```

## 問題診斷

### 1. URL 拼写錯誤
- ❌ 錯誤：`ngrok-free.devsess`
- ✅ 正確：`ngrok-free.dev`

**解決方法**：將 URL 改為：
```
https://corolitic-anabelle-imperturbably.ngrok-free.dev/?session_id=2201ec48-e823-4376-8ee7-fdc2d573e79a
```

### 2. Ngrok 未正確設置
當前問題：
- ❌ `.env` 文件不存在
- ❌ `NGROK_AUTHTOKEN` 未設置
- ❌ Ngrok 容器未運行

### 3. 應用容器未運行
- ❌ 主應用容器 `echo-debate-app` 未啟動

## 完整解決步驟

### 步驟 1：獲取 Ngrok Auth Token

1. 訪問 [Ngrok 註冊頁面](https://dashboard.ngrok.com/signup) 註冊賬號
2. 登入後到 [Auth Token 頁面](https://dashboard.ngrok.com/get-started/your-authtoken)
3. 複製您的 authtoken（類似：`2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`）

### 步驟 2：創建 .env 文件

在專案根目錄（`C:\xampp_new2\htdocs\UI6_docker\`）創建 `.env` 文件：

**Windows PowerShell:**
```powershell
cd C:\xampp_new2\htdocs\UI6_docker
echo "NGROK_AUTHTOKEN=您的實際token" > .env
```

或者手動創建 `.env` 文件，內容如下：
```
NGROK_AUTHTOKEN=您的實際ngrok_authtoken
```

### 步驟 3：啟動應用服務

```powershell
# 啟動主應用
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

### 步驟 4：啟動 Ngrok 服務

```powershell
# 啟動 ngrok（會自動讀取 .env 中的 NGROK_AUTHTOKEN）
docker-compose --profile ngrok up -d ngrok-frontend

# 查看 ngrok 日誌，獲取實際的公開網址
docker-compose --profile ngrok logs ngrok-frontend
```

### 步驟 5：獲取正確的 Ngrok URL

查看 ngrok 日誌後，您會看到類似以下的輸出：

```
tunnels:
  - name: frontend
    url: https://xxxx-xxx-xxxx.ngrok-free.app
  - name: backend
    url: https://yyyy-yyy-yyyy.ngrok-free.app
```

**重要**：使用日誌中顯示的實際 URL，不是 `devsess`。

### 步驟 6：訪問正確的 URL

使用正確的格式：

```
https://xxxx-xxx-xxxx.ngrok-free.app/?session_id=2201ec48-e823-4376-8ee7-fdc2d573e79a
```

或者如果需要使用 hash router：

```
https://xxxx-xxx-xxxx.ngrok-free.app/#/?session_id=2201ec48-e823-4376-8ee7-fdc2d573e79a
```

## 快速檢查清單

在嘗試連接前，請確認：

- [ ] `.env` 文件存在且包含有效的 `NGROK_AUTHTOKEN`
- [ ] 應用容器正在運行：`docker-compose ps`
- [ ] Ngrok 容器正在運行：`docker-compose --profile ngrok ps`
- [ ] 使用正確的 ngrok URL（從日誌中獲取）
- [ ] URL 格式正確（`.dev` 或 `.app`，不是 `.devsess`）

## 常用命令

```powershell
# 查看所有容器狀態
docker-compose ps

# 查看 ngrok 日誌（獲取 URL）
docker-compose --profile ngrok logs ngrok-frontend

# 查看應用日誌
docker-compose logs echo-debate-app

# 重啟 ngrok
docker-compose --profile ngrok restart ngrok-frontend

# 停止所有服務
docker-compose --profile ngrok down
```

## 如果仍然無法連接

1. **檢查防火牆**：確保 Windows 防火牆允許 Docker 網絡通信
2. **檢查應用健康**：`curl http://localhost:4000/api/health`
3. **查看詳細錯誤**：檢查瀏覽器開發者工具的 Console 和 Network 標籤
4. **驗證 ngrok 配置**：確認 `ngrok.yml` 中的端口映射正確

