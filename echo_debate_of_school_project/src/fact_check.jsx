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
    
    // 顯示模型執行動畫
    setIsModelLoading(true)
    
    // 模擬模型計算延遲（2-3秒）
    await new Promise(resolve => setTimeout(resolve, 2500))

    // 以下為既有的分析資料（本地模擬），可與 Cofacts 結果並存
    // 使用 response_b1.json 的實際數據
    const responseData = {
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
    }

    // 計算整體結果
    const messageVerification = getCredibilityLevel(responseData.weight_calculation_json.final_score);
    const credibilityScore = (responseData.weight_calculation_json.final_score * 100).toFixed(1);

    const newAnalysisResult = {
      // 原始 response_b1.json 數據
      ...responseData,
      cofact: cofactResult,
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
      <div className={`main-content-area ${(isCofactLoading || isModelLoading) ? 'loading-state' : ''}`}>
        {/* 搜索區域 - 只在非 loading 狀態時顯示 */}
        {!(isCofactLoading || isModelLoading) && (
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
              </div>
            </div>
          </div>
        )}

        {/* 分析結果區域 - 只在有查詢時顯示 */}
        {(isSearching || isCofactLoading || isModelLoading || analysisResult) && (
          <div className={`analysis-section ${(isCofactLoading || isModelLoading) ? 'loading-background' : ''}`}>
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
                        onClick={() => onOpenAnalysis && onOpenAnalysis('llm', {
                          final_report_json: analysisResult.final_report_json,
                          weight_calculation_json: analysisResult.weight_calculation_json,
                          fact_check_result_json: analysisResult.fact_check_result_json
                        })}
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
                          console.log('SLM Button - classification_json:', analysisResult.classification_json);
                          const slmData = {
                            weight_calculation_json: analysisResult.weight_calculation_json,
                            classification_json: analysisResult.classification_json,
                            fact_check_result_json: analysisResult.fact_check_result_json
                          };
                          console.log('SLM Button - slmData being passed:', slmData);
                          onOpenAnalysis && onOpenAnalysis('slm', slmData);
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
                        onClick={() => onOpenAnalysis && onOpenAnalysis('n8n', {
                          final_report_json: analysisResult.final_report_json,
                          weight_calculation_json: analysisResult.weight_calculation_json
                        })}
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
        {!(isCofactLoading || isModelLoading) && (
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