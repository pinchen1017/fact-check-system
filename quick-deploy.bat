@echo off
echo ========================================
echo 快速部署腳本 - 事實查核系統
echo ========================================

echo.
echo 步驟 1: 檢查必要文件...
if not exist "backend\main.py" (
    echo 錯誤: 找不到 backend\main.py
    pause
    exit /b 1
)

if not exist "echo_debate_of_school_project\package.json" (
    echo 錯誤: 找不到前端項目
    pause
    exit /b 1
)

echo 步驟 2: 準備後端部署...
cd backend
if not exist ".git" (
    echo 初始化 Git 倉庫...
    git init
    git add .
    git commit -m "Initial backend commit"
    echo 請手動設置 GitHub 遠端倉庫:
    echo git remote add origin https://github.com/pinchen1017/fact-check-system.git
    echo git push -u origin main
) else (
    echo 更新後端代碼...
    git add .
    git commit -m "第一次部署後端 for Render deployment"
    git push origin main
)
cd ..

echo.
echo 步驟 3: 準備前端部署...
cd echo_debate_of_school_project
if not exist ".env.local" (
    echo 創建環境變數文件...
    echo VITE_API_BASE_URL=https://fact-check-system-static.onrender.com/api > .env.local
    echo 請更新 .env.local 中的後端 URL
)

echo 更新前端代碼...
git add .
git commit -m "第一次部署前端 for Render deployment"
git push origin main
cd ..

echo.
echo ========================================
echo 部署準備完成！
echo ========================================
echo.
echo 接下來請手動執行以下步驟:
echo.
echo 1. 在 GitHub 上創建新倉庫: fact-check-backend
echo 2. 將 backend 資料夾推送到新倉庫
echo 3. 在 Render 上部署後端服務
echo 4. 獲取後端 URL 並更新前端環境變數
echo 5. 重新部署前端服務
echo.
echo 詳細步驟請參考: COMPLETE_DEPLOYMENT_GUIDE.md
echo.
pause
