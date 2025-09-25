@echo off
echo 🚀 Echo Debate Web Server 部署腳本
echo =====================================

echo 📦 檢查後端配置...
cd server

echo 檢查 package.json...
if not exist "package.json" (
    echo ❌ 錯誤：找不到 package.json
    pause
    exit /b 1
)

echo 檢查 index.js...
if not exist "index.js" (
    echo ❌ 錯誤：找不到 index.js
    pause
    exit /b 1
)

echo 安裝依賴...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗！
    pause
    exit /b 1
)

echo ✅ 後端配置檢查完成！

cd ..

echo.
echo 🎉 本地配置完成！現在可以部署到 Render
echo.
echo 📋 下一步操作：
echo.
echo 1. 推送代碼到 GitHub:
echo    git add .
echo    git commit -m "準備部署 Web Server"
echo    git push origin main
echo.
echo 2. 在 Render 上創建 Web Service:
echo    - 訪問 https://dashboard.render.com/
echo    - 點擊 "New +" → "Web Service"
echo    - 連接您的 GitHub 倉庫
echo    - 設置 Root Directory: server
echo    - 設置 Build Command: npm install
echo    - 設置 Start Command: npm start
echo.
echo 3. 設置環境變量:
echo    - JWT_SECRET: 自動生成
echo    - PORT: 10000
echo    - NODE_ENV: production
echo.
echo 4. 部署完成後測試:
echo    https://your-api-url.onrender.com/api/health
echo.
echo 📖 詳細說明請參考 WEB_SERVER_DEPLOYMENT.md
echo.
pause
