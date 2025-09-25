@echo off
echo 🔧 修復 Render 部署問題
echo ========================

echo 📦 重新構建前端...
cd echo_debate_of_school_project

echo 清理舊的構建文件...
if exist "dist" rmdir /s /q "dist"

echo 重新安裝依賴...
call npm install

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
echo 🎉 修復完成！現在可以推送更新
echo.
echo 📋 下一步操作：
echo.
echo 1. 推送修復到 GitHub:
echo    git add .
echo    git commit -m "修復 Render 部署問題 - 添加 homepage 和優化配置"
echo    git push origin main
echo.
echo 2. Render 會自動重新部署 (如果啟用了 Auto-Deploy)
echo    或手動觸發重新部署
echo.
echo 3. 測試修復後的網站:
echo    https://fact-check-system.onrender.com/?session_id=b19e3815-6cb8-4221-a273-3818d1c9f6cc
echo.
echo 📖 修復內容：
echo - 添加了 homepage 字段到 package.json
echo - 優化了 Vite 配置
echo - 確保 session_id 功能正常
echo.
pause
