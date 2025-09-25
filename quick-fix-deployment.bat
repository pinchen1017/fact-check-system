@echo off
echo 🔧 快速修復部署問題
echo ====================

echo 📦 檢查前端構建...
cd echo_debate_of_school_project

echo 清理舊的構建文件...
if exist "dist" rmdir /s /q "dist"

echo 重新構建...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 前端構建失敗！
    pause
    exit /b 1
)

echo ✅ 前端構建成功！

cd ..

echo.
echo 🎉 本地修復完成！
echo.
echo 📋 現在需要重新部署為 Static Site：
echo.
echo 1. 推送修復代碼到 GitHub:
echo    git add .
echo    git commit -m "修復部署配置 - 設置為 Static Site"
echo    git push origin main
echo.
echo 2. 在 Render Dashboard 中：
echo    - 刪除現有的 Web Service (如果需要的話)
echo    - 創建新的 Static Site
echo    - Name: fact-check-system
echo    - Root Directory: echo_debate_of_school_project
echo    - Build Command: npm install && npm run build
echo    - Publish Directory: echo_debate_of_school_project/dist
echo.
echo 3. 設置環境變量：
echo    - NODE_VERSION: 18
echo    - VITE_COFACT_TOKEN: 您的 Cofact Token
echo.
echo 4. 啟用 Auto-Deploy：
echo    - 設置為 "Yes"
echo    - 選擇 "main" 分支
echo.
echo 5. 測試修復後的網站：
echo    https://fact-check-system.onrender.com/
echo    https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
echo.
echo 📖 詳細說明請參考 DEPLOYMENT_FIX_GUIDE.md
echo.
echo ⚠️  重要：您需要部署 Static Site，不是 Web Service！
echo.
pause
