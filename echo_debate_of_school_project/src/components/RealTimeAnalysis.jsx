import React, { useState, useEffect } from 'react';
import { useAnalysisAPI, extractParamsFromURL, formatAnalysisResult } from '../hooks/useAnalysisAPI';
import './analysis.css';

const RealTimeAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [currentRunId, setCurrentRunId] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [showInput, setShowInput] = useState(true);

  // 從URL參數中提取runId和token
  useEffect(() => {
    const { runId, token } = extractParamsFromURL();
    if (runId && token) {
      setCurrentRunId(runId);
      setCurrentToken(token);
      setShowInput(false);
    }
  }, []);

  const {
    analysisData,
    status,
    progress,
    error,
    isConnected,
    createAnalysis
  } = useAnalysisAPI(currentRunId, currentToken);

  // 處理新分析請求
  const handleCreateAnalysis = async () => {
    if (!inputText.trim()) return;
    
    try {
      const result = await createAnalysis(inputText);
      setCurrentRunId(result.run_id);
      setCurrentToken(result.deep_link.split('t=')[1]);
      setShowInput(false);
      
      // 更新URL但不刷新頁面
      const newUrl = `/r/${result.run_id}?t=${result.deep_link.split('t=')[1]}`;
      window.history.pushState({}, '', newUrl);
      
    } catch (err) {
      console.error('創建分析失敗:', err);
    }
  };

  // 重置分析
  const handleReset = () => {
    setCurrentRunId(null);
    setCurrentToken(null);
    setShowInput(true);
    setInputText('');
    window.history.pushState({}, '', '/');
  };

  const formattedData = formatAnalysisResult(analysisData);

  return (
    <div className="real-time-analysis">
      <div className="analysis-header">
        <h1>事實查核分析系統</h1>
        <div className="status-indicator">
          <div className={`status-badge ${status}`}>
            {status === 'loading' && '分析中'}
            {status === 'running' && '進行中'}
            {status === 'done' && '完成'}
            {status === 'creating' && '創建中'}
          </div>
          {isConnected && <div className="connection-indicator">實時更新中</div>}
        </div>
      </div>

      {showInput ? (
        <div className="input-section">
          <h2>輸入要查核的內容</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="請輸入要進行事實查核的新聞內容或消息..."
            rows={6}
            className="analysis-input"
          />
          <button 
            onClick={handleCreateAnalysis}
            disabled={!inputText.trim() || status === 'creating'}
            className="create-analysis-btn"
          >
            {status === 'creating' ? '創建中...' : '開始分析'}
          </button>
        </div>
      ) : (
        <>
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>

          {error && (
            <div className="error-message">
              <h3>錯誤</h3>
              <p>{error}</p>
              <button onClick={handleReset} className="reset-btn">重新開始</button>
            </div>
          )}

          {formattedData && (
            <div className="analysis-results">
              <div className="result-header">
                <h2>分析結果</h2>
                <button onClick={handleReset} className="reset-btn">新分析</button>
              </div>

              <div className="result-summary">
                <div className="summary-card">
                  <h3>消息正確性</h3>
                  <div className={`correctness-badge ${formattedData.newsCorrectness}`}>
                    {formattedData.newsCorrectness}
                  </div>
                </div>
                <div className="summary-card">
                  <h3>模糊度分數</h3>
                  <div className="score-display">
                    {formattedData.ambiguityScore}%
                  </div>
                </div>
              </div>

              <div className="analysis-content">
                <h3>分析內容</h3>
                <p>{formattedData.analysis}</p>
              </div>

              {formattedData.references && formattedData.references.length > 0 && (
                <div className="references-section">
                  <h3>參考來源</h3>
                  <ul>
                    {formattedData.references.map((ref, index) => (
                      <li key={index}>
                        <a href={ref} target="_blank" rel="noopener noreferrer">
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {formattedData.models && Object.keys(formattedData.models).length > 0 && (
                <div className="models-section">
                  <h3>模型分析</h3>
                  <div className="models-grid">
                    {Object.entries(formattedData.models).map(([modelName, modelData]) => (
                      <div key={modelName} className="model-card">
                        <h4>{modelName.toUpperCase()}</h4>
                        <div className="model-scores">
                          <div className="score-item">
                            <span>正確性: {modelData.correctness}%</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ width: `${modelData.correctness}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="score-item">
                            <span>真實性: {modelData.truthfulness}%</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ width: `${modelData.truthfulness}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="model-perspective">
                          <p>{modelData.perspective}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formattedData.debate && (
                <div className="debate-section">
                  <h3>辯論過程</h3>
                  
                  <div className="debate-sides">
                    <div className="prosecution">
                      <h4>正方觀點</h4>
                      {formattedData.debate.prosecution?.map((item, index) => (
                        <div key={index} className="debate-message">
                          <span className="speaker">{item.speaker}</span>
                          <span className="timestamp">{item.timestamp}</span>
                          <p>{item.message}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="defense">
                      <h4>反方觀點</h4>
                      {formattedData.debate.defense?.map((item, index) => (
                        <div key={index} className="debate-message">
                          <span className="speaker">{item.speaker}</span>
                          <span className="timestamp">{item.timestamp}</span>
                          <p>{item.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formattedData.debate.judge && (
                    <div className="judge-verdict">
                      <h4>法官判決</h4>
                      <div className="verdict-content">
                        <p>{formattedData.debate.judge.verdict}</p>
                        <div className="confidence-score">
                          信心度: {formattedData.debate.judge.confidence}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RealTimeAnalysis;
