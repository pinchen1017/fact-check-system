// API 配置文件
// 根據環境自動選擇 API 端點

const getApiBaseUrl = () => {
  // 檢查是否在生產環境
  if (import.meta.env.PROD) {
    // 生產環境：使用 Render 部署的後端
    return import.meta.env.VITE_API_BASE_URL || 'https://fact-check-backend-xxxx.onrender.com/api';
  } else {
    // 開發環境：使用本地後端
    return 'http://localhost:3000/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API 端點配置
export const API_ENDPOINTS = {
  // 健康檢查
  HEALTH: '/health',
  
  // 訊息相關
  MESSAGES: '/messages',
  MESSAGE: '/message',
  
  // 分析相關 (如果後端有這些端點)
  RUNS: '/runs',
  RUN_STREAM: (runId) => `/runs/${runId}/stream`,
  RUN_DETAIL: (runId) => `/runs/${runId}`,
};

// 創建完整的 API URL
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// 預設的 fetch 配置
export const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// 錯誤處理函數
export const handleApiError = (error) => {
  console.error('API 錯誤:', error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return '無法連接到服務器，請檢查網路連接';
  }
  
  if (error.status === 404) {
    return '請求的資源不存在';
  }
  
  if (error.status === 500) {
    return '服務器內部錯誤';
  }
  
  return error.message || '未知錯誤';
};
