// API 輔助工具
import { API_BASE_URL } from '../config/api';

// 簡化的 API 調用函數
export const apiHelper = {
  // 獲取 session 資料
  async getSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api-proxy/apps/judge/users/user/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('獲取 session 資料失敗:', error);
      throw error;
    }
  },

  // 創建 session
  async createSession(sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api-proxy/apps/judge/users/user/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('創建 session 失敗:', error);
      throw error;
    }
  },

  // 多代理分析
  async multiAgentAnalysis(analysisData) {
    try {
      const response = await fetch(`${API_BASE_URL}/multi-agent-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('多代理分析失敗:', error);
      throw error;
    }
  },

  // 健康檢查
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('健康檢查失敗:', error);
      throw error;
    }
  }
};

export default apiHelper;
