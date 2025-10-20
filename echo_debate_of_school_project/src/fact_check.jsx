import { useState, useEffect, useRef } from 'react'
import './css/fact_check.css'
import './css/header.css'
import './css/debateCourt.css'
import './css/llm.css'
import './css/slm.css'
import { BsNewspaper } from "react-icons/bs"
import { MdOutlineHistoryToggleOff } from "react-icons/md"
import { MdAnalytics } from "react-icons/md"
import { TbDeviceDesktopAnalytics } from "react-icons/tb"
import cofact from './assets/cofact.png'
import discuss_cofact from './assets/discuss_cofact.png'
import discuss from './assets/discuss.png'
import private_detective from './assets/private_detective.png'
import professor from './assets/professor.png'
import judge_character from './assets/judge.png'
const cofactToken = import.meta.env.VITE_COFACT_TOKEN;

// 隨機生成 36 位 UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 可信度評級函數
const getCredibilityLevel = (score) => {
  if (score === 1) return '完全可信';
  if (score < 1 && score >= 0.875) return '可信度極高';
  if (score < 0.875 && score >= 0.625) return '可信度高';
  if (score < 0.625 && score > 0.5) return '可信度稍高';
  if (score === 0.5) return '半信半疑';
  if (score < 0.5 && score >= 0.375) return '可信度稍低';
  if (score < 0.375 && score >= 0.125) return '可信度低';
  if (score < 0.125 && score > 0) return '可信度極低';
  if (score === 0) return '完全不可信';
  return '未知';
};

// 將 0~1 或 0~100 的分數正規化為 0~100 百分比字串
const normalizeScoreToPercent = (score) => {
  const n = typeof score === 'string' ? parseFloat(score) : score;
  if (isNaN(n)) return 50;
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, pct));
};

// 將n8n分數從1~-1區間轉換為1~0區間
const convertN8nScore = (score) => {
  return (score + 1) / 2;
};

// n8n陪審團評級函數
const getN8nVerdict = (score) => {
  // 處理字串類型的jury_score
  if (typeof score === 'string') {
    if (score === '正方') return '勝訴';
    if (score === '反方') return '敗訴';
    return '未知';
  }
  
  // 處理數值類型的score
  if (score > 0) return '勝訴';
  if (score < 0) return '敗訴';
  if (score === 0) return '無法判決';
  return '未知';
};

{/* FactCheck */ }
function FactCheck({ searchQuery, factChecks, setSearchQuery, onOpenAnalysis, onStartRealTimeAnalysis, analysisResult, setAnalysisResult }) {
  const [searchInput, setSearchInput] = useState(searchQuery || '')
  const [sessionIdInput, setSessionIdInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isCofactLoading, setIsCofactLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [isMultiAgentLoading, setIsMultiAgentLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isSessionCreated, setIsSessionCreated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('user')

  // 同步 searchQuery 和 searchInput
  useEffect(() => {
    setSearchInput(searchQuery || '')
  }, [searchQuery])

  // 透過 URL 參數自動帶入 session_id 並觸發搜尋
  const hasAutoLoadedFromUrl = useRef(false)
  const autoCreateOn404Ref = useRef(false)

  // 從後端 API 查詢 userId（含備援重試）
  const fetchUserIdBySession = async (sid) => {
    const tryOnce = async (url) => {
      try {
        const r = await fetch(url)
        if (!r.ok) return null
        const j = await r.json().catch(() => null)
        return j?.userId || j?.user_data?.id || null
      } catch {
        return null
      }
    }
    // 直接使用 session 端點
    console.log('嘗試從 session 端點獲取用戶資料')
    const uid = await tryOnce(`${proxyApiUrl}/apps/judge/users/user/sessions/${encodeURIComponent(sid)}`)
    return uid
  }
  useEffect(() => {
    if (hasAutoLoadedFromUrl.current) return
    try {
      const params = new URLSearchParams(window.location.search)
      let sidParam = params.get('session_id')
      // 檢查是否為有效的 session_id（不是字面值 'session_id'）
      if (sidParam && sidParam.trim() && sidParam !== 'session_id') {
        hasAutoLoadedFromUrl.current = true
        // 兼容網址帶入的引號或編碼(%27)
        try { sidParam = decodeURIComponent(sidParam) } catch {}
        let sid = sidParam.trim()
        if (sid.endsWith("'") || sid.endsWith('"')) sid = sid.slice(0, -1)
        if (sid.startsWith("'") || sid.startsWith('"')) sid = sid.slice(1)
        setSessionIdInput(sid)
        // 是否允許 404 時自動建立（需以 URL 帶 auto_create=true 才啟用）
        autoCreateOn404Ref.current = (params.get('auto_create') === 'true')
        // 先用 session_id 向本地 API 查 user_id（含備援），再以此登入後觸發 Session 搜尋
        fetchUserIdBySession(sid)
          .then((fetchedUserId) => {
            if (fetchedUserId) {
              setCurrentUserId(fetchedUserId)
              console.log('透過資料庫查到 userId:', fetchedUserId)
              // 直接使用查到的 userId，不等 state 更新
              handleSessionSearch(sid, fetchedUserId)
            } else {
              console.log('資料庫未查到 userId，改用當前使用者或預設 user')
              const userForQuery = currentUserId || 'user'
              handleSessionSearch(sid, userForQuery)
            }
          })
      } else if (sidParam === 'session_id') {
        console.log('檢測到字面值 session_id，跳過自動載入')
      }
    } catch (e) {
      console.log('解析 URL 參數失敗:', e?.message || e)
    }
  }, [])

  // 呼叫 Cofacts Agent API 取得相似查證
  const fetchCofactResult = async (query) => {
    const url = 'https://unknown4853458-cofacts-agent-rag.hf.space/agent/check_message'
    const headers = {
      'Authorization': cofactToken,
      'accept': 'application/json',
      'X-API-Key': 'CofactChecker123',
      'Content-Type': 'application/json',
    }
    const payload = {
      text: query,
      top_k: 5,
      jaccard_threshold: 0.0,
      use_api: true,
      use_hf: true,
      allow_llm: true,
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // 若非 2xx 也嘗試讀取內容
      const data = await resp.json().catch(() => null)

      // 預設值
      let found = false
      let correctness = '未知'
      let perspective = ''
      let cofactUrl = 'https://cofact.org/search?q=' + encodeURIComponent(query)

      if (data && typeof data === 'object') {
        // 依照提供之 API 回傳模板做欄位映射
        found = data?.found === true || false
        
        if (data?.answer && typeof data.answer.decision === 'boolean') {
          correctness = data.answer.decision ? '可信度極高' : '可信度極低'
        }
        if (Array.isArray(data?.hits) && data.hits.length > 0) {
          perspective = data.hits[0]?.text || ''
        }
        if (!perspective) {
          perspective = data?.text || data?.analysis || ''
        }

        // cofactUrl = references[0] -> 其次 match_url -> 最後搜尋頁
        if (Array.isArray(data?.answer?.references) && data.answer.references.length > 0) {
          cofactUrl = data.answer.references[0]
        } else if (data?.answer?.match_url) {
          cofactUrl = data.answer.match_url
        }

        // 後備邏輯（若欄位缺漏）：
        if (!found) {
          const candidates = [
            Array.isArray(data?.results) ? data.results : null,
            Array.isArray(data?.matches) ? data.matches : null,
            Array.isArray(data?.search_results) ? data.search_results : null,
            Array.isArray(data?.top_k_results) ? data.top_k_results : null,
          ].filter(Boolean)
          found = (candidates.length > 0 && candidates.some(arr => arr.length > 0)) || data?.found === true
        }
        if (correctness === '未知') {
          const label = data?.classification_json?.classification || data?.classification || data?.label || data?.verdict
          const prob = parseFloat(data?.classification_json?.Probability) || data?.probability || data?.score
          const finalScore = typeof data?.weight_calculation_json?.final_score === 'number' ? data.weight_calculation_json.final_score : undefined
          if (label) {
            if (label.includes('正確') || label.includes('真實')) correctness = getCredibilityLevel(0.9)
            else if (label.includes('錯誤') || label.includes('不實')) correctness = getCredibilityLevel(0.1)
            else correctness = '混合'
          } else if (typeof finalScore === 'number') {
            correctness = getCredibilityLevel(finalScore)
          } else if (!isNaN(prob)) {
            correctness = getCredibilityLevel(prob)
          }
        }
      }

      return { found, correctness, perspective, cofactUrl }
    } catch (e) {
      // 失敗則視為未找到，避免中斷整體分析
      return { found: false, correctness: '未知', perspective: '', cofactUrl: 'https://cofact.org/search?q=' + encodeURIComponent(query) }
    }
  }

  // 多agent API相關函數
  const apiUrl = 'https://fact-check-backend-vqvl.onrender.com/api'; // 使用新的後端 API
  const proxyApiUrl = 'https://fact-check-backend-vqvl.onrender.com/api-proxy'; // 使用新的後端代理
  
  // 簡化的 API 調用函數
  const simpleApiCall = async (endpoint, options = {}) => {
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


  // 手動測試API連接函數
  const testApiConnection = async () => {
    console.log("=== 開始手動API連接測試 ===");
    
    // 測試1: 直接API連接
    console.log("測試1: 直接API連接");
    try {
      const directResponse = await fetch(`${apiUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`直接API回應狀態: ${directResponse.status}`);
      console.log(`直接API回應headers:`, Object.fromEntries(directResponse.headers.entries()));
    } catch (error) {
      console.log(`直接API錯誤: ${error.message}`);
    }
    
    // 測試2: 代理連接
    console.log("測試2: 代理連接");
    try {
      const proxyResponse = await fetch(`${proxyApiUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`代理連接狀態: ${proxyResponse.status}`);
    } catch (error) {
      console.log(`代理連接錯誤: ${error.message}`);
    }
    
    // 測試3: Session創建端點（使用代理）
    console.log("測試3: Session創建端點（使用代理）");
    try {
      const sessionData = {
        "appName": "judge",
        "userId": "user",
        "sessionId": generateUUID()
      };
      
      const sessionResponse = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      console.log(`Session創建回應狀態: ${sessionResponse.status}`);
      console.log(`Session創建回應headers:`, Object.fromEntries(sessionResponse.headers.entries()));
      
      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.log(`Session創建錯誤內容: ${errorText}`);
      } else {
        console.log("Session創建端點測試成功！");
      }
    } catch (error) {
      console.log(`Session創建錯誤: ${error.message}`);
    }
    
    console.log("=== API連接測試完成 ===");
  };

  // 測試Session查詢函數
  const testSessionQuery = async () => {
    console.log("=== 開始Session查詢測試 ===");
    
    // 先創建一個session
    const testSessionId = generateUUID();
    console.log("創建測試session，ID:", testSessionId);
    
    try {
      // 嘗試創建session
      const sessionData = {
        "appName": "judge",
        "userId": "user",
        "sessionId": testSessionId
      };
      
      const createResponse = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      console.log(`Session創建回應狀態: ${createResponse.status}`);
      
      if (createResponse.ok) {
        console.log("Session創建成功，開始查詢測試...");
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 測試查詢
        const verifyResult = await verifySession(testSessionId);
        console.log("Session查詢結果:", verifyResult);
      } else {
        console.log("Session創建失敗");
      }
    } catch (error) {
      console.log("Session查詢測試錯誤:", error.message);
    }
    
    console.log("=== Session查詢測試完成 ===");
  };


  // 測試現有Session函數
  const testExistingSession = async () => {
    console.log("=== 測試現有Session ===");
    
    // 使用您提到的現有session ID
    const existingSessionId = "e5cf73eb-50cc-411f-bd97-0d79256fcb9f";
    console.log("測試現有session ID:", existingSessionId);
    
    try {
      // 直接查詢這個session
      const endpoint = `${proxyApiUrl}/apps/judge/users/${currentUserId || 'user'}/sessions/${existingSessionId}`;
      console.log(`查詢現有session端點: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`現有session查詢回應狀態: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("現有session查詢成功:", data);
        
        // 嘗試使用這個session發送訊息
        console.log("嘗試使用現有session發送測試訊息...");
        const testMessage = "測試訊息";
        const messageData = {
          "appName": "judge",
          "userId": "user",
          "sessionId": existingSessionId,
          "newMessage": {
            "role": "user",
            "parts": [{"text": testMessage}]
          },
          "streaming": false
        };
        
        const runResponse = await fetch(`${proxyApiUrl}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
        
        console.log(`Run端點回應狀態: ${runResponse.status}`);
        if (runResponse.ok) {
          const runData = await runResponse.json();
          console.log("使用現有session發送訊息成功:", runData);
        } else {
          const errorText = await runResponse.text();
          console.log(`Run端點失敗，狀態: ${runResponse.status}`);
          console.log(`錯誤內容: ${errorText}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`現有session查詢失敗，狀態: ${response.status}`);
        console.log(`錯誤內容: ${errorText}`);
      }
    } catch (error) {
      console.log("測試現有session錯誤:", error.message);
    }
    
    console.log("=== 測試現有Session完成 ===");
  };

  // 顯示當前Session狀態函數
  const showCurrentSessionStatus = () => {
    console.log("=== 當前Session狀態 ===");
    console.log("Session ID:", sessionId);
    console.log("Session是否已創建:", isSessionCreated);
    console.log("=== Session狀態顯示完成 ===");
  };

  // 測試Session創建函數
  const testSessionCreation = async () => {
    console.log("=== 開始測試Session創建 ===");
    
    // 生成新的session ID
    const testSessionId = generateUUID();
    console.log("生成的測試Session ID:", testSessionId);
    
    try {
      // 嘗試創建session
      const sessionUrl = `${proxyApiUrl}/apps/judge/users/${currentUserId || 'user'}/sessions`;
      const sessionData = {
        "appName": "judge",
        "userId": "user",
        "sessionId": testSessionId
      };
      
      console.log("創建Session請求:");
      console.log("URL:", sessionUrl);
      console.log("數據:", JSON.stringify(sessionData, null, 2));
      
      const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      console.log(`Session創建回應狀態: ${response.status}`);
      console.log(`Session創建回應headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Session創建成功!");
        console.log("回應數據:", data);
        
        // 使用回應中的實際session ID
        const actualSessionId = data.id || testSessionId;
        console.log("使用的Session ID:", actualSessionId);
        console.log("原始生成的Session ID:", testSessionId);
        
        // 等待一下然後查詢session
        console.log("等待2秒後查詢session...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 查詢剛創建的session（使用實際的session ID）
        const queryUrl = `${proxyApiUrl}/apps/judge/users/user/sessions/${actualSessionId}`;
        console.log("查詢Session URL:", queryUrl);
        
        const queryResponse = await fetch(queryUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`Session查詢回應狀態: ${queryResponse.status}`);
        
        if (queryResponse.ok) {
          const queryData = await queryResponse.json();
          console.log("✅ Session查詢成功!");
          console.log("查詢結果:", queryData);
        } else {
          const errorText = await queryResponse.text();
          console.log("❌ Session查詢失敗");
          console.log("錯誤內容:", errorText);
        }
        
      } else {
        const errorText = await response.text();
        console.log("❌ Session創建失敗");
        console.log("錯誤內容:", errorText);
      }
    } catch (error) {
      console.log("❌ Session創建錯誤:", error.message);
    }
    
    console.log("=== Session創建測試完成 ===");
  };


  // 獲取預設分析結果函數
  const getDefaultAnalysisResult = (query) => {
    return {
      weight_calculation_json: {
        llm_score: 0.5,
        slm_score: 0.5,
        jury_score: 0.5,
        verdict_result: 0.5,
        llm_label: '分析中'
      },
      final_report_json: {
        jury_brief: '分析中',
        overall_assessment: '正在進行分析...',
        evidence_digest: ['分析中...']
      },
      fact_check_result_json: {
        analysis: '正在進行事實查核分析...'
      },
      classification_json: {
        classification: '分析中',
        Probability: '0.5'
      }
    };
  };

  // 儲存 session 記錄到資料庫的函數
  const saveSessionToDatabase = async (userId, sessionId) => {
    try {
      console.log("正在儲存 session 記錄到資料庫...");
      console.log(`User ID: ${userId}, Session ID: ${sessionId}`);
      
      // 先嘗試呼叫本地專用儲存端點（Node 直連 Cloud SQL）
      try {
        const saveUrl = `/local-api/save_session_record`;
        const savePayload = { userId, sessionId };
        console.log("嘗試呼叫專用儲存端點:", saveUrl, savePayload);
        const saveResp = await fetch(saveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload),
        });
        const saveText = await saveResp.text().catch(() => '');
        console.log("專用端點回應狀態:", saveResp.status, "內容:", saveText);
        if (saveResp.ok) {
          console.log("✅ Session 記錄已儲存到資料庫(專用端點)");
          return true;
        }
      } catch (e) {
        console.log("專用儲存端點不可用，改用後備方案(/run)");
      }

      // 後備方案：調用 run 端點，附上 role 以符合後端期望
      const runUrl = `${proxyApiUrl}/run`;
      const runData = {
        "appName": "judge",
        "userId": userId,
        "sessionId": sessionId,
        "newMessage": {
          "role": "user",
          "parts": [{ "text": "初始化 session（僅用於儲存資料紀錄）" }]
        },
        "streaming": false
      };
      
      console.log("調用 run 端點作為後備以觸發 session 記錄儲存...");
      const response = await fetch(runUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runData),
      });
      const respText = await response.text().catch(() => '');
      console.log("後備 /run 回應狀態:", response.status, "內容:", respText);
      if (response.ok) {
        console.log("✅ Session 記錄已儲存到資料庫(/run 後備)");
        return true;
      }
      console.log("❌ Session 記錄儲存失敗:", response.status);
      return false;
    } catch (error) {
      console.error("❌ 儲存 session 記錄時發生錯誤:", error);
      return false;
    }
  };

  // 創建 Session 函數
  const createSession = async (overrideSessionId) => {
    const newSessionId = overrideSessionId || generateUUID();
    console.log("正在創建新session，ID:", newSessionId);
    
    try {
      // 使用成功的session創建方法
      const sessionUrl = `${proxyApiUrl}/apps/judge/users/user/sessions`;
      const sessionData = {
        "appName": "judge",
        "userId": currentUserId || "user",
        "sessionId": newSessionId
      };
      
      console.log(`創建session，URL: ${sessionUrl}`);
      console.log("Session數據:", sessionData);
      
      const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      console.log(`Session創建回應狀態: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Session創建成功:", data);
        // 使用回應中的實際session ID，如果沒有則使用生成的ID
        const actualSessionId = data.id || newSessionId;
        console.log("返回的Session ID:", actualSessionId);
        
        return actualSessionId;
      } else {
        const errorText = await response.text();
        console.log(`Session創建失敗，狀態: ${response.status}`);
        console.log(`錯誤內容: ${errorText}`);
        throw new Error(`Session創建失敗: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Session創建錯誤:", error);
      throw error;
    }
  };

  // 發送訊息函數
  const sendMessage = async (query, currentSessionId) => {
    const messageData = {
      "appName": "judge",
      "userId": currentUserId || "user",
      "sessionId": currentSessionId,
      "newMessage": {
        "role": "user",
        "parts": [{"text": query}]
      },
      "streaming": false
    };

    try {
      // 使用成功的run端點
      const messageUrl = `${proxyApiUrl}/run`;
      console.log(`發送訊息到run端點，URL: ${messageUrl}`);
      console.log("訊息數據:", messageData);
      console.log("使用的session ID:", currentSessionId);
      
      const response = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      console.log(`Run端點回應狀態: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Message sent successfully:", data);
        return data;
      } else {
        const errorText = await response.text();
        console.log(`Run端點失敗，狀態: ${response.status}`);
        console.log(`錯誤內容: ${errorText}`);
        throw new Error(`Run端點失敗: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("發送訊息錯誤:", error);
      throw error;
    }
  };

  // 處理多agent API回應格式
  const processMultiAgentResponse = (apiResponse, query) => {
    console.log("處理API回應:", apiResponse);
    
    if (!apiResponse) {
      console.log("API回應為空");
      return null;
    }

    // 檢查是否是session創建回應（還沒有分析結果）
    if (apiResponse.id && apiResponse.appName && apiResponse.userId && 
        (!apiResponse.state || Object.keys(apiResponse.state).length === 0) &&
        (!apiResponse.events || apiResponse.events.length === 0)) {
      console.log("這是session創建回應，還沒有分析結果");
      return {
        weight_calculation_json: {
          llm_label: "分析中",
          llm_score: 0.5,
          slm_score: 0.5,
          jury_score: "分析中",
          final_score: 0.5
        },
        final_report_json: {
          topic: query,
          overall_assessment: "正在進行多agent分析...",
          jury_score: 50,
          jury_brief: "分析進行中，請稍候",
          evidence_digest: ["分析進行中..."],
          stake_summaries: []
        },
        fact_check_result_json: {
          analysis: "正在進行事實查核分析...",
          classification: "分析中"
        },
        classification_json: {
          Probability: "0.5",
          classification: "分析中"
        }
      };
    }

    // 檢查是否有state數據
    if (apiResponse.state && Object.keys(apiResponse.state).length > 0) {
      console.log("找到state數據:", apiResponse.state);
      const stateData = apiResponse.state;
      
      // 從state中提取curation數據
      const curationData = stateData.curation || {};
      const curationRaw = stateData.curation_raw || "";
      
      // 提取groundingChunks數據
      let groundingChunks = [];
      if (stateData.groundingMetadata && stateData.groundingMetadata.groundingChunks) {
        groundingChunks = stateData.groundingMetadata.groundingChunks;
      }
      
      console.log("curation數據:", curationData);
      console.log("curation_raw:", curationRaw);
      console.log("groundingChunks:", groundingChunks);
      
      // 從分類結果中提取新聞正確性
      const classification = stateData.classification_json || {};
      const newsCorrectness = classification.classification === "錯誤" ? "低" : 
                             classification.classification === "正確" ? "高" : 
                             classification.classification === "部分正確" ? "中" : "中";
      
      // 從權重計算中提取可信度分數
      const weightCalc = stateData.weight_calculation_json || {};
      const ambiguityScore = normalizeScoreToPercent(weightCalc.final_score ?? 50).toFixed(2);
      
      return {
        weight_calculation_json: stateData.weight_calculation_json || {
          llm_label: "分析中",
          llm_score: 0.5,
          slm_score: 0.5,
          jury_score: "分析中",
          final_score: 0.5
        },
        final_report_json: stateData.final_report_json || {
          topic: query,
          overall_assessment: curationRaw || "正在進行多agent分析...",
          jury_score: 50,
          jury_brief: curationRaw || "分析進行中",
          evidence_digest: curationData.results ? curationData.results.map(result => {
            if (typeof result === 'string') return result;
            if (result.snippet) return result.snippet;
            if (result.url) return `${result.snippet || result.text || result} (來源: ${result.url})`;
            return result.snippet || result.text || result;
          }) : ["分析進行中..."],
          stake_summaries: []
        },
        fact_check_result_json: stateData.fact_check_result_json || {
          analysis: curationRaw || "正在進行事實查核分析...",
          classification: "分析中"
        },
        classification_json: stateData.classification_json || {
          Probability: "0.5",
          classification: "分析中"
        },
        newsCorrectness: newsCorrectness,
        ambiguityScore: ambiguityScore,
        curationData: curationData,
        groundingChunks: groundingChunks
      };
    }

    // 檢查是否是 /run 端點返回的數組格式
    if (Array.isArray(apiResponse)) {
      console.log("檢測到 /run 端點返回的數組格式，正在解析...");
      
      // 從數組中提取各個組件的數據
      let weightCalculationData = null;
      let finalReportData = null;
      let factCheckData = null;
      let classificationData = null;
      let curationData = null;
      let curationRaw = null;
      let groundingChunks = [];

      // 從最新的event開始查找
      for (let i = apiResponse.length - 1; i >= 0; i--) {
        const event = apiResponse[i];
        console.log(`檢查event ${i}, author: ${event.author}:`, event);
        
        if (event.actions && event.actions.stateDelta) {
          if (event.actions.stateDelta.weight_calculation_json && !weightCalculationData) {
            weightCalculationData = event.actions.stateDelta.weight_calculation_json;
            console.log("找到weight_calculation_json:", weightCalculationData);
          }
          if (event.actions.stateDelta.final_report_json && !finalReportData) {
            finalReportData = event.actions.stateDelta.final_report_json;
            console.log("找到final_report_json:", finalReportData);
          }
          if (event.actions.stateDelta.fact_check_result_json && !factCheckData) {
            factCheckData = event.actions.stateDelta.fact_check_result_json;
            console.log("找到fact_check_result_json:", factCheckData);
          }
          if (event.actions.stateDelta.classification_json && !classificationData) {
            classificationData = event.actions.stateDelta.classification_json;
            console.log("找到classification_json:", classificationData);
          }
          if (event.actions.stateDelta.curation && !curationData) {
            curationData = event.actions.stateDelta.curation;
            console.log("找到curation:", curationData);
          }
          if (event.actions.stateDelta.curation_raw && !curationRaw) {
            curationRaw = event.actions.stateDelta.curation_raw;
            console.log("找到curation_raw:", curationRaw);
          }
          if (event.actions.stateDelta.groundingMetadata && event.actions.stateDelta.groundingMetadata.groundingChunks && groundingChunks.length === 0) {
            groundingChunks = event.actions.stateDelta.groundingMetadata.groundingChunks;
            console.log("找到groundingChunks:", groundingChunks);
          }
        }
      }

      // 從權重計算中提取可信度分數
      const ambiguityScore = normalizeScoreToPercent(weightCalculationData?.final_score ?? 50).toFixed(2);
      
      // 從分類結果中提取新聞正確性
      const newsCorrectness = classificationData?.classification === "錯誤" ? "低" : 
                             classificationData?.classification === "正確" ? "高" : 
                             classificationData?.classification === "部分正確" ? "中" : "中";

      return {
        weight_calculation_json: weightCalculationData || {
          llm_label: "分析中",
          llm_score: 0.5,
          slm_score: 0.5,
          jury_score: "分析中",
          final_score: 0.5
        },
        final_report_json: finalReportData || {
          topic: query,
          overall_assessment: curationRaw || "分析中",
          jury_score: 50,
          jury_brief: curationRaw || "分析中",
          evidence_digest: curationData && curationData.results ? curationData.results.map(result => {
            if (typeof result === 'string') return result;
            if (result.snippet) return result.snippet;
            if (result.url) return `${result.snippet || result.text || result} (來源: ${result.url})`;
            return result.snippet || result.text || result;
          }) : ["分析中..."],
          stake_summaries: []
        },
        fact_check_result_json: factCheckData || {
          analysis: curationRaw || "分析中",
          classification: "分析中"
        },
        classification_json: classificationData || {
          Probability: "0.5",
          classification: "分析中"
        },
        newsCorrectness: newsCorrectness,
        ambiguityScore: ambiguityScore,
        curationData: curationData,
        groundingChunks: groundingChunks
      };
    }

    // 檢查是否有events數據
    if (apiResponse.events && apiResponse.events.length > 0) {
      console.log("找到events數據:", apiResponse.events);
      
      // 從events中提取數據
      let weightCalculationData = null;
      let finalReportData = null;
      let factCheckData = null;
      let classificationData = null;
      let curationData = null;
      let curationRaw = null;

      // 從最新的event開始查找
      for (let i = apiResponse.events.length - 1; i >= 0; i--) {
        const event = apiResponse.events[i];
        console.log(`檢查event ${i}, author: ${event.author}:`, event);
        
        if (event.actions && event.actions.stateDelta) {
          if (event.actions.stateDelta.weight_calculation_json && !weightCalculationData) {
            weightCalculationData = event.actions.stateDelta.weight_calculation_json;
            console.log("找到weight_calculation_json:", weightCalculationData);
          }
          if (event.actions.stateDelta.final_report_json && !finalReportData) {
            finalReportData = event.actions.stateDelta.final_report_json;
            console.log("找到final_report_json:", finalReportData);
          }
          if (event.actions.stateDelta.fact_check_result_json && !factCheckData) {
            factCheckData = event.actions.stateDelta.fact_check_result_json;
            console.log("找到fact_check_result_json:", factCheckData);
          }
          if (event.actions.stateDelta.classification_json && !classificationData) {
            classificationData = event.actions.stateDelta.classification_json;
            console.log("找到classification_json:", classificationData);
          }
          if (event.actions.stateDelta.curation && !curationData) {
            curationData = event.actions.stateDelta.curation;
            console.log("找到curation:", curationData);
          }
          if (event.actions.stateDelta.curation_raw && !curationRaw) {
            curationRaw = event.actions.stateDelta.curation_raw;
            console.log("找到curation_raw:", curationRaw);
          }
          if (event.actions.stateDelta.groundingMetadata && event.actions.stateDelta.groundingMetadata.groundingChunks && groundingChunks.length === 0) {
            groundingChunks = event.actions.stateDelta.groundingMetadata.groundingChunks;
            console.log("找到groundingChunks:", groundingChunks);
          }
        }
      }

      return {
        weight_calculation_json: weightCalculationData || {
          llm_label: "分析中",
          llm_score: 0.5,
          slm_score: 0.5,
          jury_score: "分析中",
          final_score: 0.5
        },
        final_report_json: finalReportData || {
          topic: query,
          overall_assessment: curationRaw || "分析中",
          jury_score: 50,
          jury_brief: curationRaw || "分析中",
          evidence_digest: curationData && curationData.results ? curationData.results.map(result => {
            if (typeof result === 'string') return result;
            if (result.snippet) return result.snippet;
            if (result.url) return `${result.snippet || result.text || result} (來源: ${result.url})`;
            return result.snippet || result.text || result;
          }) : ["分析中..."],
          stake_summaries: []
        },
        fact_check_result_json: factCheckData || {
          analysis: curationRaw || "分析中",
          classification: "分析中"
        },
        classification_json: classificationData || {
          Probability: "0.5",
          classification: "分析中"
        },
        curationData: curationData,
        groundingChunks: groundingChunks
      };
    }

    // 如果都沒有找到數據，返回預設值
    console.log("未找到有效的分析數據，返回預設值");
    return {
      weight_calculation_json: {
        llm_label: "無數據",
        llm_score: 0.5,
        slm_score: 0.5,
        jury_score: "無數據",
        final_score: 0.5
      },
      final_report_json: {
        topic: query,
        overall_assessment: "暫無分析結果",
        jury_score: 50,
        jury_brief: "暫無判決資料",
        evidence_digest: ["暫無資料"],
        stake_summaries: []
      },
      fact_check_result_json: {
        analysis: "暫無分析結果",
        classification: "無數據"
      },
      classification_json: {
        Probability: "0.5",
        classification: "無數據"
      },
      newsCorrectness: "中",
      ambiguityScore: 50
    };
  };

  // Session驗證函數
  const verifySession = async (sessionId) => {
    console.log("驗證Session是否存在，ID:", sessionId);
    
    try {
      // 使用正確的session查詢端點
      const endpoint = `${proxyApiUrl}/apps/judge/users/user/sessions/${sessionId}`;
      console.log(`查詢session端點: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Session查詢回應狀態: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Session驗證成功:", data);
        return true;
      } else {
        const errorText = await response.text();
        console.log(`Session查詢失敗，狀態: ${response.status}`);
        console.log(`錯誤內容: ${errorText}`);
        
        // 如果查詢失敗，嘗試列出所有sessions來檢查是否存在
        console.log("嘗試列出所有sessions來檢查...");
        const listResponse = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (listResponse.ok) {
          const sessions = await listResponse.json();
          console.log("所有sessions:", sessions);
          
          // 檢查我們的session是否存在
          const sessionExists = sessions.some(session => session.id === sessionId);
          console.log(`Session ${sessionId} 是否存在:`, sessionExists);
          
          if (sessionExists) {
            console.log("Session存在於列表中，但單獨查詢失敗");
            return true;
          } else {
            console.log("Session不存在於列表中");
            return false;
          }
        }
        
        return false;
      }
    } catch (error) {
      console.log(`Session查詢錯誤:`, error.message);
      return false;
    }
  };


  // 使用現有 session_id 進行分析
  const performSessionAnalysis = async (sessionIdToUse, userIdOverride) => {
    try {
      console.log("開始使用現有 session 分析，Session ID:", sessionIdToUse);
      
      // 使用簡化的 API 調用
      const endpoint = `${proxyApiUrl}/apps/judge/users/user/sessions/${sessionIdToUse}`;
      console.log(`查詢現有session端點: ${endpoint}`);
      
      const data = await simpleApiCall(endpoint);
      console.log("Session查詢成功:", data);
      
      // 檢查是否有分析數據
      if (data.state && Object.keys(data.state).length > 0) {
        console.log("找到現有分析數據，直接使用");
        
        // 更新全局session狀態
        setSessionId(sessionIdToUse);
        setIsSessionCreated(true);
        
        // 處理現有數據
        const processedData = processMultiAgentResponse(data, data.state.analyzed_text || "現有分析");
        console.log("處理後的數據:", processedData);
        
        return {
          raw: data,
          data: processedData
        };
      } else {
        console.log("Session存在但沒有分析數據，使用預設結果");
        return {
          raw: data,
          data: getDefaultAnalysisResult("Session 存在但無分析數據")
        };
      }
    } catch (error) {
      console.log(`Session分析錯誤:`, error.message);
      
      // 如果查詢失敗，嘗試創建新session
      if (autoCreateOn404Ref.current) {
        console.log("Session不存在，嘗試創建新session");
        try {
          const newSessionResult = await createNewSession(sessionIdToUse);
          if (newSessionResult) {
            return newSessionResult;
          }
        } catch (createError) {
          console.log("創建新session失敗:", createError.message);
        }
      }
      
      return {
        raw: null,
        data: getDefaultAnalysisResult("Session 分析錯誤")
      };
    }
  };

  // 多agent分析函數
  const performMultiAgentAnalysis = async (query) => {
    try {
      console.log("開始多agent分析，查詢內容:", query);
      
      // 使用代理進行session端點連接
      console.log("使用代理進行session端點API調用...");
      
      // 創建新session（每次都創建新的以確保成功）
      console.log("正在創建新session...");
      const currentSessionId = await createSession();
      console.log("Session創建成功，ID:", currentSessionId);
      
      // 更新全局session狀態
      setSessionId(currentSessionId);
      setIsSessionCreated(true);
      console.log("全局session狀態已更新，ID:", currentSessionId);
      
      // 等待一下確保session創建完成
      console.log("等待session創建完成...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 發送查詢訊息
      console.log("正在發送查詢訊息，使用session ID:", currentSessionId);
      const result = await sendMessage(query, currentSessionId);
      console.log("API回應:", result);
      
      if (result) {
        // 處理API回應
        const processedData = processMultiAgentResponse(result, query);
        console.log("處理後的數據:", processedData);
        // 在 run 成功完成後再寫入雲端資料庫
        try {
          await saveSessionToDatabase(currentUserId || "user", currentSessionId);
        } catch (e) {
          console.log("儲存 session 記錄到資料庫失敗(不影響分析結果顯示):", e?.message || e);
        }
        
        return {
          raw: result,
          data: processedData
        };
      } else {
        console.log("多agent分析失敗，使用預設數據");
        return {
          raw: null,
          data: getDefaultAnalysisResult(query)
        };
      }
    } catch (error) {
      console.error("Multi-agent analysis failed:", error);
      console.error("錯誤類型:", error.name);
      console.error("錯誤訊息:", error.message);
      
      // API失敗時使用模擬數據
      console.log("所有API調用失敗，使用模擬數據進行測試");
      return {
        raw: null,
        data: {
          weight_calculation_json: {
            llm_label: "模擬多agent分析",
            llm_score: 0.3,
            slm_score: 0.4,
            jury_score: "反方",
            final_score: 0.35
          },
          final_report_json: {
            topic: query,
            overall_assessment: `基於多agent分析，關於"${query}"的查證結果顯示此訊息的可信度較低。`,
            jury_score: 35,
            jury_brief: "多agent分析顯示此訊息存在問題",
            evidence_digest: [
              "策展人分析: 此訊息缺乏可靠的來源支持",
              "歷史學家分析: 與已知事實不符",
              "調解員分析: 綜合評估可信度較低"
            ],
            stake_summaries: []
          },
          fact_check_result_json: {
            analysis: `多agent分析結果：關於"${query}"的查證顯示此訊息的可信度較低，建議進一步驗證。`,
            classification: "可信度低"
          },
          classification_json: {
            Probability: "0.35",
            classification: "可信度低"
          }
        }
      };
    }
  };

  // Session ID 搜尋處理函數
  const handleSessionSearch = async (overrideSessionId, overrideUserId) => {
    const targetSessionId = (overrideSessionId ?? sessionIdInput ?? '').trim()
    if (!targetSessionId) {
      alert('請輸入 Session ID');
      return;
    }
    
    setIsSearching(true);
    setAnalysisResult(null);
    
    try {
      console.log("開始使用 Session ID 搜尋:", sessionIdInput);
      
      // 執行 session 分析
      console.log("開始執行 session 分析...");
      setIsMultiAgentLoading(true);
      
      const sessionResult = await performSessionAnalysis(targetSessionId, overrideUserId);
      console.log("Session 分析完成:", sessionResult);
      
      setIsMultiAgentLoading(false);
      
      if (sessionResult && sessionResult.data) {
        console.log("Session 分析成功，設置結果");
        setAnalysisResult(sessionResult.data);
        // 將查詢欄位同步成該 session 的主題（若有）
        const topic = sessionResult.data?.final_report_json?.topic || sessionResult.data?.state?.analyzed_text || '';
        if (topic) {
          setSearchInput(topic);
        }
        // 自動滾動到結果
        scrollToAnalysisResult();
      } else {
        console.log("Session 分析失敗，使用預設結果");
        setAnalysisResult(getDefaultAnalysisResult("Session 分析"));
        scrollToAnalysisResult();
      }
      
    } catch (error) {
      console.error("Session 搜尋過程中發生錯誤:", error);
      alert(`Session 搜尋失敗: ${error.message}`);
      setAnalysisResult(getDefaultAnalysisResult("Session 分析"));
    } finally {
      setIsSearching(false);
      setIsMultiAgentLoading(false);
    }
  };

  // 滚动到分析结果区域的函数
  const scrollToAnalysisResult = () => {
    setTimeout(() => {
      const analysisSection = document.getElementById('analysis-result');
      if (analysisSection) {
        analysisSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // 稍微延迟确保DOM已更新
  };

  // 搜索功能：先查 Cofacts，再組合分析結果
  const handleSearch = async () => {
    if (!searchInput.trim()) return

    setIsSearching(true)
    setSearchQuery(searchInput) // 更新全局搜尋查詢
    setAnalysisResult(null) // 清空之前的分析結果

    // 顯示 Cofact 協尋動畫
    setIsCofactLoading(true)
    
    // 先呼叫 Cofacts 查證 API
    const cofactResult = await fetchCofactResult(searchInput)
    
    // 隱藏 Cofact 動畫
    setIsCofactLoading(false)
    
    // 如果Cofact未找到結果，進行多agent分析
    let multiAgentResult = null;
    if (!cofactResult.found) {
      setIsMultiAgentLoading(true);
      multiAgentResult = await performMultiAgentAnalysis(searchInput);
      setIsMultiAgentLoading(false);
    }
    
    // 顯示模型執行動畫
    setIsModelLoading(true)
    
    // 如果有多agent結果，使用多agent的數據；否則使用預設數據
    let responseData;
    if (multiAgentResult && multiAgentResult.data) {
      // 使用多agent API的實際回應數據
      responseData = multiAgentResult.data;
      console.log("使用多agent分析結果:", responseData);
    } else {
      // 模擬模型計算延遲（2-3秒）
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // 以下為既有的分析資料（本地模擬），可與 Cofacts 結果並存
      // 使用 response_b1.json 的實際數據
      responseData = {
      weight_calculation_json: {
        llm_label: "完全錯誤",
        llm_score: 0,
        slm_score: 0.00461792666465044,
        jury_score: "反方",
        final_score: 0.0017
      },
      final_report_json: {
        topic: "柯文哲是總統",
        overall_assessment: "柯文哲目前並非台灣總統。官方選舉結果、新聞報導及社群輿論均明確指出，賴清德為現任總統，柯文哲在2024年大選中敗選，且正因法律案件纏身。此查詢為不實資訊。",
        jury_score: 94,
        jury_brief: "壓倒性證據顯示柯文哲並非總統，賴清德為現任總統。",
        evidence_digest: [
          "柯文哲目前並非台灣總統。他曾是2024年台灣總統大選的候選人，但在選舉中敗選。(來源: CURATION)",
          "2024年中華民國總統大選結果，由賴清德與蕭美琴當選並於2024年5月20日就任中華民國第16任總統、副總統。(來源: 官方選舉結果)",
          "柯文哲曾任台北市市長（2014年12月25日至2022年12月25日），現任台灣民眾黨主席。(來源: CURATION)",
          "柯文哲因京華城案涉嫌圖利，於2024年9月5日被裁定羈押禁見，並於2025年9月5日以新台幣7000萬元交保。(來源: CURATION)",
          "柯文哲因政治獻金案向民眾黨請假三個月並接受黨內調查。(來源: CURATION)"
        ],
        stake_summaries: [
          {
            side: "Advocate",
            thesis: "柯文哲是總統",
            strongest_points: [
              "柯文哲在民眾心中仍有影響力，具備『準總統級』的政治號召力。",
              "部分支持者仍期望柯文哲未來能成為總統。"
            ],
            weaknesses: [
              "缺乏官方選舉結果支持。",
              "與現任總統資訊不符。",
              "與柯文哲目前的法律狀況和黨職不符。"
            ]
          },
          {
            side: "Skeptic",
            thesis: "柯文哲目前並非總統，總統是賴清德。",
            strongest_points: [
              "柯文哲並未在最近一次總統選舉中勝出。",
              "總統職位目前由賴清德擔任。",
              "中華民國中央選舉委員會證實賴清德當選2024年總統。",
              "各大新聞媒體均報導賴清德就任總統。",
              "柯文哲目前擔任台灣民眾黨主席，並非國家元首。",
              "柯文哲因京華城案涉嫌圖利被羈押交保，並因政治獻金案請假調查。"
            ],
            weaknesses: []
          },
          {
            side: "Devil",
            thesis: "柯文哲雖非在任總統，但其影響力已達『準總統級』，且其政治之路仍在持續。",
            strongest_points: [
              "柯文哲在民眾心中所建立的『第三勢力』形象，以及在網路社群中持續保持的巨大影響力。",
              "京華城案被部分輿論解讀為政治鬥爭下的『犧牲品』，凸顯其政治潛力。",
              "『總統』概念不單純是職位，更是一種影響力、民意投射和持續發展的政治敘事。"
            ],
            weaknesses: [
              "缺乏具體數據支持其「準總統級」影響力。",
              "將法律爭議解讀為「政治手腕」或「施政魄力」缺乏普遍共識。",
              "混淆了「職位」與「影響力」的概念。"
            ]
          }
        ]
      },
      fact_check_result_json: {
        analysis: "根據多個台灣網站的資料顯示，柯文哲目前並非台灣總統。他是2024年台灣總統大選的候選人，但在選舉中敗選。現任中華民國總統為賴清德，於2024年5月20日就職。此外，柯文哲現為台灣民眾黨主席，並因涉入京華城案於2024年9月5日被羈押禁見，後於2025年9月5日交保。",
        classification: "完全錯誤"
      },
      classification_json: {
        Probability: "0.00461792666465044",
        classification: "錯誤"
      }
    };
    }

    // 計算整體結果
    const messageVerification = getCredibilityLevel(responseData.weight_calculation_json.final_score);
    const credibilityScore = normalizeScoreToPercent(responseData.weight_calculation_json.final_score).toFixed(1);

    const newAnalysisResult = {
      // 原始 response_b1.json 數據
      ...responseData,
      cofact: cofactResult,
      multiAgent: multiAgentResult, // 添加多agent分析結果
      newsCorrectness: messageVerification,
      ambiguityScore: credibilityScore,
      analysis: responseData.fact_check_result_json.analysis,
      models: {
        n8n: {
          correctness: getN8nVerdict(responseData.weight_calculation_json.jury_score),
          truthfulness: getN8nVerdict(responseData.weight_calculation_json.jury_score),
          perspective: responseData.final_report_json.overall_assessment,
          references: responseData.final_report_json.evidence_digest
        },
        llm: {
          correctness: getCredibilityLevel(responseData.weight_calculation_json.llm_score),
          truthfulness: getCredibilityLevel(responseData.weight_calculation_json.llm_score),
          perspective: responseData.fact_check_result_json.analysis,
          references: (() => {
            // 如果有multiAgent結果且包含groundingChunks，使用groundingChunks的URL信息
            if (multiAgentResult && multiAgentResult.data && multiAgentResult.data.groundingChunks) {
              const groundingChunks = multiAgentResult.data.groundingChunks;
              if (groundingChunks.length > 0) {
                return groundingChunks.map(chunk => {
                  if (chunk.web && chunk.web.uri && chunk.web.title) {
                    return `${chunk.web.title} (來源: ${chunk.web.uri})`;
                  }
                  return chunk.web?.title || '未知來源';
                });
              }
            }
            // 如果有multiAgent結果且包含curation數據，使用curation的URL信息
            if (multiAgentResult && multiAgentResult.data && multiAgentResult.data.curationData) {
              const curationData = multiAgentResult.data.curationData;
              if (curationData.results) {
                return curationData.results.map(result => {
                  if (typeof result === 'string') return result;
                  if (result.snippet) return result.snippet;
                  if (result.url) return `${result.snippet || result.text || result} (來源: ${result.url})`;
                  return result.snippet || result.text || result;
                });
              }
            }
            // 否則使用預設的evidence_digest
            return responseData.final_report_json.evidence_digest || [];
          })()
        },
        slm: {
          correctness: getCredibilityLevel(parseFloat(responseData.classification_json.Probability)),
          truthfulness: getCredibilityLevel(parseFloat(responseData.classification_json.Probability)),
          perspective: responseData.fact_check_result_json.analysis,
          references: responseData.final_report_json.evidence_digest
        }
      },
      debate: {
        prosecution: responseData.final_report_json.stake_summaries
          .find(s => s.side === "Advocate")?.strongest_points.map((point, index) => ({
            speaker: '正方',
            message: point,
            timestamp: `10:${30 + index}`
          })) || [],
        defense: responseData.final_report_json.stake_summaries
          .find(s => s.side === "Skeptic")?.strongest_points.map((point, index) => ({
            speaker: '反方',
            message: point,
            timestamp: `10:${31 + index}`
          })) || [],
        judge: {
          verdict: responseData.final_report_json.jury_brief,
          confidence: responseData.final_report_json.jury_score
        }
      }
    }
    setAnalysisResult(newAnalysisResult)
    
    // 隱藏模型動畫
    setIsModelLoading(false)
    setIsSearching(false)
    
    // 自動滾動到分析結果區域
    scrollToAnalysisResult()
  }

  return (
    <>
      {/* 主要內容區域 */}
      <div className={`main-content-area ${(isCofactLoading || isModelLoading || isMultiAgentLoading) ? 'loading-state' : ''}`}>
        {/* 搜索區域 - 只在非 loading 狀態時顯示 */}
        {!(isCofactLoading || isModelLoading || isMultiAgentLoading) && (
          <div className="search-section">
            <h1 className="main-title"><BsNewspaper /> 事實查核</h1>
            <p className="main-subtitle">輸入消息內容，獲得專業分析結果</p>

            <div className="search-container">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="輸入要查證的謠言內容..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-input"
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="search-buttons">
                <button
                  className="search-button"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? '分析中...' : '開始分析'}
                </button>
                {/*<div className="search-box" style={{ marginTop: '10px' }}>
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="或輸入 Session ID 直接搜尋現有分析..."
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    className="search-input"
                    onKeyUp={(e) => e.key === 'Enter' && handleSessionSearch()}
                  />
                </div>
                <button
                  className="search-button"
                  onClick={handleSessionSearch}
                  disabled={isSearching}
                  style={{
                    backgroundColor: '#28a745',
                    marginLeft: '10px'
                  }}
                >
                  {isSearching ? '搜尋中...' : 'Session 搜尋'}
                </button>*/}
                {/* <button
                  className="test-button"
                  onClick={testApiConnection}
                  style={{
                    marginLeft: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  測試API連接
                </button> */}
                {/* <button
                  className="test-button"
                  onClick={testSessionCreation}
                  style={{
                    marginLeft: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  測試Session創建
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* 分析結果區域 - 只在有查詢時顯示 */}
        {(isSearching || isCofactLoading || isModelLoading || isMultiAgentLoading || analysisResult) && (
          <div id="analysis-result" className={`analysis-section ${(isCofactLoading || isModelLoading || isMultiAgentLoading) ? 'loading-background' : ''}`}>
            {/* Cofact 協尋過場動畫 */}
            {isCofactLoading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <img src={discuss_cofact} alt="Cofact 協尋中" className="loading-image" />
                  <h3>Cofact 協尋中...</h3>
                  <div className="loading-progress">
                    <div className="loading-progress-bar"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 模型執行過場動畫 */}
            {isModelLoading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <img src={discuss} alt="三路並審中" className="loading-image" />
                  <h3>三路並審中...</h3>
                  <div className="loading-progress">
                    <div className="loading-progress-bar"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 多agent查詢過場動畫 */}
            {isMultiAgentLoading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <img src={discuss} alt="多agent分析中" className="loading-image" />
                  <h3>多agent模型分析中...</h3>
                  <div className="loading-progress">
                    <div className="loading-progress-bar"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 分析結果內容 */}
            {analysisResult && (
            <>
              <h2 className="section-title"><MdAnalytics /> 分析結果</h2>

            {/* Cofact 搜索结果 */}
            {analysisResult.cofact?.found ? (
              <div className="cofact-section">
                <div className="cofact-header">
                  <div className="cofact-header-left">
                    <div className="cofact-logo">
                      <a href="index.php"><img src={cofact} alt="cofact" /></a>
                    </div>
                    <h3>Cofact 事實查核結果</h3>
                  </div>
                  <span className="cofact-badge found">已找到相關查證</span>
                </div>

                <div className="cofact-content">
                  <div className="cofact-layout-grid">
                    <div className="cofact-perspective-top-left">
                      <h3>觀點分析</h3>
                      <p>{analysisResult.cofact.perspective}</p>
                    </div>

                    <div className="cofact-button-top">
                      <a href={analysisResult.cofact.cofactUrl} target="_blank" rel="noopener noreferrer" className="cofact-search-link">
                        查看完整 Cofact 查證結果 →
                      </a>
                    </div>

                    <div className="cofact-result-bottom-right">
                      <h3>新聞可信度</h3>
                      <div className={`correctness-badge ${analysisResult.cofact.correctness.includes('高') ? 'true' : 'false'}`}>
                        {analysisResult.cofact.correctness}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cofact-section">
                <div className="cofact-header">
                  <div className="cofact-header-left">
                    <div className="cofact-logo">
                      <a href="index.php"><img src={cofact} alt="cofact" /></a>
                    </div>
                    <h3>Cofact 事實查核結果</h3>
                  </div>
                  <span className="cofact-badge not-found">未找到相關查證</span>
                </div>
                <div className="cofact-content">
                  <p>在 Cofact 資料庫中未找到相關的事實查核記錄，將使用我們的 AI 模型進行分析。</p>
                  <div className="cofact-link">
                    <a href={`https://cofacts.tw/`} target="_blank" rel="noopener noreferrer" className="cofact-search-link">
                      前往 Cofact 手動搜尋 →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* AI 模型分析 - 只在 Cofact 未找到结果時顯示 */}
            {!analysisResult.cofact?.found && (
              <div className="ai-analysis-section">
                <div className="ai-analysis-header">
                  <h2><TbDeviceDesktopAnalytics /> 合議判決書</h2>
                </div>

                <div className='cofact-content'>
                  由於 Cofact 未找到相關查證，使用我們的 AI 模型進行分析
                </div>

                {/* 整體結果分析 */}
                <div className="overall-summary-grid">
                  <div className="overall-item">
                    <h3>消息查核</h3>
                    <div className={`verification-badge ${analysisResult.newsCorrectness && analysisResult.newsCorrectness.includes('高') ? 'correct' : 'incorrect'}`}>
                      {analysisResult.newsCorrectness || '分析中'}
                    </div>
                  </div>

                  <div className="overall-item">
                    <h3>消息可信度</h3>
                    <div className="credibility-display">
                      <div className="credibility-score">
                        <div className="score-bar">
                          <div className="score-fill"
                            style={{ width: `${analysisResult.ambiguityScore || 0}%` }}
                          ></div>
                        </div>
                        <span className="score-value">{analysisResult.ambiguityScore || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 多代理對話分析 */}
                <div className="multi-agent-dialogue">
                  <h3>綜合分析</h3>
                  
                  {/* LLM 私家偵探 */}
                  <div className="agent-dialogue llm-dialogue">
                    <div className="dialogue-content">
                      <div className="agent-info">
                        <img src={private_detective} alt="私家偵探" className="agent-avatar" />
                        <div className="agent-details">
                          <h4>私家偵探 (LLM)</h4>
                          <p>質疑與挑戰</p>
                        </div>
                      </div>
                      <div className="dialogue-metrics">
                        <div className="metric-item">
                           <div className="verification-result">
                            <span className={`verification-badge ${getCredibilityLevel(analysisResult.weight_calculation_json?.llm_score || 0).includes('高') ? 'correct' : 'incorrect'}`}>
                              {getCredibilityLevel(analysisResult.weight_calculation_json?.llm_score || 0)}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dialogue-actions">
                      <button
                        className="detail-btn llm-btn"
                        onClick={() => {
                          console.log('LLM Button clicked - analysisResult:', analysisResult);
                          console.log('LLM Button - organizedData:', analysisResult.organizedData);
                          onOpenAnalysis && onOpenAnalysis('llm', analysisResult);
                        }}
                      >
                        查看詳細分析
                      </button>
                    </div>
                  </div>

                  {/* SLM 業界學者 */}
                  <div className="agent-dialogue slm-dialogue">
                    <div className="dialogue-content">
                      <div className="agent-info">
                        <img src={professor} alt="業界學者" className="agent-avatar" />
                        <div className="agent-details">
                          <h4>業界學者 (SLM)</h4>
                          <p>辯護與支持</p>
                        </div>
                      </div>
                      <div className="dialogue-metrics">
                        <div className="metric-item">
                           <div className="verification-result">
                            <span className={`verification-badge ${getCredibilityLevel(parseFloat(analysisResult.classification_json?.Probability) || 0).includes('高') ? 'correct' : 'incorrect'}`}>
                              {getCredibilityLevel(parseFloat(analysisResult.classification_json?.Probability) || 0)}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dialogue-actions">
                      <button
                        className="detail-btn slm-btn"
                        onClick={() => {
                          console.log('SLM Button clicked - analysisResult:', analysisResult);
                          console.log('SLM Button - organizedData:', analysisResult.organizedData);
                          onOpenAnalysis && onOpenAnalysis('slm', analysisResult);
                        }}
                      >
                        查看詳細分析
                      </button>
                    </div>
                  </div>

                  {/* 法官 */}
                  <div className="agent-dialogue judge-dialogue">
                    <div className="dialogue-content">
                      <div className="agent-info">
                        <img src={judge_character} alt="法官" className="agent-avatar" />
                        <div className="agent-details">
                          <h4>法庭辯論系統</h4>
                          <p>公正裁決</p>
                        </div>
                      </div>
                      <div className="dialogue-metrics">
                        <div className="metric-item">
                          <div className="verification-result">
                            <span className={`verification-badge ${getN8nVerdict(analysisResult.weight_calculation_json?.jury_score || 0) === '勝訴' ? 'correct' : 'incorrect'}`}>
                              {getN8nVerdict(analysisResult.weight_calculation_json?.jury_score || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dialogue-actions">
                      <button
                        className="detail-btn judge-btn"
                        onClick={() => {
                          console.log('N8N Button clicked - analysisResult:', analysisResult);
                          console.log('N8N Button - organizedData:', analysisResult.organizedData);
                          onOpenAnalysis && onOpenAnalysis('n8n', analysisResult);
                        }}
                      >
                        查看詳細分析
                      </button>
                    </div>
                  </div>
                </div>

                {/* 最終分析 - LLM 觀點分析 */}
                <div className="final-analysis-section">
                  <h3>最終分析</h3>
                  <div className="final-analysis-content">
                    {/* <div className="analysis-header">
                      <img src={private_detective} alt="私家偵探" className="analysis-avatar" />
                      <div className="analysis-title">
                        <h4>LLM 最終觀點分析</h4>
                        <p>基於深度學習的質疑與挑戰分析</p>
                      </div>
                    </div> */}
                    <div className="analysis-text">
                      <p>{analysisResult.fact_check_result_json?.analysis || '無分析資料'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
          </div>
        )}

        {/* 最新查證 - 只在非 loading 狀態時顯示 */}
        {!(isCofactLoading || isModelLoading || isMultiAgentLoading) && (
          <div className="latest-section">
          <div className="section-header">
            <h2><MdOutlineHistoryToggleOff /> 歷史查證</h2>
            <a href="#" className="view-all-link">查看全部</a>
          </div>

          <div className="fact-checks-list">
            {factChecks && factChecks.map((item) => (
              <article key={item.id} className="fact-check-item">
                <div className="item-content">
                  <div className="item-header">
                    <span className={`status-badge ${item.result.includes('高') ? 'true' : item.result.includes('低') ? 'false' : 'mixed'}`}>
                      {item.result}
                    </span>
                    <span className="category-badge">{item.category}</span>
                  </div>
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-summary">{item.summary}</p>
                  <div className="item-meta">
                    <span className="item-author">作者：{item.author}</span>
                    <span className="item-date">{item.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
        )}
      </div>
    </>
  )
}

export default FactCheck