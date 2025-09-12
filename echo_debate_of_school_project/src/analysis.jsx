import './css/fact_check.css'
import './css/debateCourt.css'
import './css/llm.css'
import './css/slm.css'
import { IoArrowBack } from 'react-icons/io5'
import { GiTribunalJury } from "react-icons/gi"

function Analysis({ modelKey, data, onBack }) {
  console.log('Analysis received data:', data);
  console.log('Analysis modelKey:', modelKey);

  if (!data) {
    return (
      <div className="main-content-area">
        <div className="analysis-section">
          <h2 className="section-title">未找到分析資料</h2>
          <p>請從事實查核頁面選擇 n8n / slm / llm 進入。</p>
        </div>
      </div>
    )
  }

  const titleMap = {
    n8n: '辯論法庭系統分析',
    slm: 'SLM 模型分析',
    llm: 'LLM 模型分析',
  }

  // 根據模型類型渲染不同的內容
  const renderModelContent = () => {
    if (modelKey === 'n8n') {
      // 法庭辯論內容
      return (
        <div className="debate-court-section">
          <div className="court-layout">
            {/* 法官判決區域 */}
            <div className="judge-area">
              <div className="role-header judge">
                <h3><GiTribunalJury /> 最終法官判決</h3>
              </div>
              <div className="judgment-content">
                <div className="judgment-text">
                  <p>{data.debate?.judge?.verdict || '無判決資料'}</p>
                </div>
                <div className="confidence-meter">
                  <span>判決信心度</span>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${data.debate?.judge?.confidence || 0}%` }}
                    ></div>
                  </div>
                  <span>{data.debate?.judge?.confidence || 0}%</span>
                </div>
              </div>
            </div>

            {/* 檢察官區域 */}
            <div className="prosecution-area">
              <div className="role-header prosecution">
                <h3>☺ 正方辯護</h3>
              </div>
              <div className="debate-messages">
                {data.debate?.prosecution?.map((msg, index) => (
                  <div key={index} className="message prosecution-msg">
                    <div className="message-header">
                      <span className="speaker">{msg.speaker}</span>
                      <span className="timestamp">{msg.timestamp}</span>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>
                )) || []}
              </div>
            </div>

            {/* 辯護律師區域 */}
            <div className="defense-area">
              <div className="role-header defense">
                <h3>☹ 反方質疑</h3>
              </div>
              <div className="debate-messages">
                {data.debate?.defense?.map((msg, index) => (
                  <div key={index} className="message defense-msg">
                    <div className="message-header">
                      <span className="speaker">{msg.speaker}</span>
                      <span className="timestamp">{msg.timestamp}</span>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      // LLM/SLM 模型內容
      return (
        <>
          <div className="summary-grid">
            <div className="summary-item">
              <h3>正確性</h3>
              <div className="ambiguity-score">
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${data?.correctness ?? 0}%` }}></div>
                </div>
                <span>{data?.correctness ?? 0}%</span>
              </div>
            </div>
            <div className="summary-item">
              <h3>真實性分數</h3>
              <div className="ambiguity-score">
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${data?.truthfulness ?? 0}%` }}></div>
                </div>
                <span>{data?.truthfulness ?? 0}%</span>
              </div>
            </div>
          </div><p />

          <div className="analysis-text">
            <h3>觀點分析</h3>
            <p>{data?.perspective || '無資料'}</p>
          </div><p />

          {/* 參考網址 */}
          {data?.references && data.references.length > 0 ? (
            <div className="references">
              <h3>參考網址</h3>
              <ul>
                {data.references.map((ref, index) => (
                  <li key={index}>
                    <a href={ref} target="_blank" rel="noopener noreferrer">
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="references">
              <h3>參考網址</h3>
              <p>無相關新聞內容</p>
            </div>
          )}
        </>
      )
    }
  }

  return (
    <div className="main-content-area">
      <div className="analysis-section">
        <div className="analysis-header">
          <button className="back-button" onClick={onBack}>
            <IoArrowBack className="back-icon" />
            返回事實查核
          </button>
          <h2 className="section-title">{titleMap[modelKey] || '模型分析'}</h2>
        </div>

        {renderModelContent()}
      </div>
    </div>
  )
}

export default Analysis


