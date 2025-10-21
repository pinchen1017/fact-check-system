// 後端端點測試腳本
const testBackendEndpoints = async () => {
  const BACKEND_URL = 'https://fact-check-backend-vqvl.onrender.com';
  
  console.log('🔍 測試後端端點...');
  console.log('後端 URL:', BACKEND_URL);
  
  const endpoints = [
    { name: '根路徑', url: `${BACKEND_URL}/` },
    { name: '健康檢查', url: `${BACKEND_URL}/api/health` },
    { name: '資料庫測試', url: `${BACKEND_URL}/api/db-test` },
    { name: 'Session 端點', url: `${BACKEND_URL}/api-proxy/apps/judge/users/user/sessions/test-session-123` },
    { name: 'Cofact API', url: `${BACKEND_URL}/api/cofact/check?text=測試文本` },
    { name: '訊息列表', url: `${BACKEND_URL}/api/messages` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 測試 ${endpoint.name}...`);
      console.log(`URL: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name} 成功:`, data);
      } else {
        console.log(`❌ ${endpoint.name} 失敗:`, response.status, data);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} 錯誤:`, error.message);
    }
  }
};

// 執行測試
testBackendEndpoints();
