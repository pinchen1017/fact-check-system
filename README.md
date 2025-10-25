# Echo Debate 事實查核系統 - Docker 部署版

## 📋 專案概述

這是一個基於 React + Node.js 的事實查核系統，提供即時新聞分析、辯論法庭和熱門查證功能。本專案已完全容器化，使用 Docker 進行部署，適合在實驗室環境中快速部署和運行。

## 🏗️ 系統架構

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