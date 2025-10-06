import { useState, useEffect } from 'react'
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
  const [isSearching, setIsSearching] = useState(false)
  const [isCofactLoading, setIsCofactLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [isMultiAgentLoading, setIsMultiAgentLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [isSessionCreated, setIsSessionCreated] = useState(false)

  // 同步 searchQuery 和 searchInput
  useEffect(() => {
    setSearchInput(searchQuery || '')
  }, [searchQuery])

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
  const apiUrl = 'http://120.107.172.133:10001';
  
  // 添加CORS代理URL（如果API服務器支持）
  const proxyApiUrl = '/api-proxy'; // 使用相對路徑，讓開發服務器代理


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
      console.log(`代理API回應狀態: ${proxyResponse.status}`);
      console.log(`代理API回應headers:`, Object.fromEntries(proxyResponse.headers.entries()));
    } catch (error) {
      console.log(`代理API錯誤: ${error.message}`);
    }
    
    // 測試3: 嘗試Session創建端點
    console.log("測試3: 嘗試Session創建端點");
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
      }
    } catch (error) {
      console.log(`Session創建錯誤: ${error.message}`);
    }
    
    console.log("=== API連接測試完成 ===");
  };

  // 簡單的代理測試函數
  const testProxyConnection = async () => {
    console.log("測試代理連接...");
    
    try {
      // 嘗試一個簡單的請求來測試代理是否工作
      const testUrl = `${proxyApiUrl}/test`;
      console.log(`測試代理URL: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`代理測試回應狀態:`, response.status);
      console.log(`代理測試回應headers:`, Object.fromEntries(response.headers.entries()));
      
      // 即使404也說明代理在工作，只是端點不存在
      if (response.status === 404) {
        console.log("代理工作正常，但測試端點不存在");
        return true;
      } else if (response.ok) {
        console.log("代理工作正常");
        return true;
      } else {
        console.log(`代理測試失敗，狀態: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`代理測試錯誤:`, error.message);
      return false;
    }
  };

  // 創建 Session 函數
  const createSession = async () => {
    const newSessionId = generateUUID();
    const sessionData = {
      "appName": "judge",
      "userId": "user",
      "sessionId": newSessionId
    };

    // 測試多個可能的session端點
    const sessionEndpoints = [
      '/apps/judge/users/user/sessions',  // 原始端點
      '/sessions',                        // 簡化端點
      '/api/sessions',                    // API前綴
      '/judge/sessions',                  // 應用前綴
      '/users/user/sessions',             // 無應用前綴
      '/create-session',                  // 創建端點
      '/session/create'                   // 創建端點變體
    ];

    for (const endpoint of sessionEndpoints) {
      try {
        const sessionUrl = `${proxyApiUrl}${endpoint}`;
        console.log(`嘗試創建session，URL: ${sessionUrl}`);
        console.log("Session數據:", sessionData);
        
        const response = await fetch(sessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        });

        console.log(`Session端點 ${endpoint} 回應狀態:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Session created successfully:", data);
          console.log("Session ID set to:", newSessionId);
          setSessionId(newSessionId);
          setIsSessionCreated(true);
          console.log("Session狀態已更新，isSessionCreated:", true);
          return newSessionId;
        } else {
          console.log(`Session端點 ${endpoint} 失敗，狀態: ${response.status}`);
          console.log(`回應狀態文本: ${response.statusText}`);
          console.log(`回應headers:`, Object.fromEntries(response.headers.entries()));
          
          // 嘗試獲取錯誤詳情
          try {
            const errorText = await response.text();
            console.log(`Session錯誤回應內容:`, errorText);
            
            // 嘗試解析為JSON
            try {
              const errorJson = JSON.parse(errorText);
              console.log(`Session錯誤JSON:`, errorJson);
            } catch (e) {
              console.log(`Session錯誤內容不是JSON格式`);
            }
          } catch (e) {
            console.log(`無法讀取Session錯誤內容:`, e.message);
          }
          
          // 繼續嘗試下一個端點，而不是立即失敗
          console.log(`端點 ${endpoint} 失敗，嘗試下一個端點...`);
          continue;
        }
      } catch (error) {
        console.log(`Session端點 ${endpoint} 錯誤:`, error.message);
      }
    }

    throw new Error("所有session端點都失敗");
  };

  // 發送訊息函數
  const sendMessage = async (query, currentSessionId) => {
    const messageData = {
      "appName": "judge",
      "userId": "user",
      "sessionId": currentSessionId,
      "newMessage": {
        "role": "user",
        "parts": [{"text": query}]
      },
      "streaming": false
    };

    // 簡化run端點測試，專注於/run端點
    const runEndpoints = [
      '/run'  // 原始端點
    ];

    for (const endpoint of runEndpoints) {
      try {
        const messageUrl = `${proxyApiUrl}${endpoint}`;
        console.log(`嘗試發送訊息，URL: ${messageUrl}`);
        console.log("訊息數據:", messageData);
        console.log("使用的session ID:", currentSessionId);
        console.log("訊息數據中的session ID:", messageData.sessionId);
        
        const response = await fetch(messageUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        console.log(`Run端點 ${endpoint} 回應狀態:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Message sent:", data);
          return data;
        } else {
          console.log(`Run端點 ${endpoint} 失敗，狀態: ${response.status}`);
          console.log(`回應狀態文本: ${response.statusText}`);
          console.log(`回應headers:`, Object.fromEntries(response.headers.entries()));
          
          // 嘗試獲取錯誤詳情
          try {
            const errorText = await response.text();
            console.log(`錯誤回應內容:`, errorText);
            
            // 嘗試解析為JSON
            try {
              const errorJson = JSON.parse(errorText);
              console.log(`錯誤JSON:`, errorJson);
            } catch (e) {
              console.log(`錯誤內容不是JSON格式`);
            }
          } catch (e) {
            console.log(`無法讀取錯誤內容:`, e.message);
          }
        }
      } catch (error) {
        console.log(`Run端點 ${endpoint} 錯誤:`, error.message);
      }
    }

    throw new Error("所有run端點都失敗");
  };

  // 處理多agent API回應格式
  const processMultiAgentResponse = (apiResponse, query) => {
    console.log("處理API回應:", apiResponse);
    
    if (!apiResponse) {
      console.log("API回應為空");
      return null;
    }

    // 多agent API回應是一個數組，每個元素都有author字段
    let responseArray = apiResponse;
    if (Array.isArray(apiResponse.data)) {
      responseArray = apiResponse.data;
    } else if (Array.isArray(apiResponse.result)) {
      responseArray = apiResponse.result;
    } else if (!Array.isArray(apiResponse)) {
      console.log("API回應不是數組格式");
      return null;
    }

    // 從不同author的回應中提取數據
    let curatorData = null;
    let historianData = null;
    let moderatorData = null;
    let finalResult = null;

    // 遍歷回應數組，根據author提取對應數據
    responseArray.forEach((item, index) => {
      if (!item.author) return;
      
      console.log(`處理author: ${item.author}, 索引: ${index}`);
      
      switch (item.author) {
        case 'curator_tool_runner':
        case 'curator_schema_validator':
          curatorData = item;
          break;
        case 'historian_schema_agent':
          historianData = item;
          break;
        case 'moderator_decider':
        case 'moderator_executor':
          moderatorData = item;
          break;
        case 'stop_checker':
          finalResult = item;
          break;
        default:
          console.log(`未處理的author: ${item.author}`);
      }
    });

    // 從各agent的回應中提取分析數據
    const extractTextContent = (item) => {
      if (item.content && item.content.parts && item.content.parts[0]) {
        return item.content.parts[0].text;
      }
      if (item.actions && item.actions.stateDelta) {
        return Object.values(item.actions.stateDelta)[0];
      }
      return "";
    };

    const curatorText = curatorData ? extractTextContent(curatorData) : "";
    const historianText = historianData ? extractTextContent(historianData) : "";
    const moderatorText = moderatorData ? extractTextContent(moderatorData) : "";
    const finalText = finalResult ? extractTextContent(finalResult) : "";

    // 構建與原有格式兼容的分析數據
    const processedData = {
      weight_calculation_json: {
        llm_label: "多agent分析",
        llm_score: 0.5, // 可以根據實際分析結果調整
        slm_score: 0.5,
        jury_score: "正方", // 可以根據moderator結果調整
        final_score: 0.5
      },
      final_report_json: {
        topic: query,
        overall_assessment: finalText || moderatorText || "多agent分析結果",
        jury_score: 50,
        jury_brief: moderatorText || "多agent分析完成",
        evidence_digest: [
          curatorText ? `策展人分析: ${curatorText}` : "策展人分析: 無數據",
          historianText ? `歷史學家分析: ${historianText}` : "歷史學家分析: 無數據",
          moderatorText ? `調解員分析: ${moderatorText}` : "調解員分析: 無數據"
        ].filter(item => !item.includes("無數據")),
        stake_summaries: []
      },
      fact_check_result_json: {
        analysis: finalText || moderatorText || "多agent分析結果",
        classification: "分析中"
      },
      classification_json: {
        Probability: "0.5",
        classification: "分析中"
      }
    };

    console.log("處理後的數據:", processedData);
    return processedData;
  };

  // Session驗證函數
  const verifySession = async (sessionId) => {
    try {
      console.log("驗證Session是否存在，ID:", sessionId);
      const response = await fetch(`${proxyApiUrl}/apps/judge/users/user/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Session驗證回應狀態:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Session驗證成功:", data);
        return true;
      } else {
        console.log("Session驗證失敗，狀態:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Session驗證錯誤:", error);
      return false;
    }
  };

  // 代理API測試函數（避免CORS問題）
  const testProxyAPI = async (query, sessionId) => {
    const testData = {
      "appName": "judge",
      "userId": "user",
      "sessionId": sessionId,
      "newMessage": {
        "role": "user",
        "parts": [{"text": query}]
      },
      "streaming": false
    };

    console.log("使用代理測試API服務器...");
    console.log("測試數據:", testData);

    try {
      // 使用代理調用API
      const response = await fetch(`${proxyApiUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log("代理API回應狀態:", response.status);
      console.log("代理API回應headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("代理API成功:", data);
        return data;
      } else {
        console.log("代理API失敗，狀態:", response.status);
        console.log("回應狀態文本:", response.statusText);
        console.log("回應headers:", Object.fromEntries(response.headers.entries()));
        
        // 嘗試獲取錯誤詳情
        let errorDetails = "";
        try {
          errorDetails = await response.text();
          console.log("錯誤回應內容:", errorDetails);
        } catch (e) {
          console.log("無法讀取錯誤內容:", e.message);
        }
        
        // 嘗試解析為JSON
        try {
          const errorJson = JSON.parse(errorDetails);
          console.log("錯誤JSON:", errorJson);
        } catch (e) {
          console.log("錯誤內容不是JSON格式");
        }
        
        return null;
      }
    } catch (error) {
      console.error("代理API調用失敗:", error);
      return null;
    }
  };

  // 多agent分析函數
  const performMultiAgentAnalysis = async (query) => {
    try {
      console.log("開始多agent分析，查詢內容:", query);
      
      // 嘗試代理方式，如果失敗則使用預設數據
      console.log("嘗試使用代理方式進行API調用...");
      
      // 簡單測試代理連接
      console.log("測試代理連接...");
      const isProxyWorking = await testProxyConnection();
      if (!isProxyWorking) {
        console.log("代理連接測試失敗，直接使用預設數據");
        return {
          raw: null,
          data: getDefaultAnalysisResult(query)
        };
      }
      
      console.log("代理連接正常，繼續進行Session創建...");
      
      // 創建或重用session
      let currentSessionId;
      if (isSessionCreated && sessionId) {
        console.log("重用現有session，ID:", sessionId);
        currentSessionId = sessionId;
      } else {
        console.log("正在創建新session...");
        currentSessionId = await createSession();
        console.log("Session創建成功，ID:", currentSessionId);
        
        // 等待一下確保session創建完成
        console.log("等待session創建完成...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 驗證Session是否存在（使用代理）
        console.log("驗證Session是否存在...");
        const sessionExists = await verifySession(currentSessionId);
        if (!sessionExists) {
          console.log("Session驗證失敗，重新創建...");
          currentSessionId = await createSession();
          console.log("重新創建Session成功，ID:", currentSessionId);
          // 再次驗證
          const reVerifyExists = await verifySession(currentSessionId);
          if (!reVerifyExists) {
            console.log("重新創建的Session仍然驗證失敗，但繼續嘗試發送訊息...");
          } else {
            console.log("重新創建的Session驗證成功！");
          }
        } else {
          console.log("Session驗證成功！");
        }
      }
      
      // 發送查詢訊息（使用代理）
      console.log("正在發送查詢訊息，使用session ID:", currentSessionId);
      const result = await sendMessage(query, currentSessionId);
      console.log("API回應:", result);
      
      if (result) {
        // 處理API回應
        const processedData = processMultiAgentResponse(result, query);
        console.log("處理後的數據:", processedData);
        
        return {
          raw: result,
          data: processedData
        };
      } else {
        console.log("多agent分析失敗，嘗試代理測試...");
        // 嘗試代理測試
        const proxyResult = await testProxyAPI(query, currentSessionId);
        if (proxyResult) {
          console.log("代理測試成功！");
          const processedData = processMultiAgentResponse(proxyResult, query);
          return {
            raw: proxyResult,
            data: processedData
          };
        } else {
          console.log("代理測試也失敗，使用預設數據");
          return {
            raw: null,
            data: getDefaultAnalysisResult(query)
          };
        }
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

  // 搜索功能：先查 Cofacts，再組合分析結果
  const handleSearch = async () => {
    if (!searchInput.trim()) return

    setIsSearching(true)
    setSearchQuery(searchInput) // 更新全局搜尋查詢
    setAnalysisResult(null) // 清空之前的分析結果

    // 顯示 Cofact 協尋動畫
    setIsCofactLoading(true)
    
    // 先呼叫 Cofacts 查證 API (暫時註解用於測試多agent API)
    // const cofactResult = await fetchCofactResult(searchInput)
    
    // 暫時設定Cofact結果為false，用於測試多agent API
    const cofactResult = { found: false, correctness: '未知', perspective: '', cofactUrl: 'https://cofact.org/search?q=' + encodeURIComponent(searchInput) }
    
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
    const credibilityScore = (responseData.weight_calculation_json.final_score * 100).toFixed(1);

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
          references: responseData.final_report_json.evidence_digest
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
                <button
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
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 分析結果區域 - 只在有查詢時顯示 */}
        {(isSearching || isCofactLoading || isModelLoading || isMultiAgentLoading || analysisResult) && (
          <div className={`analysis-section ${(isCofactLoading || isModelLoading || isMultiAgentLoading) ? 'loading-background' : ''}`}>
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
                    <div className={`verification-badge ${analysisResult.newsCorrectness.includes('高') ? 'correct' : 'incorrect'}`}>
                      {analysisResult.newsCorrectness}
                    </div>
                  </div>

                  <div className="overall-item">
                    <h3>消息可信度</h3>
                    <div className="credibility-display">
                      <div className="credibility-score">
                        <div className="score-bar">
                          <div className="score-fill"
                            style={{ width: `${analysisResult.ambiguityScore}%` }}
                          ></div>
                        </div>
                        <span className="score-value">{analysisResult.ambiguityScore}%</span>
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