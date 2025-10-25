# Echo Debate 事實查核系統

本專案為多代理辯論系統，目標在於對假新聞進行可觀察、可審計與可復現的分析，透過多角色協作產出結構化報告。系統基於 React + Node.js 架構，提供即時新聞分析、辯論法庭和熱門查證功能，已完全容器化，使用 Docker 進行部署。

## 快速開始

### 從 GitHub 部署

1. **克隆專案**
```bash
git clone <your-github-repo>
cd UI6_docker
```

2. **一鍵部署**
```bash
# 使用快速部署腳本
./quick-deploy.sh

# 或手動部署
docker-compose build
docker-compose up -d
```

3. **驗證部署**
```bash
# 檢查服務狀態
docker-compose ps

# 測試前端
curl http://localhost:3000

# 測試後端 API
curl http://localhost:4000/api/health
```

4. **訪問應用**
- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:4000/api/health

## 安裝

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

## 執行

### Docker 部署（推薦）

```bash
# 一鍵部署
./quick-deploy.sh

# 或手動部署
docker-compose build
docker-compose up -d
```

### 本地開發

```bash
# 後端服務
cd server
$env:PORT=4000; $env:DB_SSL="true"; npm run dev

# 前端服務（新開終端）
cd echo_debate_of_school_project
npm run dev
```

系統架構採用 Curator → Historian → Moderator 的流程，自資料整理、歷史脈絡建構到辯論主持，逐步完成查核與分析。

### 主要相依套件版本

| 套件 | 版本 |
|------|------|
| React | 19.1.1 |
| Node.js | 20.x |
| Express | 4.21.2 |
| PostgreSQL | 8.11.3 |
| PM2 | Latest |

### 專案結構要點

* `echo_debate_of_school_project/`：前端層（React + Vite）
  * `src/`：React 源碼與組件
  * `dist/`：建置輸出
  * `vite.config.js`：Vite 配置與代理設定
* `server/`：後端層（Node.js + Express）
  * `index.js`：Express 服務與 API 路由
  * `package.json`：後端依賴管理
* `Dockerfile`：容器配置
  * Ubuntu 22.04 基底
  * PM2 進程管理
  * 環境變數預設配置

## 測試與 CI/CD

### 本地測試

```bash
# 測試後端 API
curl http://localhost:4000/api/health

# 測試前端（會自動打開瀏覽器）
# 訪問 http://localhost:5173
```

### Docker 測試

```bash
# 檢查容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f

# 健康檢查
curl -f http://localhost:4000/api/health
```

目前 CI/CD 狀態：已配置 Docker 容器化部署，支援一鍵部署腳本。

## About

本專案為多代理辯論系統，專注於假新聞的事實查核與分析，透過結構化的辯論流程產出可信的查核報告。

### 主要功能

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

## License

MIT license