# 歷史查證功能說明

## 功能概述

歷史查證功能已整合到「熱門內容」頁面中，允許用戶查看自己之前的查證記錄，包括查詢內容、最終分數、時間戳等資訊，並以圖卡形式呈現。

## 功能特色

### 🎯 主要功能
- **歷史記錄查詢**: 根據用戶ID查詢所有歷史查證記錄
- **圖卡式展示**: 美觀的卡片式界面展示歷史記錄
- **統計摘要**: 顯示總查證次數、完成次數、平均可信度等統計資訊
- **詳細資訊**: 包含查詢內容、分數、狀態、法官判決等詳細資訊

### 📊 數據展示
- **查證狀態**: 已完成、分析中、等待中、失敗
- **可信度分數**: 高可信度(80%+)、中等可信度(60-80%)、低可信度(<60%)
- **法官判決**: 包含判決內容和信心度
- **模型判斷**: 顯示AI模型的判斷結果

## API端點

### 1. 獲取歷史記錄
```
GET /history/{user_id}
```

**回應格式:**
```json
{
  "status": "success",
  "user_id": "user",
  "total_records": 5,
  "records": [
    {
      "session_id": "uuid-string",
      "query": "查詢內容",
      "final_score": 85.5,
      "timestamp": "2024-01-01T12:00:00Z",
      "status": "done",
      "model_correctness": "部分正確",
      "judge_verdict": "法官判決內容",
      "judge_confidence": 90.0,
      "llm_correctness": {...},
      "slm_correctness": {...}
    }
  ]
}
```

### 2. 獲取摘要統計
```
GET /history/{user_id}/summary
```

**回應格式:**
```json
{
  "status": "success",
  "user_id": "user",
  "summary": {
    "total_sessions": 10,
    "completed_sessions": 8,
    "avg_credibility": 75.5,
    "last_activity": "2024-01-01T12:00:00Z"
  }
}
```

## 前端組件

### HistoryCheck.jsx
主要歷史查證頁面組件，包含：
- 載入狀態處理
- 錯誤處理
- 響應式設計
- 圖卡式展示

### 主要功能
- **自動載入**: 頁面載入時自動獲取歷史記錄
- **重新整理**: 手動重新載入數據
- **響應式設計**: 支援桌面和移動設備
- **狀態指示**: 清晰的載入和錯誤狀態

## 使用方式

### 1. 啟動後端服務
```bash
cd /path/to/project
python dbAPI.py
```

### 2. 啟動前端服務
```bash
cd echo_debate_of_school_project
npm run dev
```

### 3. 訪問歷史查證功能
- 在導航欄中點擊「熱門內容」
- 在熱門內容頁面中找到「我的歷史查證」區塊

## 數據庫結構

歷史查證功能使用現有的數據庫表：

### conversations 表
- `t`: 會話UUID
- `user_id`: 用戶ID
- `input_text`: 查詢內容
- `status`: 處理狀態
- `created_at`: 創建時間

### analysis_summary 表
- `conversation_t`: 關聯的會話UUID
- `credibility_percent`: 可信度百分比
- `model_final_correctness`: 模型最終判斷
- `judge_final_verdict`: 法官判決
- `judge_confidence`: 法官信心度
- `llm_correctness`: LLM判斷結果
- `slm_correctness`: SLM判斷結果

## 測試

### 測試API端點
```bash
python test_history_api.py
```

### 手動測試
1. 確保後端服務運行在 `http://127.0.0.1:8000`
2. 確保前端服務運行在 `http://localhost:5173`
3. 在瀏覽器中訪問歷史查證頁面
4. 檢查數據是否正確載入和顯示

## 樣式特色

### 視覺設計
- **漸層背景**: 美觀的漸層色彩
- **卡片設計**: 現代化的卡片式布局
- **狀態指示**: 清晰的顏色編碼狀態
- **響應式**: 支援各種螢幕尺寸

### 互動效果
- **懸停效果**: 卡片懸停時的動畫
- **載入動畫**: 優雅的載入指示器
- **錯誤處理**: 友好的錯誤訊息

## 注意事項

1. **用戶ID**: 目前使用預設的 "user" 作為測試用戶ID
2. **數據格式**: 確保數據庫中的數據格式正確
3. **CORS設定**: 確保API的CORS設定正確
4. **錯誤處理**: 網路錯誤時會顯示友好的錯誤訊息

## 未來改進

- [ ] 添加用戶認證系統
- [ ] 支援多用戶歷史記錄
- [ ] 添加搜索和篩選功能
- [ ] 添加數據導出功能
- [ ] 添加詳細的分析報告
