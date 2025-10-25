# Docker 部署指南

## 前置需求

在實驗室電腦上需要安裝以下軟體：

### 1. 安裝 Docker
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# 將使用者加入 docker 群組（避免每次都要 sudo）
sudo usermod -aG docker $USER
# 重新登入或執行：newgrp docker
```

### 2. 確認 Docker 安裝
```bash
docker --version
docker-compose --version
```

## 部署步驟

### 步驟 1：準備專案文件
確保你的專案目錄包含以下文件：
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `echo_debate_of_school_project/` (前端專案)
- `server/` (後端專案)

### 步驟 2：建置 Docker 映像
```bash
# 在專案根目錄執行
docker-compose build
```

### 步驟 3：啟動容器
```bash
# 啟動服務
docker-compose up -d

# 查看運行狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

### 步驟 4：驗證部署
```bash
# 檢查前端 (端口 3000)
curl http://localhost:3000

# 檢查後端 API (端口 4000)
curl http://localhost:4000/api/health
```

## 常用指令

### 容器管理
```bash
# 停止服務
docker-compose down

# 重新啟動服務
docker-compose restart

# 查看容器狀態
docker-compose ps

# 進入容器內部
docker-compose exec echo-debate-app bash
```

### 日誌查看
```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs echo-debate-app

# 即時查看日誌
docker-compose logs -f
```

### PM2 管理
```bash
# 進入容器
docker-compose exec echo-debate-app bash

# 在容器內查看 PM2 狀態
pm2 status

# 重啟 PM2 服務
pm2 restart all

# 查看 PM2 日誌
pm2 logs
```

## 故障排除

### 1. 端口衝突
如果 3000 或 4000 端口被占用：
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "3001:3000"  # 改為 3001
  - "4001:4000"  # 改為 4001
```

### 2. 資料庫連接問題
檢查資料庫連接設定：
```bash
# 進入容器檢查環境變數
docker-compose exec echo-debate-app env | grep DB_
```

### 3. 建置失敗
```bash
# 清理並重新建置
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

### 4. 權限問題
```bash
# 確保 Docker 有權限
sudo chown -R $USER:$USER .
```

## 環境變數說明

在 `docker-compose.yml` 中已預設以下環境變數：

- `DB_HOST`: 資料庫主機 (35.221.147.151)
- `DB_PORT`: 資料庫端口 (5432)
- `DB_USER`: 資料庫使用者 (postgres)
- `DB_PASSWORD`: 資料庫密碼 (@Aa123456)
- `DB_NAME`: 資料庫名稱 (linebot_v2)
- `DB_SSL`: SSL 連接 (true)
- `JWT_SECRET`: JWT 密鑰
- `NODE_ENV`: 環境模式 (production)
- `VITE_FASTAPI_URL`: FastAPI 服務 URL (http://120.107.172.133:10001)

## 服務架構

- **前端**: React + Vite 建置的靜態文件，由 `serve` 在端口 3000 提供服務
- **後端**: Node.js Express API，在端口 4000 提供服務
- **進程管理**: 使用 PM2 管理前後端服務
- **基礎系統**: Ubuntu 22.04

## 訪問應用

部署成功後，可以通過以下 URL 訪問：

- 前端應用: http://localhost:3000
- 後端 API: http://localhost:4000/api/health

## 注意事項

1. 確保實驗室電腦有足夠的記憶體（建議至少 2GB）
2. 確保網路連接正常，因為需要連接外部資料庫
3. 如果防火牆阻擋，請開放 3000 和 4000 端口
4. 定期檢查容器狀態和日誌，確保服務正常運行
