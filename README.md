# Echo Debate 事實查核系統 - Docker 部署版

## 一、 專案概述

這是一個基於 React + Node.js 的事實查核系統，提供即時新聞分析、辯論法庭和熱門查證功能。本專案已完全容器化，使用 Docker 進行部署，適合在實驗室環境中快速部署和運行。

## 二、 系統架構

### 前端 (Frontend)
- **技術棧**: React 19 + Vite + React Router
- **端口**: 3000
- **功能**: 
  - 事實查核介面
  - 辯論法庭模擬
  - 熱門查證排行
  - 即時分析結果展示

### 後端 (Backend)
- **技術棧**: Node.js + Express + PostgreSQL
- **端口**: 4000
- **功能**:
  - RESTful API 服務
  - 資料庫連接管理
  - JWT 身份驗證
  - 即時數據處理

### 外部服務
- **FastAPI 服務**: `http://120.107.172.133:10001/`
- **資料庫**: PostgreSQL (35.221.147.151:5432)

## 🚀 快速部署

### 前置需求

1. **Docker 環境**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# 重新登入或執行：newgrp docker
```

2. **驗證安裝**
```bash
docker --version
docker-compose --version
```

### 一鍵部署

```bash
# 使用快速部署腳本
./quick-deploy.sh

# 或手動部署
docker-compose build
docker-compose up -d
```

### 驗證部署

```bash
# 檢查服務狀態
docker-compose ps

# 測試前端
curl http://localhost:3000

# 測試後端 API
curl http://localhost:4000/api/health
```

## 🎯 正常執行指南

### 第一次執行

1. **確保 Docker 環境就緒**
```bash
# 檢查 Docker 狀態
docker --version
docker-compose --version

# 如果沒有安裝，請先安裝 Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

2. **下載並準備專案**
```bash
# 進入專案目錄
cd UI6_docker

# 確保腳本有執行權限
chmod +x quick-deploy.sh
```

3. **執行部署**
```bash
# 方法一：使用快速部署腳本（推薦）
./quick-deploy.sh

# 方法二：手動部署
docker-compose build
docker-compose up -d
```

4. **等待服務啟動**
```bash
# 查看啟動日誌
docker-compose logs -f

# 等待看到類似以下訊息：
# echo-debate-app | Starting services with PM2...
# echo-debate-app | [PM2] Starting frontend
# echo-debate-app | [PM2] Starting backend
```

5. **驗證服務正常運行**
```bash
# 檢查容器狀態（應該顯示 "Up" 狀態）
docker-compose ps

# 測試前端服務
curl -I http://localhost:3000
# 應該返回 HTTP/1.1 200 OK

# 測試後端 API
curl http://localhost:4000/api/health
# 應該返回 {"ok":true}
```

### 日常使用

1. **啟動服務**
```bash
# 如果服務已停止，重新啟動
docker-compose up -d

# 查看服務狀態
docker-compose ps
```

2. **停止服務**
```bash
# 停止所有服務
docker-compose down

# 停止並清理資源
docker-compose down -v
```

3. **重啟服務**
```bash
# 重啟所有服務
docker-compose restart

# 重啟特定服務
docker-compose restart echo-debate-app
```

4. **查看日誌**
```bash
# 查看所有服務日誌
docker-compose logs

# 即時查看日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs echo-debate-app
```

### 訪問應用

部署成功後，在瀏覽器中訪問：

- **主應用**: http://localhost:3000
- **API 健康檢查**: http://localhost:4000/api/health

### 功能測試

1. **事實查核功能**
   - 訪問 http://localhost:3000
   - 在搜尋框輸入要查證的新聞
   - 點擊「開始查證」按鈕
   - 觀察即時分析結果

2. **辯論法庭功能**
   - 點擊「辯論法庭」頁面
   - 查看正反方辯論過程
   - 觀察法官裁決結果

3. **熱門查證功能**
   - 點擊「熱門查證」頁面
   - 查看熱門查證排行
   - 瀏覽歷史查證記錄

### 常見問題解決

1. **端口被占用**
```bash
# 檢查端口使用情況
netstat -tulpn | grep :3000
netstat -tulpn | grep :4000

# 如果端口被占用，修改 docker-compose.yml 中的端口映射
# 例如：將 "3000:3000" 改為 "3001:3000"
```

2. **服務無法啟動**
```bash
# 查看詳細錯誤日誌
docker-compose logs echo-debate-app

# 重新建置容器
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

3. **資料庫連接問題**
```bash
# 檢查網路連接
ping 35.221.147.151

# 檢查環境變數
docker-compose exec echo-debate-app env | grep DB_
```

4. **前端無法訪問**
```bash
# 檢查前端服務狀態
docker-compose exec echo-debate-app pm2 status

# 重啟前端服務
docker-compose exec echo-debate-app pm2 restart frontend
```

### 系統監控

1. **查看系統資源使用**
```bash
# 查看容器資源使用
docker stats

# 查看特定容器資源
docker stats echo-debate-container
```

2. **查看 PM2 進程狀態**
```bash
# 進入容器
docker-compose exec echo-debate-app bash

# 查看 PM2 狀態
pm2 status

# 查看 PM2 日誌
pm2 logs

# 重啟所有進程
pm2 restart all
```

3. **健康檢查**
```bash
# 檢查容器健康狀態
docker-compose ps

# 手動健康檢查
curl -f http://localhost:4000/api/health
```

## 📁 專案結構

```
UI6_docker/
├── Dockerfile                 # Docker 容器配置
├── docker-compose.yml        # 容器編排配置
├── .dockerignore             # Docker 忽略文件
├── quick-deploy.sh           # 快速部署腳本
├── DOCKER_DEPLOYMENT_GUIDE.md # 詳細部署指南
├── README.md                 # 本文件
├── dbAPI.py                  # FastAPI 服務配置
├── echo_debate_of_school_project/  # 前端專案
│   ├── src/                  # React 源碼
│   ├── dist/                 # 建置輸出
│   ├── package.json          # 前端依賴
│   └── vite.config.js        # Vite 配置
└── server/                   # 後端專案
    ├── index.js              # Express 服務
    └── package.json          # 後端依賴
```

## 🔧 配置說明

### 環境變數

在 `docker-compose.yml` 中預設的環境變數：

| 變數名 | 值 | 說明 |
|--------|-----|------|
| `DB_HOST` | 35.221.147.151 | 資料庫主機 |
| `DB_PORT` | 5432 | 資料庫端口 |
| `DB_USER` | postgres | 資料庫使用者 |
| `DB_PASSWORD` | @Aa123456 | 資料庫密碼 |
| `DB_NAME` | linebot_v2 | 資料庫名稱 |
| `DB_SSL` | true | SSL 連接 |
| `JWT_SECRET` | production-secret-key-2024 | JWT 密鑰 |
| `NODE_ENV` | production | 環境模式 |
| `VITE_FASTAPI_URL` | http://120.107.172.133:10001 | FastAPI 服務 URL |

### 端口配置

- **前端**: 3000 (React 應用)
- **後端**: 4000 (Express API)
- **代理**: `/api-proxy` → `http://120.107.172.133:10001/`

## 🛠️ 開發與維護

### 常用指令

```bash
# 查看容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 重啟服務
docker-compose restart

# 停止服務
docker-compose down

# 進入容器
docker-compose exec echo-debate-app bash

# 清理資源
docker system prune -f
```

### PM2 管理

```bash
# 進入容器
docker-compose exec echo-debate-app bash

# 查看 PM2 狀態
pm2 status

# 重啟所有服務
pm2 restart all

# 查看 PM2 日誌
pm2 logs
```

### 故障排除

1. **端口衝突**
   - 修改 `docker-compose.yml` 中的端口映射
   - 例如：`"3001:3000"` 改為使用 3001 端口

2. **資料庫連接問題**
   ```bash
   # 檢查環境變數
   docker-compose exec echo-debate-app env | grep DB_
   ```

3. **建置失敗**
   ```bash
   # 清理並重新建置
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   ```

4. **權限問題**
   ```bash
   # 確保 Docker 有權限
   sudo chown -R $USER:$USER .
   ```

## 🌐 訪問地址

部署成功後，可以通過以下地址訪問：

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:4000/api/health
- **API 文檔**: http://localhost:4000/api/health

## 📊 系統功能

### 主要功能模組

1. **事實查核 (Fact Check)**
   - 即時新聞分析
   - 多模型驗證
   - 可信度評分

2. **辯論法庭 (Debate Court)**
   - 正反方辯論
   - 法官裁決
   - 證據展示

3. **熱門查證 (Trending)**
   - 熱門查證排行
   - 歷史記錄
   - 統計分析

4. **即時分析 (Real-time Analysis)**
   - SSE 即時更新
   - 進度追蹤
   - 結果展示

## 🔒 安全考量

- JWT 身份驗證
- CORS 跨域配置
- SSL 資料庫連接
- 環境變數隔離

## 📈 效能優化

- PM2 進程管理
- Docker 容器隔離
- 靜態文件 CDN
- 資料庫連接池

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 發起 Pull Request

## 📞 技術支援

如有問題，請檢查：

1. Docker 服務是否正常運行
2. 網路連接是否暢通
3. 環境變數是否正確設定
4. 日誌文件中的錯誤訊息

## 📄 授權

本專案採用 MIT 授權條款。

---

**注意**: 本專案已針對實驗室環境進行優化，包含預設的資料庫連接和 API 端點配置。在生產環境部署前，請務必修改相關的安全設定。