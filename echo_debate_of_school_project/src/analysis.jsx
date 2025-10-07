import './css/fact_check.css'
import './css/debateCourt.css'
import './css/llm.css'
import './css/slm.css'
import { IoArrowBack } from 'react-icons/io5'
import DebateCourt from './debateCourt'
import LlmAnalysis from './llm'
import SlmAnalysis from './slm'

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

  // 從數據中提取各個模型的結果（僅用於overall分析）
  const weightCalculation = data.weight_calculation_json || {};
  
  console.log('Analysis - data:', data);
  console.log('Analysis - modelKey:', modelKey);

  // 計算消息查證結果（僅用於overall分析）
  const messageVerification = getCredibilityLevel(weightCalculation.final_score || 0);
  const credibilityScore = Math.round((weightCalculation.final_score || 0) * 100);

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
                <h4>消息查核</h4>
                <div className={`verification-badge ${messageVerification.includes('高') ? 'correct' : 'incorrect'}`}>
                  {messageVerification}
                </div>
                <p>基於 final_score 可信度評級</p>
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
                  <span>陪審團分數 (原始):</span>
                  <span>{weightCalculation.jury_score || 0}</span>
                </div>
                <div className="detail-item">
                  <span>陪審團分數 (轉換後):</span>
                  <span>{convertN8nScore(weightCalculation.jury_score || 0).toFixed(4)}</span>
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
      return <DebateCourt data={data} />
    } else if (modelKey === 'llm') {
      // LLM 模型分析
      return <LlmAnalysis data={data} />
    } else if (modelKey === 'slm') {
      // SLM 模型分析
      return <SlmAnalysis data={data} />
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


