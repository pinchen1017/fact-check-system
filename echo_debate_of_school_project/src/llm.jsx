import './css/fact_check.css'
import './css/llm.css'

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

function LlmAnalysis({ data }){
  if (!data) return null;

  // 從數據中提取各個模型的結果
  const weightCalculation = data.weight_calculation_json || {};
  const llmData = data?.organizedData?.llm;
  const factCheckResult = llmData?.fact_check_result || data?.fact_check_result_json || {};
  const groundingUrls = llmData?.grounding_urls || [];
  
  // 調試信息
  console.log('LLM Analysis - data:', data);
  console.log('LLM Analysis - llmData:', llmData);
  console.log('LLM Analysis - factCheckResult:', factCheckResult);
  console.log('LLM Analysis - groundingUrls:', groundingUrls);
  console.log('LLM Analysis - data.fact_check_result_json:', data?.fact_check_result_json);
  
  return (
    <div className="llm-analysis">
      <div className="summary-grid">
        <div className="summary-item">
          <h3>消息查核</h3>
          <div className="verification-result">
            <span className={`verification-badge ${getCredibilityLevel(weightCalculation.llm_score || 0).includes('高') ? 'correct' : 'incorrect'}`}>
              {getCredibilityLevel(weightCalculation.llm_score || 0)}
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

      {/* 調試信息
      <div style={{margin: '10px 0', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px'}}>
        <strong>調試信息：</strong><br/>
        groundingUrls.length: {groundingUrls.length}<br/>
        groundingUrls: {JSON.stringify(groundingUrls, null, 2)}
      </div> */}

      {groundingUrls.length > 0 ? (
        <div className="reference-sources">
          <h3>參考資料</h3>
          <ol className="sources-list">
            {groundingUrls.map((source, index) => (
              <li key={index} className="source-item">
                <div className="source-info">
                  <span className="source-title">{source.title !== source.domain ? source.title : source.domain}</span>
                  {source.searchQuery && (
                    <span className="source-query">相關查詢: {source.searchQuery}</span>
                  )}
                </div>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  查看原文
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="reference-sources">
          <h3>參考資料</h3>
          <p>暫無參考資料</p>
        </div>
      )}
    </div>
  )
}

export default LlmAnalysis