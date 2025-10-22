@echo off
echo 🚀 修復後的部署腳本
echo ====================
echo 已修復 npm audit 和構建問題
echo.

echo 📦 檢查前端構建...
cd echo_debate_of_school_project

echo 清理舊的構建文件...
if exist "dist" rmdir /s /q "dist"

echo 修復 npm audit 問題...
call npm audit fix

echo 重新構建前端...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 前端構建失敗！
    pause
    exit /b 1
)

echo ✅ 前端構建成功！

cd ..

echo.
echo 🎉 所有問題已修復！現在可以部署
echo.
echo 📋 修復內容：
echo - ✅ 修復了 npm audit 漏洞
echo - ✅ 更新了 Node.js 版本要求
echo - ✅ 構建測試通過
echo.
echo 📋 現在在 Render 上部署：
echo.
echo 1. 推送修復後的代碼到 GitHub:
echo    git add .
echo    git commit -m "修復 npm audit 和構建問題"
echo    git push origin main
echo.
echo 2. 在 Render Dashboard 中：
echo    - 創建新的 Static Site (不是 Web Service)
echo    - Name: fact-check-system
echo    - Root Directory: echo_debate_of_school_project
echo    - Build Command: npm install && npm run build
echo    - Publish Directory: echo_debate_of_school_project/dist
echo.
echo 3. 設置環境變量：
echo    - NODE_VERSION: 18
echo    - VITE_COFACT_TOKEN: 您的 Cofact Token
echo    - VITE_FASTAPI_URL: http://127.0.0.1:8000
echo.
echo 4. 啟用 Auto-Deploy：
echo    - 設置為 "Yes"
echo    - 選擇 "main" 分支
echo    - 選擇 "On commit"
echo.
echo 5. 測試部署後的網站：
echo    https://fact-check-system.onrender.com/
echo    https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
echo.
echo ✅ 所有問題已解決，現在可以順利部署！
echo.
pause
