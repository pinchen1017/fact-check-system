// API 連接測試腳本
const testAPI = async () => {
  // 請將 YOUR_BACKEND_URL 替換為您的實際後端 URL
  const BACKEND_URL = 'https://fact-check-backend-vqvl.onrender.com';
  
  console.log('🔍 測試 API 連接...');
  console.log('後端 URL:', BACKEND_URL);
  
  try {
    // 測試根路徑
    console.log('\n1. 測試根路徑...');
    const rootResponse = await fetch(`${BACKEND_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ 根路徑響應:', rootData);
    
    // 測試健康檢查
    console.log('\n2. 測試健康檢查...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ 健康檢查響應:', healthData);
    
    // 測試 session 端點
    console.log('\n3. 測試 session 端點...');
    const sessionId = 'test-session-123';
    const sessionResponse = await fetch(`${BACKEND_URL}/api-proxy/apps/judge/users/user/sessions/${sessionId}`);
    const sessionData = await sessionResponse.json();
    console.log('✅ Session 響應:', sessionData);
    
    // 測試 Cofact API
    console.log('\n4. 測試 Cofact API...');
    const cofactResponse = await fetch(`${BACKEND_URL}/api/cofact/check?text=測試文本`);
    const cofactData = await cofactResponse.json();
    console.log('✅ Cofact API 響應:', cofactData);
    
    console.log('\n🎉 所有 API 測試通過！');
    
  } catch (error) {
    console.error('❌ API 測試失敗:', error);
  }
};

// 執行測試
testAPI();
