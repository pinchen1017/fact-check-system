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
          correctness = data.answer.decision ? '真實' : '錯誤'
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
            if (label.includes('正確') || label.includes('真實')) correctness = '真實'
            else if (label.includes('錯誤') || label.includes('不實')) correctness = '錯誤'
            else correctness = '混合'
          } else if (typeof finalScore === 'number') {
            correctness = finalScore >= 0.5 ? '真實' : '錯誤'
          } else if (!isNaN(prob)) {
            correctness = prob >= 0.5 ? '真實' : '錯誤'
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
        slm_score: 0.9795,
        jury_score: -0.7244,
        final_score: 0.035
      },
      final_report_json: {
        topic: "國高中改10點上課現在實施中",
        overall_assessment: "「國高中改10點上課現在實施中」的說法為假。目前台灣並未全面實施此政策，僅為一項已達附議門檻、待教育部回應的公共政策提案。社會對此議題意見高度分歧，教育部預計於11月14日前做出回應，但過往經驗顯示全面實施的可能性較低，更傾向於彈性調整。",
        jury_score: 72,
        jury_brief: "證據不足。未全面實施，但提案已達附議門檻。",
        evidence_digest: [
          "公共政策網路參與平台：國高中改10點上課提案已達萬人附議門檻，教育部須於11/14前回應。",
          "教育部 (2017年類似提案處理)：曾有建議9點上課提案，最終未全面採納，僅放寬早自習彈性。",
          "教育部 (2022年作息調整)：修正發布作息注意事項，讓高中生第一節課前時間更有彈性，非全面延後。",
          "Yahoo新聞網路投票：超過六成參與者不贊成或完全不贊成國高中改為10點上課。",
          "社群觀察：學生普遍支持，家長、教育工作者多數反對或擔憂實際操作。"
        ],
        stake_summaries: [
          {
            side: "Advocate",
            thesis: "國高中改為上午10點上課的提案，旨在改善學生睡眠不足及提升學習效率，是符合學生福祉的改革方向。",
            strongest_points: [
              "改善學生慢性睡眠不足問題，提升學習效率。",
              "降低學生憂鬱、自傷風險。",
              "學生已具備自行通勤能力，不需配合家長作息。",
              "提案獲萬人附議，顯示廣大學生與家長強烈需求。"
            ],
            weaknesses: [
              "未能有效回應家長接送、交通、補習文化等實際衝擊。",
              "未充分說明如何解決課程時數壓縮與教學品質問題。",
              "過於樂觀看待教育部對提案的採納程度，忽略歷史經驗。"
            ]
          },
          {
            side: "Skeptic",
            thesis: "國高中改10點上課的提案，雖立意良善，但實際執行將對家庭作息、學校行政、教學品質及社會運作造成巨大衝擊，且社會反對聲浪高。",
            strongest_points: [
              "政策尚未實施，僅為提案討論中，與「實施中」說法不符。",
              "若無配套，可能壓縮教學時數，影響教學品質。",
              "學生可能將多餘時間用於補習，無法真正改善睡眠。",
              "過去類似提案最終僅給予學校彈性，顯示全面實施的複雜性。"
            ],
            weaknesses: [
              "未能充分考慮學生身心發展需求。",
              "過度保守，缺乏改革勇氣。",
              "未提出替代方案解決學生睡眠不足問題。"
            ]
          }
        ]
      },
      fact_check_result_json: {
        analysis: "根據目前的資料顯示，「國高中改10點上課現在實施中」的說法並不正確。1. 尚未全面實施： 台灣目前並沒有全面實施國高中延後至上午10點上課的政策。大部分國高中仍維持在早上7點半至8點左右開始上課。2. 公民提案與教育部回應： 國高中改為10點上課的議題，是在「公共政策網路參與平台」上獲得超過萬人附議的公民提案。教育部已承諾將針對此提案進行研議，並預計於2025年11月14日前做出具體回應。3. 過去的調整與提案：\n*   教育部在2022年3月曾修正發布「教育部主管高級中等學校學生在校作息時間規劃注意事項」，並於同年8月1日起實施。這項修正主要是讓高中生第一節課前的時間更有彈性，例如將全校性集會活動從每週最多2天調整為最多1天，其餘時間學生可自主規劃運用，但這並非全面更改上課起始時間至10點。\n*   在2017年，也曾有類似建議國高中改為上午9點上課的提案，但教育部評估後並未全面採納，當時僅放寬高中早自習和第八節課的彈性參與。4. 社會意見分歧：\n*   學生群體普遍支持延後上課，認為有助於改善睡眠品質、提升學習效率與身心發展。有些學生也觀察到部分高中已將早自習改為自主時間，被視為一種實質上的延後上課。\n*   家長與通勤族群多數反對，擔憂延後上課會衝擊家長接送、自身工作時間安排、放學時間延後可能影響補習與才藝班時間，以及對交通運作可能造成的影響。一項由Yahoo新聞發起的網路投票顯示，有超過六成的參與者不贊成或完全不贊成國高中改為10點上課。\n*   教育工作者與學校行政則持觀望態度，擔憂全面延後上課對現有課綱、教學時數、學校行政排程、教師授課時間及校園設施使用都會是巨大的挑戰，認為這與過去的彈性調整概念不同。結論：目前國高中並沒有全面實施10點上課的政策，此訊息為誤解。",
        classification: "完全錯誤"
      },
      classification_json: {
        Probability: "0.07950027287006378",
        classification: "錯誤"
      }
    }

    // 計算整體結果
    const messageVerification = responseData.weight_calculation_json.final_score >= 0.5 ? '正確' : '錯誤';
    const credibilityScore = (responseData.weight_calculation_json.final_score * 100).toFixed(3);

    const newAnalysisResult = {
      // 原始 response_b1.json 數據
      ...responseData,
      cofact: cofactResult,
      newsCorrectness: messageVerification,
      ambiguityScore: credibilityScore,
      analysis: responseData.fact_check_result_json.analysis,
      models: {
        n8n: {
          correctness: responseData.final_report_json.jury_score,
          truthfulness: responseData.final_report_json.jury_score,
          perspective: responseData.final_report_json.overall_assessment,
          references: responseData.final_report_json.evidence_digest
        },
        llm: {
          correctness: Math.round(responseData.weight_calculation_json.llm_score * 100),
          truthfulness: Math.round(responseData.weight_calculation_json.llm_score * 100),
          perspective: responseData.fact_check_result_json.analysis,
          references: responseData.final_report_json.evidence_digest
        },
        slm: {
          correctness: Math.round(parseFloat(responseData.classification_json.Probability) * 100),
          truthfulness: Math.round(parseFloat(responseData.classification_json.Probability) * 100),
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
                      <h3>新聞正確性</h3>
                      <div className={`correctness-badge ${analysisResult.cofact.correctness === '真實' ? 'true' : 'false'}`}>
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
                    <h3>消息查證</h3>
                    <div className={`verification-badge ${analysisResult.newsCorrectness === '正確' ? 'correct' : 'incorrect'}`}>
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
                            <span className={`verification-badge ${(analysisResult.weight_calculation_json?.jury_score || 0) >= 0 ? 'correct' : 'incorrect'}`}>
                              {(analysisResult.weight_calculation_json?.jury_score || 0) >= 0 ? '正確' : '錯誤'}
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
                            <span className={`verification-badge ${analysisResult.newsCorrectness === '正確' ? 'correct' : 'incorrect'}`}>
                              {analysisResult.newsCorrectness || '無資料'}
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
                            <span className={`verification-badge ${(analysisResult.weight_calculation_json?.jury_score || 0) >= 0 ? 'correct' : 'incorrect'}`}>
                              {(analysisResult.weight_calculation_json?.jury_score || 0) >= 0 ? '正確' : '錯誤'}
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
                    <span className={`status-badge ${item.result === '真實' ? 'true' : item.result === '假消息' ? 'false' : 'mixed'}`}>
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