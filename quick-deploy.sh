#!/bin/bash

# Echo Debate 專案快速部署腳本
echo "🚀 開始部署 Echo Debate 專案..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

echo "✅ Docker 環境檢查通過"

# 停止現有容器（如果有的話）
echo "🛑 停止現有容器..."
docker-compose down 2>/dev/null || true

# 清理舊的映像（可選）
echo "🧹 清理舊映像..."
docker system prune -f

# 建置新映像
echo "🔨 建置 Docker 映像..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ 建置失敗"
    exit 1
fi

echo "✅ 映像建置完成"

# 啟動服務
echo "🚀 啟動服務..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ 啟動失敗"
    exit 1
fi

echo "✅ 服務啟動完成"

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
docker-compose ps

# 檢查健康狀態
echo "🏥 檢查健康狀態..."
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ 後端 API 健康檢查通過"
else
    echo "⚠️  後端 API 健康檢查失敗"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服務健康檢查通過"
else
    echo "⚠️  前端服務健康檢查失敗"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 訪問地址："
echo "   前端: http://localhost:3000"
echo "   後端 API: http://localhost:4000/api/health"
echo ""
echo "📋 常用指令："
echo "   查看日誌: docker-compose logs -f"
echo "   停止服務: docker-compose down"
echo "   重啟服務: docker-compose restart"
echo "   進入容器: docker-compose exec echo-debate-app bash"
echo ""
