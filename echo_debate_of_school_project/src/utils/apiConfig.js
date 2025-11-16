// API 配置工具函數
// 統一管理所有 API URL，支持動態檢測環境

/**
 * 獲取後端 API 基礎 URL
 * 支持通過環境變數、URL 參數或自動檢測
 */
export const getBackendApiUrl = () => {
  // 優先級 1: 從全局配置讀取（由 config.js 設置）
  if (window.API_CONFIG?.BACKEND_API_URL) {
    return window.API_CONFIG.BACKEND_API_URL;
  }
  
  // 優先級 2: 從 URL 參數讀取（用於 ngrok 場景）
  const urlParams = new URLSearchParams(window.location.search);
  const backendUrl = urlParams.get('backend_url');
  if (backendUrl) {
    return backendUrl + (backendUrl.endsWith('/') ? '' : '/') + 'local-api';
  }
  
  // 優先級 3: 自動檢測
  const hostname = window.location.hostname;
  const isNgrok = hostname.includes('ngrok');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isNgrok) {
    // Ngrok 環境：嘗試使用後端 ngrok URL
    // 如果前端和後端使用不同的 ngrok tunnel，需要通過 URL 參數傳遞
    // 默認嘗試當前域名的不同端口（可能不工作）
    const currentOrigin = window.location.origin;
    // 如果知道後端 ngrok URL，可以在這裡設置
    // 或者通過 sessionStorage 存儲（由管理員設置）
    const storedBackendUrl = sessionStorage.getItem('backend_ngrok_url');
    if (storedBackendUrl) {
      return storedBackendUrl + '/local-api';
    }
    // 備用方案：使用當前域名
    return currentOrigin + '/local-api';
  } else if (isLocalhost) {
    // 本地開發環境
    return '/local-api';
  } else {
    // 生產環境或其他環境
    return window.location.origin + '/local-api';
  }
};

/**
 * 獲取 FastAPI 代理 URL
 */
export const getFastApiProxyUrl = () => {
  if (window.API_CONFIG?.FASTAPI_PROXY_URL) {
    return window.API_CONFIG.FASTAPI_PROXY_URL;
  }
  return '/api-proxy';
};

/**
 * 獲取 FastAPI 直接 URL（用於服務端調用）
 */
export const getFastApiDirectUrl = () => {
  if (window.API_CONFIG?.FASTAPI_DIRECT_URL) {
    return window.API_CONFIG.FASTAPI_DIRECT_URL;
  }
  return 'http://120.107.172.114:8080';
};

/**
 * 獲取後端 API 完整 URL（用於 SSE 等場景）
 */
export const getBackendApiFullUrl = (path = '') => {
  const baseUrl = getBackendApiUrl();
  // 移除路徑中的 /local-api 前綴（如果需要）
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (baseUrl.includes('/local-api')) {
    return baseUrl.replace('/local-api', '') + '/' + cleanPath;
  }
  return baseUrl + (baseUrl.endsWith('/') ? '' : '/') + cleanPath;
};

/**
 * 設置後端 Ngrok URL（用於動態配置）
 */
export const setBackendNgrokUrl = (url) => {
  sessionStorage.setItem('backend_ngrok_url', url);
  // 更新全局配置
  if (window.API_CONFIG) {
    window.API_CONFIG.BACKEND_API_URL = url + '/local-api';
  }
};

/**
 * 檢測當前環境
 */
export const getEnvironment = () => {
  const hostname = window.location.hostname;
  return {
    isNgrok: hostname.includes('ngrok'),
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isProduction: hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('ngrok'),
    hostname
  };
};

