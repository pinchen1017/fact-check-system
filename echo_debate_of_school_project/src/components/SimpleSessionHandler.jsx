// 簡化的 Session 處理組件
import { useState } from 'react';

const SimpleSessionHandler = () => {
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 簡化的 API 調用
  const callAPI = async (endpoint, options = {}) => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 調用失敗:', error);
      throw error;
    }
  };

  // 測試後端連接
  const testBackendConnection = async () => {
    try {
      console.log('測試後端連接...');
      
      // 測試根路徑
      const rootResponse = await callAPI('https://fact-check-backend-vqvl.onrender.com/');
      console.log('根路徑響應:', rootResponse);
      
      // 測試健康檢查
      const healthResponse = await callAPI('https://fact-check-backend-vqvl.onrender.com/api/health');
      console.log('健康檢查響應:', healthResponse);
      
      // 測試資料庫連接
      const dbResponse = await callAPI('https://fact-check-backend-vqvl.onrender.com/api/db-test');
      console.log('資料庫測試響應:', dbResponse);
      
      return true;
    } catch (error) {
      console.error('後端連接測試失敗:', error);
      return false;
    }
  };

  // 查詢 Session
  const querySession = async (sessionId) => {
    try {
      console.log('查詢 Session:', sessionId);
      
      const endpoint = `https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/${sessionId}`;
      const data = await callAPI(endpoint);
      
      console.log('Session 查詢成功:', data);
      return data;
    } catch (error) {
      console.error('Session 查詢失敗:', error);
      throw error;
    }
  };

  // 創建 Session
  const createSession = async (sessionId) => {
    try {
      console.log('創建 Session:', sessionId);
      
      const endpoint = `https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions`;
      const sessionData = {
        appName: 'judge',
        userId: 'user',
        sessionId: sessionId
      };
      
      const data = await callAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      console.log('Session 創建成功:', data);
      return data;
    } catch (error) {
      console.error('Session 創建失敗:', error);
      throw error;
    }
  };

  // 多代理分析
  const multiAgentAnalysis = async () => {
    try {
      console.log('執行多代理分析...');
      
      const endpoint = `https://fact-check-backend-vqvl.onrender.com/api/multi-agent-analysis`;
      const data = await callAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      console.log('多代理分析成功:', data);
      return data;
    } catch (error) {
      console.error('多代理分析失敗:', error);
      throw error;
    }
  };

  // 處理 Session 查詢
  const handleSessionQuery = async () => {
    if (!sessionId.trim()) {
      alert('請輸入 Session ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 先測試後端連接
      const backendOk = await testBackendConnection();
      if (!backendOk) {
        throw new Error('後端連接失敗');
      }

      // 嘗試查詢 Session
      try {
        const sessionData = await querySession(sessionId);
        setResult({ type: 'session', data: sessionData });
      } catch (queryError) {
        console.log('Session 查詢失敗，嘗試創建新 Session');
        
        // 如果查詢失敗，嘗試創建新 Session
        try {
          const newSession = await createSession(sessionId);
          setResult({ type: 'created', data: newSession });
        } catch (createError) {
          throw new Error(`Session 查詢和創建都失敗: ${createError.message}`);
        }
      }

      // 執行多代理分析
      try {
        const analysisResult = await multiAgentAnalysis();
        setResult(prev => ({
          ...prev,
          analysis: analysisResult
        }));
      } catch (analysisError) {
        console.log('多代理分析失敗，但 Session 操作成功');
      }

    } catch (error) {
      setError(error.message);
      console.error('處理失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>簡化 Session 測試</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Session ID:
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="輸入 Session ID"
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSessionQuery}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '處理中...' : '查詢 Session'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>錯誤:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>結果:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SimpleSessionHandler;
