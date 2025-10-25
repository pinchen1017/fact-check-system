# 使用 Ubuntu 22.04 作為基礎映像
FROM ubuntu:22.04

# 設定環境變數
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20.x
ENV NPM_CONFIG_PREFIX=/usr/local
ENV PM2_HOME=/var/log/pm2

# 更新系統並安裝必要的套件
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    software-properties-common \
    build-essential \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 全域安裝 PM2
RUN npm install -g pm2

# 設定工作目錄
WORKDIR /app

# 複製前端專案
COPY echo_debate_of_school_project/ ./frontend/

# 複製後端專案
COPY server/ ./backend/

# 安裝前端依賴並建置
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 安裝後端依賴
WORKDIR /app/backend
RUN npm install

# 創建 PM2 配置文件
RUN echo '{ \
  "apps": [ \
    { \
      "name": "frontend", \
      "script": "npx", \
      "args": "serve -s dist -l 3000", \
      "cwd": "/app/frontend", \
      "instances": 1, \
      "exec_mode": "fork" \
    }, \
    { \
      "name": "backend", \
      "script": "index.js", \
      "cwd": "/app/backend", \
      "instances": 1, \
      "exec_mode": "fork", \
      "env": { \
        "NODE_ENV": "production", \
        "PORT": "4000", \
        "DB_HOST": "35.221.147.151", \
        "DB_PORT": "5432", \
        "DB_USER": "postgres", \
        "DB_PASSWORD": "@Aa123456", \
        "DB_NAME": "linebot_v2", \
        "DB_SSL": "true", \
        "JWT_SECRET": "production-secret-key-2024" \
      } \
    } \
  ] \
}' > /app/ecosystem.config.js

# 安裝 serve 用於前端靜態文件服務
RUN npm install -g serve

# 暴露端口
EXPOSE 3000 4000

# 設定啟動腳本
RUN echo '#!/bin/bash\n\
echo "Starting services with PM2..."\n\
pm2 start /app/ecosystem.config.js\n\
pm2 logs --lines 1000' > /app/start.sh && chmod +x /app/start.sh

# 設定啟動命令
CMD ["/app/start.sh"]
