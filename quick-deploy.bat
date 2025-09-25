@echo off
echo 🚀 Echo Debate 快速部署腳本
echo ================================

echo 📦 檢查本地構建...
cd echo_debate_of_school_project
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端構建失敗！
    pause
    exit /b 1
)
echo ✅ 前端構建成功！

cd ..\server
call npm install
if %errorlevel% neq 0 (
    echo ❌ 後端依賴安裝失敗！
    pause
    exit /b 1
)
echo ✅ 後端準備完成！

cd ..

echo.
echo 🎉 本地構建完成！現在可以部署到 Render
echo.
echo 📋 下一步操作：
echo 1. 推送代碼到 GitHub:
echo    git add .
echo    git commit -m "準備部署到 Render"
echo    git push origin main
echo.
echo 2. 在 Render 上創建兩個服務：
echo    - Static Site (前端): echo_debate_of_school_project
echo    - Web Service (後端): server
echo.
echo 3. 設置環境變量：
echo    前端: VITE_COFACT_TOKEN, VITE_API_URL, VITE_FASTAPI_URL
echo    後端: JWT_SECRET (自動生成), PORT=10000
echo.
echo 4. 測試 URL:
echo    https://your-frontend-url.onrender.com?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
echo.
echo 📖 詳細說明請參考 DEPLOYMENT_GUIDE.md
echo.
pause
