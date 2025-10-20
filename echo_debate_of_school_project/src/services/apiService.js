// API 服務文件
import { API_BASE_URL, API_ENDPOINTS, createApiUrl, handleApiError } from '../config/api';

// Session 相關 API
export const sessionAPI = {
  // 獲取用戶 session 資料
  async getUserSession(sessionId) {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.USER_SESSION(sessionId)));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('獲取 session 資料失敗:', error);
      throw handleApiError(error);
    }
  },

  // 本地 session 查詢
  async getLocalSession() {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.LOCAL_SESSION));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('本地 session 查詢失敗:', error);
      throw handleApiError(error);
    }
  }
};

// Cofact API 相關
export const cofactAPI = {
  // 查詢文本可信度
  async checkText(text) {
    try {
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.COFACT_CHECK)}?text=${encodeURIComponent(text)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cofact API 查詢失敗:', error);
      throw handleApiError(error);
    }
  }
};

// 通用 API 調用
export const apiService = {
  // 健康檢查
  async healthCheck() {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.HEALTH));
      return await response.json();
    } catch (error) {
      console.error('健康檢查失敗:', error);
      throw handleApiError(error);
    }
  },

  // 獲取訊息列表
  async getMessages(limit = 20) {
    try {
      const response = await fetch(`${createApiUrl(API_ENDPOINTS.MESSAGES)}?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('獲取訊息失敗:', error);
      throw handleApiError(error);
    }
  },

  // 發送訊息
  async sendMessage(user, message) {
    try {
      const response = await fetch(createApiUrl(API_ENDPOINTS.MESSAGE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('發送訊息失敗:', error);
      throw handleApiError(error);
    }
  }
};

// 導出所有 API 服務
export default {
  session: sessionAPI,
  cofact: cofactAPI,
  api: apiService
};
