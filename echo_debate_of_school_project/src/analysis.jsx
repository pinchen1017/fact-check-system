import './css/fact_check.css'
import './css/debateCourt.css'
import './css/llm.css'
import './css/slm.css'
import { IoArrowBack } from 'react-icons/io5'
import { GiTribunalJury } from "react-icons/gi"
import slm from './assets/slm.jpg'
import { CiFaceFrown } from "react-icons/ci"
import { CiFaceSmile } from "react-icons/ci"

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
    overall: '整體結果分析',
  }

  // 從數據中提取各個模型的結果
  const weightCalculation = data.weight_calculation_json || {};
  const finalReport = data.final_report_json || {};
  const factCheckResult = data.fact_check_result_json || {};
  const classification = data.classification_json || {};
  
  console.log('Analysis - data:', data);
  console.log('Analysis - classification:', classification);
  console.log('Analysis - modelKey:', modelKey);
  console.log('Analysis - classification_json exists:', !!data.classification_json);
  console.log('Analysis - classification_json content:', data.classification_json);

  // 計算消息查證結果
  const messageVerification = weightCalculation.final_score >= 0.5 ? '正確' : '錯誤';
  const credibilityScore = Math.round((weightCalculation.final_score || 0) * 100);

  // 提取辯論觀點
  const advocatePoints = finalReport.stake_summaries?.find(s => s.side === 'Advocate')?.strongest_points || [];
  const skepticPoints = finalReport.stake_summaries?.find(s => s.side === 'Skeptic')?.strongest_points || [];
  
  console.log('finalReport:', finalReport);
  console.log('stake_summaries:', finalReport.stake_summaries);
  console.log('advocatePoints:', advocatePoints);
  console.log('skepticPoints:', skepticPoints);

  // 根據模型類型渲染不同的內容
  const renderModelContent = () => {
    if (modelKey === 'overall') {
      // 整體結果分析
      return (
        <div className="overall-analysis">
          <div className="overall-summary">
            <h3>整體結果</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <h4>消息查證</h4>
                <div className={`verification-badge ${messageVerification === '正確' ? 'correct' : 'incorrect'}`}>
                  {messageVerification}
                </div>
                <p>基於 final_score ≥ 0.5 判斷</p>
              </div>
              <div className="summary-item">
                <h4>消息可信度</h4>
                <div className="credibility-score">
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${credibilityScore}%` }}></div>
                  </div>
                  <span>{credibilityScore}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="comprehensive-analysis">
            <h3>綜合分析</h3>
            <div className="weight-calculation-details">
              <h4>權重計算詳情</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span>LLM 標籤:</span>
                  <span>{weightCalculation.llm_label || '無資料'}</span>
                </div>
                <div className="detail-item">
                  <span>LLM 分數:</span>
                  <span>{weightCalculation.llm_score || 0}</span>
                </div>
                <div className="detail-item">
                  <span>SLM 分數:</span>
                  <span>{weightCalculation.slm_score || 0}</span>
                </div>
                <div className="detail-item">
                  <span>陪審團分數:</span>
                  <span>{weightCalculation.jury_score || 0}</span>
                </div>
                <div className="detail-item">
                  <span>最終分數:</span>
                  <span className="final-score">{weightCalculation.final_score || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (modelKey === 'n8n') {
      // 辯論法庭系統分析
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
                  <p>{finalReport.jury_brief || '無判決資料'}</p>
                </div>
                {/* <div className="confidence-meter">
                  <span>判決信心度</span>
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{ width: `${finalReport.jury_score || 0}%` }}
                    ></div>
                  </div>
                  <span>{finalReport.jury_score || 0}%</span>
                </div> */}
              </div>
            </div>

            {/* 正方辯論觀點 */}
            <div className="prosecution-area">
              <div className="role-header prosecution">
                <h3><CiFaceSmile /> 正方辯論觀點</h3>
              </div>
              <div className="debate-messages">
                {advocatePoints.map((point, index) => (
                  <div key={index} className="message prosecution-msg">
                    <div className="message-content">{point}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 反方辯論觀點 */}
            <div className="defense-area">
              <div className="role-header defense">
                <h3><CiFaceFrown /> 反方辯論觀點</h3>
              </div>
              <div className="debate-messages">
                {skepticPoints.map((point, index) => (
                  <div key={index} className="message defense-msg">
                    <div className="message-content">{point}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    } else if (modelKey === 'llm') {
      // LLM 模型分析
      return (
        <div className="llm-analysis">
          <div className="summary-grid">
            <div className="summary-item">
              <h3>消息查證</h3>
              <div className="verification-result">
                <span className={`verification-badge ${weightCalculation.llm_label === '正確' ? 'correct' : 'incorrect'}`}>
                  {weightCalculation.llm_label || '無資料'}
                </span>
              </div>
            </div>
            <div className="summary-item">
              <h3>消息可信度</h3>
              <div className="credibility-score">
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${(weightCalculation.llm_score || 0) * 100}%` }}></div>
                </div>
                <span>{Math.round((weightCalculation.llm_score || 0) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="analysis-text">
            <h3>觀點分析</h3>
            <p>{factCheckResult.analysis || '無資料'}</p>
          </div>
        </div>
      )
    } else if (modelKey === 'slm') {
      // SLM 模型分析
      console.log('SLM Analysis - classification:', classification);
      console.log('SLM Analysis - classification.classification:', classification.classification);
      console.log('SLM Analysis - classification.Probability:', classification.Probability);
      
      return (
        <div className="slm-analysis">
          <div className="summary-grid">
            <div className="summary-item">
              <h3>消息查證</h3>
              <div className="verification-result">
                <span className={`verification-badge ${classification.classification === '正確' ? 'correct' : 'incorrect'}`}>
                  {classification.classification || '無資料'}
                </span>
              </div>
            </div>
            <div className="summary-item">
              <h3>消息可信度</h3>
              <div className="probability-score">
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${(parseFloat(classification.Probability) || 0) * 100}%` }}></div>
                </div>
                <span>{Math.round((parseFloat(classification.Probability) || 0) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="analysis-text">
            <h3>模型說明</h3>
            <p>收集7000多筆真假消息文本數據，並使用bert-base-chinese 將文本轉換成電腦看得懂的數據，這些數據代表文本的語意，並使用transformer的BertForSequenceClassification 去進行分類器的訓練。</p>
          </div>
        </div>
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


