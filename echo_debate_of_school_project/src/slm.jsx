import './css/fact_check.css'
import './css/slm.css'

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

function SlmAnalysis({ data }) {
  if (!data) return null;

  // 從數據中提取各個模型的結果
  const classification = data.classification_json || {};
  
  console.log('SLM Analysis - classification:', classification);
  console.log('SLM Analysis - classification.classification:', classification.classification);
  console.log('SLM Analysis - classification.Probability:', classification.Probability);
  
  return (
    <div className="slm-analysis">
      <div className="summary-grid">
        <div className="summary-item">
          <h3>消息查核</h3>
          <div className="verification-result">
            <span className={`verification-badge ${getCredibilityLevel(parseFloat(classification.Probability) || 0).includes('高') ? 'correct' : 'incorrect'}`}>
              {getCredibilityLevel(parseFloat(classification.Probability) || 0)}
            </span>
          </div>
        </div>
        <div className="summary-item">
          <h3>消息可信度</h3>
          <div className="probability-score">
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${(parseFloat(classification.Probability) || 0) * 100}%` }}></div>
            </div>
            <span>{((parseFloat(classification.Probability) || 0) * 100).toFixed(2)}%</span>
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

export default SlmAnalysis