// 動態 API 配置
// 根據當前訪問域名自動檢測 API URL，支持 ngrok 環境

(function() {
  const isNgrok = window.location.hostname.includes('ngrok');
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // 從 URL 參數讀取後端 ngrok URL（如果提供）
  const urlParams = new URLSearchParams(window.location.search);
  const backendNgrokUrl = urlParams.get('backend_url');
  
  // 從 sessionStorage 讀取已保存的後端 URL
  const storedBackendUrl = sessionStorage.getItem('backend_ngrok_url') || backendNgrokUrl;
  
  let backendApiUrl = '';
  let fastApiProxyUrl = '';
  
  if (isNgrok) {
    // Ngrok 環境
    if (storedBackendUrl) {
      // 如果有明確的後端 URL，使用它
      backendApiUrl = storedBackendUrl.replace(/\/$/, '') + '/local-api';
    } else {
      // 否則嘗試從當前域名推斷（假設是同一 ngrok 實例的不同端口）
      const currentOrigin = window.location.origin;
      // 嘗試使用當前域名作為後端（移除端口號，添加 /local-api）
      // 注意：這可能不工作，因為前端和後端可能是不同的 ngrok tunnel
      backendApiUrl = currentOrigin.replace(/:\d+$/, '') + '/local-api';
    }
    // FastAPI 代理在 ngrok 環境中可能需要特殊處理
    // 如果 FastAPI 也通過 ngrok 暴露，需要在這裡設置
    fastApiProxyUrl = '/api-proxy';
  } else if (isLocalhost) {
    // 本地開發環境
    backendApiUrl = '/local-api';
    fastApiProxyUrl = '/api-proxy';
  } else {
    // 生產環境或其他環境
    backendApiUrl = window.location.origin + '/local-api';
    fastApiProxyUrl = '/api-proxy';
  }
  
  // 如果有新的後端 URL，保存到 sessionStorage
  if (backendNgrokUrl && !sessionStorage.getItem('backend_ngrok_url')) {
    sessionStorage.setItem('backend_ngrok_url', backendNgrokUrl);
  }
  
  // 導出到全局
  window.API_CONFIG = {
    BACKEND_API_URL: backendApiUrl,
    FASTAPI_PROXY_URL: fastApiProxyUrl,
    FASTAPI_DIRECT_URL: 'http://120.107.172.114:8080',
    IS_NGROK: isNgrok,
    IS_LOCAL: isLocalhost,
    BACKEND_NGROK_URL: storedBackendUrl || null
  };
  
  console.log('API Config loaded:', window.API_CONFIG);
  
  // 如果是 ngrok 環境且沒有後端 URL，在控制台提示
  if (isNgrok && !storedBackendUrl) {
    console.warn('Ngrok 環境檢測到，但未設置後端 URL。');
    console.warn('請通過 URL 參數設置：?backend_url=https://your-backend-ngrok-url.ngrok-free.app');
    console.warn('或使用 API：window.API_CONFIG.setBackendUrl(url)');
  }
})();

