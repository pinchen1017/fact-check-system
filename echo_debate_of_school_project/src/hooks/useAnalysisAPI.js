import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, API_ENDPOINTS, createApiUrl, handleApiError } from '../config/api';

// 自定義Hook用於處理分析API
export const useAnalysisAPI = (runId, token) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 獲取初始數據
  const fetchInitialData = useCallback(async () => {
    if (!runId || !token) return;
    
    try {
      setError(null);
      const response = await fetch(createApiUrl(`${API_ENDPOINTS.RUN_DETAIL(runId)}?t=${token}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisData(data.analysisResult);
      setStatus(data.status);
      setProgress(data.progress * 100);
      
    } catch (err) {
      setError(err.message);
      console.error('獲取初始數據失敗:', err);
    }
  }, [runId, token]);

  // 建立SSE連接
  const connectSSE = useCallback(() => {
    if (!runId || !token) return;

    const eventSource = new EventSource(createApiUrl(`${API_ENDPOINTS.RUN_STREAM(runId)}?t=${token}`));
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE連接已建立');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到SSE更新:', data);
        
        setAnalysisData(data.analysisResult);
        setStatus(data.status);
        setProgress(data.progress * 100);
        
        // 如果狀態為完成，關閉連接
        if (data.status === 'done') {
          eventSource.close();
          setIsConnected(false);
        }
      } catch (err) {
        console.error('解析SSE數據失敗:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE連接錯誤:', err);
      setIsConnected(false);
      setError('實時更新連接失敗');
    };

    return eventSource;
  }, [runId, token]);

  // 創建新的分析任務
  const createAnalysis = useCallback(async (inputText) => {
    try {
      setError(null);
      setStatus('creating');
      
      const response = await fetch(createApiUrl(API_ENDPOINTS.RUNS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (err) {
      setError(err.message);
      console.error('創建分析任務失敗:', err);
      throw err;
    }
  }, []);

  // 初始化效果
  useEffect(() => {
    if (runId && token) {
      fetchInitialData();
      const eventSource = connectSSE();
      
      return () => {
        if (eventSource) {
          eventSource.close();
          setIsConnected(false);
        }
      };
    }
  }, [runId, token, fetchInitialData, connectSSE]);

  return {
    analysisData,
    status,
    progress,
    error,
    isConnected,
    createAnalysis,
    refetch: fetchInitialData
  };
};

// 工具函數：從URL參數中提取runId和token
export const extractParamsFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const runId = pathParts[pathParts.length - 1];
  const token = urlParams.get('t');
  
  return { runId, token };
};

// 工具函數：格式化分析結果
export const formatAnalysisResult = (data) => {
  if (!data) return null;
  
  return {
    newsCorrectness: data.newsCorrectness || '未知',
    ambiguityScore: data.ambiguityScore || 0,
    analysis: data.analysis || '分析中...',
    references: data.references || [],
    models: data.models || {},
    debate: data.debate || {
      prosecution: [],
      defense: [],
      judge: { verdict: '審理中...', confidence: 0 }
    }
  };
};
