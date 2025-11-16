# Ngrok 設定指南

本指南將幫助您使用 Ngrok 來公開您的服務，讓其他人可以通過公網訪問。

## 快速開始

### 步驟 1：註冊 Ngrok 賬號並獲取 Auth Token

1. 前往 [Ngrok 官網](https://dashboard.ngrok.com/signup) 註冊免費賬號
2. 登入後到 [Auth Token 頁面](https://dashboard.ngrok.com/get-started/your-authtoken)
3. 複製您的 authtoken（類似：`2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`）

### 步驟 2：創建環境變數文件

在專案根目錄創建 `.env` 文件：

**Windows (PowerShell):**
```powershell
# 在專案根目錄執行
echo "NGROK_AUTHTOKEN=your-actual-ngrok-authtoken" > .env
```

**Linux/Mac:**
```bash
# 在專案根目錄執行
echo "NGROK_AUTHTOKEN=your-actual-ngrok-authtoken" > .env
```

或手動創建 `.env` 文件，內容如下：

```
NGROK_AUTHTOKEN=your-actual-ngrok-authtoken
```

請將 `your-actual-ngrok-authtoken` 替換為您在步驟 1 中獲取的實際 authtoken。

### 步驟 3：啟動服務

```bash
# 確保應用服務已啟動
docker-compose up -d

# 啟動 ngrok 服務（會自動讀取 .env 文件中的 NGROK_AUTHTOKEN）
docker-compose --profile ngrok up -d ngrok-frontend
```

### 步驟 4：查看公開網址

```bash
# 查看 ngrok 日誌
docker-compose logs ngrok-frontend
```

在日誌中尋找類似以下的輸出：

```
tunnels:
  - name: frontend
    url: https://xxxx-xxx-xxxx.ngrok-free.app
  - name: backend
    url: https://yyyy-yyy-yyyy.ngrok-free.app
```

或者訪問 ngrok 的 Web 介面查看（需要額外配置）：

```bash
# 訪問 http://localhost:4040 查看 ngrok 的 Web UI
```

### 步驟 5：分享公開網址

- **前端服務**: `https://xxxx-xxx-xxxx.ngrok-free.app`
- **後端 API**: `https://yyyy-yyy-yyyy.ngrok-free.app`

其他人現在可以通過這些網址訪問您的服務了！

## 常用命令

### 查看服務狀態
```bash
docker-compose --profile ngrok ps
```

### 查看實時日誌
```bash
docker-compose --profile ngrok logs -f ngrok-frontend
```

### 停止 Ngrok 服務
```bash
docker-compose --profile ngrok stop ngrok-frontend
```

### 重啟 Ngrok 服務
```bash
docker-compose --profile ngrok restart ngrok-frontend
```

### 完全停止所有服務
```bash
docker-compose --profile ngrok down
```

## 配置說明

### ngrok.yml 配置文件

當前配置會同時暴露兩個服務：
- **frontend**: 前端應用（端口 3000）
- **backend**: 後端 API（端口 4000）

如需修改配置，請編輯 `ngrok.yml` 文件。

### 自訂域名（付費功能）

如果您有 Ngrok 付費賬號，可以在 `ngrok.yml` 中設定固定域名：

```yaml
tunnels:
  frontend:
    addr: echo-debate-app:3000
    proto: http
    hostname: your-custom-domain.ngrok.io  # 您的自訂域名
    inspect: true
    bind_tls: true
```

## 故障排除

### 問題：ngrok 服務無法啟動

**解決方案：**
1. 確認 `.env` 文件存在且包含有效的 `NGROK_AUTHTOKEN`
2. 檢查 authtoken 是否正確（無多餘空格）
3. 查看日誌：`docker-compose --profile ngrok logs ngrok-frontend`

### 問題：無法連接到公開網址

**解決方案：**
1. 確認應用服務（echo-debate-app）正在運行：`docker-compose ps`
2. 確認 ngrok 服務正在運行：`docker-compose --profile ngrok ps`
3. 檢查應用健康狀態：`curl http://localhost:4000/api/health`

### 問題：網址每次重啟都會變更（免費版限制）

**說明：** 這是 Ngrok 免費版的正常行為。如需固定網址，請升級到付費版並設定自訂域名。

## 安全建議

1. **不要將 `.env` 文件提交到 Git**
   - 確保 `.env` 在 `.gitignore` 中

2. **定期更換 Auth Token**
   - 如發現 token 洩露，立即在 Ngrok 儀表板中撤銷並生成新的

3. **使用 Ngrok 的訪問限制功能**
   - 可在 `ngrok.yml` 中設定 IP 白名單等安全選項

## 更多資源

- [Ngrok 官方文檔](https://ngrok.com/docs)
- [Ngrok 配置參考](https://ngrok.com/docs/config)
- [Ngrok 定價方案](https://ngrok.com/pricing)

