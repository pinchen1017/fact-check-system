// API 測試頁面
import { useState } from 'react';

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // 測試 1: 後端根路徑
    try {
      addResult('後端根路徑', '開始', '測試中...');
      const response = await fetch('https://fact-check-backend-vqvl.onrender.com/');
      const data = await response.json();
      addResult('後端根路徑', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('後端根路徑', '失敗', error.message);
    }

    // 測試 2: 健康檢查
    try {
      addResult('健康檢查', '開始', '測試中...');
      const response = await fetch('https://fact-check-backend-vqvl.onrender.com/api/health');
      const data = await response.json();
      addResult('健康檢查', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('健康檢查', '失敗', error.message);
    }

    // 測試 3: 資料庫連接
    try {
      addResult('資料庫連接', '開始', '測試中...');
      const response = await fetch('https://fact-check-backend-vqvl.onrender.com/api/db-test');
      const data = await response.json();
      addResult('資料庫連接', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('資料庫連接', '失敗', error.message);
    }

    // 測試 4: Session 端點
    try {
      addResult('Session 端點', '開始', '測試中...');
      const sessionId = 'test-session-123';
      const response = await fetch(`https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/${sessionId}`);
      const data = await response.json();
      addResult('Session 端點', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('Session 端點', '失敗', error.message);
    }

    // 測試 5: 多代理分析
    try {
      addResult('多代理分析', '開始', '測試中...');
      const response = await fetch('https://fact-check-backend-vqvl.onrender.com/api/multi-agent-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      addResult('多代理分析', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('多代理分析', '失敗', error.message);
    }

    // 測試 6: Cofact API
    try {
      addResult('Cofact API', '開始', '測試中...');
      const response = await fetch('https://fact-check-backend-vqvl.onrender.com/api/cofact/check?text=測試文本');
      const data = await response.json();
      addResult('Cofact API', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('Cofact API', '失敗', error.message);
    }

    setIsLoading(false);
  };

  const testSessionQuery = async () => {
    const sessionId = prompt('請輸入 Session ID:');
    if (!sessionId) return;

    setIsLoading(true);
    addResult('Session 查詢', '開始', `查詢 Session ID: ${sessionId}`);

    try {
      const response = await fetch(`https://fact-check-backend-vqvl.onrender.com/api-proxy/apps/judge/users/user/sessions/${sessionId}`);
      const data = await response.json();
      addResult('Session 查詢', '成功', `狀態: ${response.status}`, data);
    } catch (error) {
      addResult('Session 查詢', '失敗', error.message);
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API 連接測試</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runAllTests}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? '測試中...' : '運行所有測試'}
        </button>

        <button
          onClick={testSessionQuery}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          測試 Session 查詢
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>測試結果:</h3>
        {testResults.length === 0 ? (
          <p>尚未運行測試</p>
        ) : (
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  borderRadius: '4px',
                  backgroundColor: result.status === '成功' ? '#d4edda' : 
                                 result.status === '失敗' ? '#f8d7da' : '#fff3cd',
                  border: `1px solid ${result.status === '成功' ? '#c3e6cb' : 
                                   result.status === '失敗' ? '#f5c6cb' : '#ffeaa7'}`
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {result.test} - {result.status} ({result.timestamp})
                </div>
                <div>{result.message}</div>
                {result.data && (
                  <details style={{ marginTop: '5px' }}>
                    <summary>查看數據</summary>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '5px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestPage;
