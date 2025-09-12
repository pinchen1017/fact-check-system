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
import LlmAnalysis from './llm'
import SlmAnalysis from './slm'
import cofact from './assets/cofact.png'


{/* FactCheck */ }
function FactCheck({ searchQuery, factChecks, setSearchQuery, onOpenAnalysis, onStartRealTimeAnalysis, analysisResult, setAnalysisResult }) {
  const [searchInput, setSearchInput] = useState(searchQuery || '')
  const [isSearching, setIsSearching] = useState(false)

  // 同步 searchQuery 和 searchInput
  useEffect(() => {
    setSearchInput(searchQuery || '')
  }, [searchQuery])

  // 模擬搜索功能
  const handleSearch = () => {
    if (!searchInput.trim()) return

    setIsSearching(true)
    setSearchQuery(searchInput) // 更新全局搜尋查詢

    // 模拟API調用延遲延遲
    setTimeout(() => {
      // 模拟 Cofact 搜索结果
      const cofactResult = {
        found: Math.random() > 0.3, // 70% 概率找到 Cofact 结果
        correctness: Math.random() > 0.5 ? '真實' : '假消息',
        confidence: Math.floor(Math.random() * 100),
        perspective: 'Cofact 事實查核：根據多個可靠來源的交叉驗證，此消息的真實性已得到確認。相關專家對此消息的準確性表示支持。',
        references: [
          'https://cofact.org/article/2024-001',
          'https://cofact.org/article/2024-002',
          'https://cofact.org/article/2024-003'
        ],
        cofactUrl: 'https://cofact.org/search?q=' + encodeURIComponent(searchInput)
      }

      const newAnalysisResult = {
        cofact: cofactResult,
        newsCorrectness: cofactResult.found ? cofactResult.correctness : (Math.random() > 0.5 ? '真實' : '假消息'),
        ambiguityScore: cofactResult.found ? cofactResult.confidence : Math.floor(Math.random() * 100),
        analysis: cofactResult.found
          ? `Cofact 已查證：${cofactResult.perspective}`
          : '根據多個可靠來源的交叉驗證，此消息的真實性存在爭議。專家意見分歧，需要進一步調查。',
        models: {
          n8n: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '新聞內容與摘要一致，提供了貨到付款詐騙退貨退款的相關步驟，並提及官方回應及爭議點，支持了輸入文本的真實性。',
            references: [
              'https://court-legal-database.com/verdict-2024-001',
              'https://legal-precedent.org/case-study-123',
              'https://judicial-review.net/analysis-456'
            ]
          },
          llm: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '大型語言模型基於語料判讀，觀點偏中立，對來源可信度持審慎態度。',
            references: [
              'https://llm-research.org/paper-2024-001',
              'https://ai-analysis.com/study-789',
              'https://language-model.net/insights-012',
            ]
          },
          slm: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '小型模型根據關鍵特徵比對，指出部分敘述缺乏佐證。',
            references: [
              'https://slm-verification.com/check-345',
              'https://small-model.org/validation-678',
              'https://compact-ai.net/analysis-901',
            ]
          }
        },
        debate: {
          prosecution: [
            { speaker: '正方', message: '多個事實查核機構已將此消息標記為可疑。', timestamp: '10:32' },
            { speaker: '正方', message: '根據證據顯示，此消息缺乏可靠來源支持。', timestamp: '10:30' },
            { speaker: '正方', message: '相關專家對此消息的準確性表示質疑。', timestamp: '10:35' },
            { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
            { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
            { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
            { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' }
          ],
          defense: [
            { speaker: '反方', message: '我方當事人提供了相關證據支持此消息。', timestamp: '10:31' },
            { speaker: '反方', message: '部分專家學者對此消息持支持態度。', timestamp: '10:33' },
            { speaker: '反方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' }
          ],
          judge: {
            verdict: '經法庭審理，此消息的真實性存在爭議，建議公眾謹慎對待，等待進一步權威驗證。',
            confidence: 65
          }
        }
      }
      setAnalysisResult(newAnalysisResult)
      setIsSearching(false)
    }, 2000)
  }

  return (
    <>
      {/* 主要內容區域 */}
      <div className="main-content-area">
        {/* 搜索區域 */}
        <div className="search-section">
          <h1 className="main-title"><BsNewspaper /> 事實查核</h1>
          <p className="main-subtitle">輸入謠言內容，獲得專業分析結果</p>

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

        {/* 分析結果區域 */}
        {analysisResult && (
          <div className="analysis-section">
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
                  <h2><TbDeviceDesktopAnalytics /> 多代理模型分析</h2>
                </div>

                <div className='cofact-content'>
                  由於 Cofact 未找到相關查證，使用我們的 AI 模型進行分析
                </div>
                {/* <span className="ai-analysis-badge"></span> */}

                <div className="analysis-summary">
                  <div className="summary-grid">
                    <div className="summary-item">
                      <h3>新聞正確性</h3>
                      <div className={`correctness-badge ${analysisResult.newsCorrectness === '真實' ? 'true' : 'false'}`}>
                        {analysisResult.newsCorrectness}
                      </div>
                    </div>
                    <div className="summary-item">
                      <h3>真實性分數</h3>
                      <div className="ambiguity-score">
                        <div className="score-bar">
                          <div
                            className="score-fill"
                            style={{ width: `${analysisResult.ambiguityScore}%` }}
                          ></div>
                        </div>
                        <span>{analysisResult.ambiguityScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-text">
                    <h3>詳細分析</h3>
                    <div className="analysis-tree">
                      <div className="tree-root">
                        <div className="tree-node root-node">
                          <div className="node-header">綜合分析</div>
                          <div className="node-body">{analysisResult.analysis}</div>
                        </div>
                      </div>
                      <div className="tree-branches">
                        <div className="tree-branch">
                          <div className="branch-connector"></div>
                          <div className="branch-node">
                            <div className="branch-header">辯論法庭系統</div>
                            <div className="model-analysis n8n">
                              <div className="model-metrics">
                                <div className="metric-item">
                                  <span>判決信心度</span>
                                  <div className="metric-bar">
                                    <div
                                      className="metric-fill"
                                      style={{ width: `${analysisResult?.debate?.judge?.confidence || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="metric-value">{analysisResult?.debate?.judge?.confidence || 0}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="branch-actions">
                              <button
                                className="detail-btn n8n-btn"
                                onClick={() => onOpenAnalysis && onOpenAnalysis('n8n', {
                                  ...analysisResult?.models?.n8n,
                                  debate: analysisResult?.debate
                                })}
                              >
                                詳細分析
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="tree-branch">
                          <div className="branch-connector"></div>
                          <div className="branch-node">
                            <div className="branch-header">LLM 模型判斷</div>
                            <LlmAnalysis data={analysisResult?.models?.llm} />
                            <div className="branch-actions">
                              <button
                                className="detail-btn llm-btn"
                                onClick={() => {
                                  console.log('LLM data:', analysisResult?.models?.llm);
                                  onOpenAnalysis && onOpenAnalysis('llm', analysisResult?.models?.llm);
                                }}
                              >
                                詳細分析
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="tree-branch">
                          <div className="branch-connector"></div>
                          <div className="branch-node">
                            <div className="branch-header">SLM 模型判斷</div>
                            <SlmAnalysis data={analysisResult?.models?.slm} />
                            <div className="branch-actions">
                              <button
                                className="detail-btn slm-btn"
                                onClick={() => {
                                  console.log('SLM data:', analysisResult?.models?.slm);
                                  onOpenAnalysis && onOpenAnalysis('slm', analysisResult?.models?.slm);
                                }}
                              >
                                詳細分析
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 最新查證 */}
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
      </div>
    </>
  )
}

export default FactCheck