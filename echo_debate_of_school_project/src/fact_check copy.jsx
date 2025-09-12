import { useState } from 'react'
import './css/fact_check.css'
import './css/header.css'
import './css/debateCourt.css'
import './css/llm.css'
import './css/slm.css'
import { BsNewspaper } from "react-icons/bs"
import { MdOutlineHistoryToggleOff } from "react-icons/md"
import { MdAnalytics } from "react-icons/md"
import { GiTribunalJury } from "react-icons/gi"
import N8nAnalysis from './n8n'
import LlmAnalysis from './llm'
import SlmAnalysis from './slm'

{/* FactCheck */ }
function FactCheck({ searchQuery, factChecks, setSearchQuery, onOpenAnalysis, onStartRealTimeAnalysis }) {
  const [searchInput, setSearchInput] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  // 模擬搜索功能
  const handleSearch = () => {
    if (!searchInput.trim()) return
    
    setIsSearching(true)
    
    // 模拟API調用延遲延遲
    setTimeout(() => {
      setAnalysisResult({
        newsCorrectness: Math.random() > 0.5 ? '真實' : '假消息',
        ambiguityScore: Math.floor(Math.random() * 100),
        analysis: '根據多個可靠來源的交叉驗證，此消息的真實性存在爭議。專家意見分歧，需要進一步調查。',
        references: [
          'https://example.com/reference1',
          'https://example.com/reference2',
          'https://example.com/reference3'
        ],
        models: {
          n8n: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '新聞內容與摘要一致，提供了貨到付款詐騙退貨退款的相關步驟，並提及官方回應及爭議點，支持了輸入文本的真實性。'
          },
          llm: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '大型語言模型基於語料判讀，觀點偏中立，對來源可信度持審慎態度。\n\n\n\n'
          },
          slm: {
            correctness: Math.floor(Math.random() * 100),
            truthfulness: Math.floor(Math.random() * 100),
            perspective: '小型模型根據關鍵特徵比對，指出部分敘述缺乏佐證。'
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
      })
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
              {/* <button 
                className="realtime-button" 
                onClick={onStartRealTimeAnalysis}
              >
                實時分析
              </button> */}
            </div>
          </div>
        </div>

        {/* 分析結果區域 */}
        {analysisResult && (
          <div className="analysis-section">
            <h2 className="section-title"><MdAnalytics /> 分析結果</h2>
            
            {/* 分析摘要 */}
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
                        style={{width: `${analysisResult.ambiguityScore}%`}}
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
                        <div className="branch-header">N8N 模型</div>
                        <N8nAnalysis data={analysisResult?.models?.n8n} />
                      </div>
                    </div>
                    <div className="tree-branch">
                      <div className="branch-connector"></div>
                      <div className="branch-node">
                        <div className="branch-header">LLM 模型</div>
                        <LlmAnalysis data={analysisResult?.models?.llm} />
                      </div>
                    </div>
                    <div className="tree-branch">
                      <div className="branch-connector"></div>
                      <div className="branch-node">
                        <div className="branch-header">SLM 模型</div>
                        <SlmAnalysis data={analysisResult?.models?.slm} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="references">
                <h3>參考網址</h3>
                <ul>
                  {analysisResult.references.map((ref, index) => (
                    <li key={index}>
                      <a href={ref} target="_blank" rel="noopener noreferrer">
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 辯論法庭系統 */}
        {analysisResult && (
          <div className="debate-court-section">
            <h2 className="section-title">⚖️ 辯論法庭系統</h2>
            
            <div className="court-layout">
              {/* 檢察官區域 */}
              <div className="prosecution-area">
                <div className="role-header prosecution">
                  <h3>☺ 正方</h3>
                </div>
                <div className="debate-messages">
                  {analysisResult.debate.prosecution.map((msg, index) => (
                    <div key={index} className="message prosecution-msg">
                      <div className="message-header">
                        <span className="speaker">{msg.speaker}</span>
                        <span className="timestamp">{msg.timestamp}</span>
                      </div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 辯護律師區域 */}
              <div className="defense-area">
                <div className="role-header defense">
                  <h3>☹ 反方</h3>
                </div>
                <div className="debate-messages">
                  {analysisResult.debate.defense.map((msg, index) => (
                    <div key={index} className="message defense-msg">
                      <div className="message-header">
                        <span className="speaker">{msg.speaker}</span>
                        <span className="timestamp">{msg.timestamp}</span>
                      </div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 法官判決區域 */}
              <div className="judge-area">
                <div className="role-header judge">
                  <h3><GiTribunalJury /> 法官判決</h3>
                </div>
                <div className="judgment-content">
                  <div className="judgment-text">
                    <p>{analysisResult.debate.judge.verdict}</p>
                  </div>
                  <div className="confidence-meter">
                    <span>判決信心度</span>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{width: `${analysisResult.debate.judge.confidence}%`}}
                      ></div>
                    </div>
                    <span>{analysisResult.debate.judge.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
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