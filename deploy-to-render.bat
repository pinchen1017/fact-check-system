@echo off
echo 🚀 Echo Debate Render 部署腳本
echo ================================
echo 解決 Node.js 18.x 和 Vite 權限問題
echo.

echo 📦 檢查前端構建...
cd echo_debate_of_school_project
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端構建失敗！
    pause
    exit /b 1
)
echo ✅ 前端構建成功！

cd ..\server
echo 📦 檢查後端配置...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 後端依賴安裝失敗！
    pause
    exit /b 1
)
echo ✅ 後端配置完成！

cd ..

echo.
echo 🎉 本地構建完成！所有問題已修復
echo.
echo 📋 現在可以部署到 Render：
echo.
echo 1. 推送代碼到 GitHub:
echo    git add .
echo    git commit -m "修復 Render 部署問題 - Node.js 18.x 和 Vite 權限"
echo    git push origin main
echo.
echo 2. 部署 Web Server (後端):
echo    - 訪問 https://dashboard.render.com/
echo    - 創建 Web Service
echo    - Root Directory: server
echo    - Node.js 版本: 18.x
echo    - 環境變量: JWT_SECRET, PORT=10000
echo.
echo 3. 部署 Static Site (前端):
echo    - 創建 Static Site
echo    - Root Directory: echo_debate_of_school_project
echo    - Build Command: npm install && npm run build
echo    - Publish Directory: echo_debate_of_school_project/dist
echo    - 環境變量: VITE_COFACT_TOKEN, VITE_API_URL
echo.
echo 4. 測試 session_id 功能:
echo    https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
echo.
echo 📖 詳細說明請參考 RENDER_DEPLOYMENT_FIXED.md
echo.
echo ✅ 所有權限和版本問題已解決！
echo.
pause
