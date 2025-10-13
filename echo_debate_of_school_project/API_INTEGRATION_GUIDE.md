# 網頁接後端API完整技術文檔

## 概述
本文檔詳細記錄了前端React應用與後端多agent API系統的完整集成過程，包括問題診斷、解決方案和最終實現。

## API端點信息
- **基礎URL**: `http://127.0.0.1:8000`
- **開發代理**: `/api-proxy` (通過Vite代理配置)
- **主要端點**:
  - Session創建: `POST /apps/judge/users/user/sessions`
  - Session查詢: `GET /apps/judge/users/user/sessions/{sessionId}`
  - 發送訊息: `POST /run`

## 1. 初始問題診斷

### 1.1 問題描述
- API回應顯示預設值而非實際數據
- Session創建成功但查詢失敗(404錯誤)
- Run端點調用失敗
- 數據提取邏輯不匹配實際API回應格式

### 1.2 根本原因分析
1. **CORS問題**: 瀏覽器直接調用跨域API被阻擋
2. **Session ID管理**: 創建和查詢使用不同的ID
3. **數據格式不匹配**: 處理邏輯期望數組格式，實際為對象格式
4. **API回應結構**: 實際回應包含`state`和`events`而非直接的數據

## 2. 解決方案實施

### 2.1 CORS問題解決
**問題**: 瀏覽器CORS政策阻擋直接API調用
```javascript
// 錯誤的直接調用
const response = await fetch('http://127.0.0.1:8000/apps/judge/users/user/sessions', {
  method: 'POST',
  // ... 會被CORS阻擋
});
```

**解決方案**: 使用Vite代理配置
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api-proxy': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      }
    }
  }
});

// 正確的代理調用
const response = await fetch('/api-proxy/apps/judge/users/user/sessions', {
  method: 'POST',
  // ... 通過代理，避免CORS問題
});
```

### 2.2 Session ID管理優化
**問題**: Session創建和查詢使用不同的ID
```javascript
// 問題代碼
const newSessionId = generateUUID();
// 創建時使用生成的ID
const createResponse = await createSession(newSessionId);
// 但API回應中可能返回不同的ID
const actualSessionId = createResponse.id; // 實際的ID
// 查詢時仍使用原始ID，導致404
```

**解決方案**: 使用API回應中的實際ID
```javascript
const createSession = async () => {
  const newSessionId = generateUUID();
  
  const response = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "appName": "judge",
      "userId": "user", 
      "sessionId": newSessionId
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    // 使用API回應中的實際ID
    const actualSessionId = data.id || newSessionId;
    return actualSessionId;
  }
};
```

### 2.3 API回應格式處理
**問題**: 處理邏輯不匹配實際API回應格式

**實際API回應格式**:
```json
{
  "id": "db931764-778a-4e02-aaf6-32e65136e993",
  "appName": "judge",
  "userId": "user",
  "state": {
    "curation_raw": "I am ready to handle your requests...",
    "curation": {
      "query": "用戶查詢內容",
      "results": []
    }
  },
  "events": [
    {
      "author": "curator_tool_runner",
      "actions": {
        "stateDelta": {
          "curation_raw": "處理結果"
        }
      }
    }
  ]
}
```

**解決方案**: 重寫數據處理邏輯
```javascript
const processMultiAgentResponse = (apiResponse, query) => {
  // 1. 檢查是否是session創建回應（空state和events）
  if (apiResponse.id && apiResponse.appName && apiResponse.userId && 
      (!apiResponse.state || Object.keys(apiResponse.state).length === 0) &&
      (!apiResponse.events || apiResponse.events.length === 0)) {
    return {
      weight_calculation_json: { /* 分析中狀態 */ },
      final_report_json: { /* 分析中狀態 */ },
      // ...
    };
  }

  // 2. 檢查state數據
  if (apiResponse.state && Object.keys(apiResponse.state).length > 0) {
    const stateData = apiResponse.state;
    const curationData = stateData.curation || {};
    const curationRaw = stateData.curation_raw || "";
    
    return {
      final_report_json: {
        topic: query,
        overall_assessment: curationRaw,
        jury_brief: curationRaw,
        evidence_digest: curationData.results ? 
          curationData.results.map(result => result.snippet || result) : 
          ["分析中..."]
      },
      // ...
    };
  }

  // 3. 檢查events數據
  if (apiResponse.events && apiResponse.events.length > 0) {
    let curationData = null;
    let curationRaw = null;
    
    // 從最新的event開始查找
    for (let i = apiResponse.events.length - 1; i >= 0; i--) {
      const event = apiResponse.events[i];
      if (event.actions && event.actions.stateDelta) {
        if (event.actions.stateDelta.curation && !curationData) {
          curationData = event.actions.stateDelta.curation;
        }
        if (event.actions.stateDelta.curation_raw && !curationRaw) {
          curationRaw = event.actions.stateDelta.curation_raw;
        }
      }
    }
    
    return {
      final_report_json: {
        overall_assessment: curationRaw || "分析中",
        jury_brief: curationRaw || "分析中",
        evidence_digest: curationData && curationData.results ? 
          curationData.results.map(result => result.snippet || result) : 
          ["分析中..."]
      },
      // ...
    };
  }
};
```

## 3. 完整實現流程

### 3.1 Session創建流程
```javascript
const performMultiAgentAnalysis = async (query) => {
  try {
    // 1. 創建新session
    console.log("正在創建新session...");
    const currentSessionId = await createSession();
    console.log("Session創建成功，ID:", currentSessionId);
    
    // 2. 更新全局session狀態
    setSessionId(currentSessionId);
    setIsSessionCreated(true);
    
    // 3. 等待session創建完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. 發送查詢訊息
    console.log("正在發送查詢訊息，使用session ID:", currentSessionId);
    const result = await sendMessage(query, currentSessionId);
    
    // 5. 處理API回應
    if (result) {
      const processedData = processMultiAgentResponse(result, query);
      return { raw: result, data: processedData };
    }
  } catch (error) {
    console.error("Multi-agent analysis failed:", error);
    return { raw: null, data: getDefaultAnalysisResult(query) };
  }
};
```

### 3.2 數據提取和映射
```javascript
// 從API回應中提取的關鍵數據映射
const dataMapping = {
  // 從 state.curation_raw 提取
  'final_report_json.overall_assessment': 'curation_raw',
  'final_report_json.jury_brief': 'curation_raw', 
  'fact_check_result_json.analysis': 'curation_raw',
  
  // 從 state.curation 提取
  'final_report_json.topic': 'curation.query',
  'final_report_json.evidence_digest': 'curation.results',
  
  // 從 events 中提取
  'events[].actions.stateDelta.curation_raw': '最新curation_raw',
  'events[].actions.stateDelta.curation': '最新curation數據'
};
```

## 4. 測試和調試

### 4.1 測試函數
```javascript
// Session創建測試
const testSessionCreation = async () => {
  const testSessionId = generateUUID();
  const sessionData = {
    "appName": "judge",
    "userId": "user", 
    "sessionId": testSessionId
  };
  
  const response = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  
  if (response.ok) {
    const data = await response.json();
    const actualSessionId = data.id || testSessionId;
    
    // 測試查詢
    const queryResponse = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions/${actualSessionId}`);
    console.log("查詢結果:", queryResponse.status);
  }
};

// API回應處理測試
const testApiResponseProcessing = async () => {
  const mockApiResponse = {
    // 使用實際的API回應格式
    "id": "db931764-778a-4e02-aaf6-32e65136e993",
    "state": {
      "curation_raw": "I am ready to handle your requests...",
      "curation": {
        "query": "測試查詢",
        "results": []
      }
    },
    "events": [/* 實際events數據 */]
  };
  
  const processedData = processMultiAgentResponse(mockApiResponse, "測試查詢");
  console.log("處理後的數據:", processedData);
};
```

### 4.2 調試工具
- **控制台日誌**: 詳細記錄每個步驟的執行情況
- **測試按鈕**: 提供多個測試功能驗證各個環節
- **錯誤處理**: 完整的錯誤捕獲和用戶友好的錯誤信息

## 5. 關鍵技術要點

### 5.1 代理配置的重要性
- **為什麼需要代理**: 瀏覽器CORS政策限制跨域請求
- **如何配置**: 在vite.config.js中設置proxy
- **注意事項**: 確保代理路徑正確映射

### 5.2 Session生命週期管理
- **創建**: 使用UUID生成，但使用API回應的實際ID
- **驗證**: 可選步驟，用於確認session存在
- **使用**: 在後續API調用中使用正確的session ID
- **清理**: 可選的session清理邏輯

### 5.3 數據結構適配
- **靈活性**: 支持多種API回應格式
- **容錯性**: 當數據不存在時提供合理的預設值
- **可擴展性**: 易於添加新的數據提取邏輯

## 6. 最佳實踐

### 6.1 錯誤處理
```javascript
try {
  const response = await fetch(url, options);
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const errorText = await response.text();
    throw new Error(`API調用失敗: ${response.status} - ${errorText}`);
  }
} catch (error) {
  console.error("API調用錯誤:", error);
  // 提供用戶友好的錯誤信息
  throw error;
}
```

### 6.2 狀態管理
```javascript
// 使用React state管理session狀態
const [sessionId, setSessionId] = useState(null);
const [isSessionCreated, setIsSessionCreated] = useState(false);

// 確保狀態同步
const createSession = async () => {
  const newSessionId = await createSessionAPI();
  setSessionId(newSessionId);
  setIsSessionCreated(true);
  return newSessionId;
};
```

### 6.3 調試和監控
```javascript
// 詳細的日誌記錄
console.log("Session創建請求:", { url, data });
console.log("Session創建回應:", { status, data });
console.log("使用的Session ID:", actualSessionId);
```

## 7. 常見問題和解決方案

### 7.1 CORS錯誤
**症狀**: `Access to fetch at '...' has been blocked by CORS policy`
**解決方案**: 使用代理配置，避免直接跨域調用

### 7.2 Session 404錯誤
**症狀**: `Session not found` 錯誤
**解決方案**: 確保使用API回應中的實際session ID

### 7.3 數據顯示為空
**症狀**: 界面顯示預設值而非實際數據
**解決方案**: 檢查數據提取邏輯，確保匹配實際API回應格式

### 7.4 代理配置問題
**症狀**: 代理請求失敗
**解決方案**: 檢查vite.config.js配置，確保路徑映射正確

## 8. 部署注意事項

### 8.1 生產環境配置
- 生產環境需要配置實際的CORS策略
- 可能需要使用不同的代理配置或直接API調用
- 確保API端點在生產環境中可訪問

### 8.2 環境變量
```javascript
// 使用環境變量管理不同環境的API URL
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://production-api.com'
  : 'http://127.0.0.1:8000';
```

## 9. 總結

本集成過程的關鍵成功因素：

1. **正確的代理配置**: 解決CORS問題
2. **準確的Session管理**: 使用API回應中的實際ID
3. **靈活的數據處理**: 適配實際的API回應格式
4. **完整的錯誤處理**: 提供用戶友好的錯誤信息
5. **詳細的調試工具**: 便於問題診斷和解決

通過這個完整的集成過程，前端應用現在能夠：
- 成功創建和管理session
- 正確調用多agent API
- 準確提取和顯示分析結果
- 提供良好的用戶體驗和錯誤處理

---

*文檔創建時間: 2024年*
*最後更新: 根據實際API集成過程*
