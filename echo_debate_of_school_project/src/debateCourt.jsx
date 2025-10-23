import { useState } from 'react'
import './css/fact_check.css'
import './css/debateCourt.css'
import './css/newspaper.css'
import { GiTribunalJury } from "react-icons/gi"
import { MdTimeline, MdGavel, MdAssessment, MdPeople, MdAccountBalance, MdGroups } from "react-icons/md"
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaGavel, FaUsers, FaBrain, FaChartLine, FaExternalLinkAlt } from "react-icons/fa"
import { HiAcademicCap, HiAdjustmentsHorizontal, HiChatBubbleLeftRight, HiClipboardDocumentList, HiBolt } from "react-icons/hi2"
import { AiTwotoneSmile, AiTwotoneFrown } from "react-icons/ai";
// 新聞報紙版元件
import NewspaperView from './components/NewspaperView'

// 可信度徽章計算函數
const computeTrustBadge = (data) => {
  const finalReport = data?.final_report_json || {};
  const weightCalculation = data?.weight_calculation_json || {};
  
  // 優先使用 final_report_json.jury_score
  let credibilityScore = finalReport.jury_score;
  
  // 如果沒有，嘗試從 weight_calculation_json 獲取
  if (typeof credibilityScore !== 'number') {
    credibilityScore = weightCalculation.jury_score;
  }
  
  // 如果還是沒有，嘗試映射 judge_score (-1~+1 到 0~100)
  if (typeof credibilityScore !== 'number') {
    const judgeScore = weightCalculation.judge_score;
    if (typeof judgeScore === 'number') {
      credibilityScore = Math.round((judgeScore + 1) * 50);
    }
  }
  
  if (typeof credibilityScore === 'number') {
    return {
      label: credibilityScore > 50 ? '勝訴' : (credibilityScore < 50 ? '敗訴' : '未定'),
      value: credibilityScore
    };
  }
  
  return { label: '未定', value: null };
};

// 提取Header數據
const selectHeaderData = (data) => {
  const finalReport = data?.final_report_json || {};
  const trust = computeTrustBadge(data);
  
  return {
    topic: finalReport.topic || '未命名主題',
    credibilityScore: trust.value,
    credibilityLabel: trust.label,
    overallAssessment: finalReport.overall_assessment || finalReport.jury_brief,
    verdictText: finalReport.jury_brief
  };
};

// Header組件 - 使用與fact_check.jsx相同的標籤樣式
function HeaderTopDown({ data }) {
  const headerData = selectHeaderData(data);
  const { topic, credibilityScore, credibilityLabel, overallAssessment, verdictText } = headerData;

  return (
    <div className="debate-header-section">
      <div className="container">
        <div className="debate-header-content">
          {/* 可信度徽章和分數 - 使用與fact_check.jsx相同的樣式 */}
          <div className="credibility-section">
            <div className={`verification-badge ${credibilityLabel === '勝訴' ? 'correct' : credibilityLabel === '敗訴' ? 'incorrect' : 'unknown'}`}>
              {credibilityLabel === '勝訴' && <FaCheckCircle className="badge-icon" />}
              {credibilityLabel === '敗訴' && <FaTimesCircle className="badge-icon" />}
              {credibilityLabel === '未定' && <FaQuestionCircle className="badge-icon" />}
              {credibilityLabel}
            </div>
          </div>

          {/* 主題 */}
          <h1 className="debate-title">{topic}</h1>
          
          {/* Judge結論 */}
          {overallAssessment && (
            <p className="judge-conclusion">{overallAssessment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Timeline分頁 - 顯示辯論流程時間線
function TimelinePanel({ data }) {
  const events = data?.raw?.events || [];
  const finalReport = data?.final_report_json || {};
  const keyContentions = finalReport.stake_summaries || [];
  
  return (
    <div className="timeline-section">
      <div className="container">
        <div className="section-header">
          <h2><MdTimeline /> 辯論流程時間線</h2>
          <p className="section-subtitle">完整的辯論過程記錄與主要爭點</p>
        </div>
        
        <div className="timeline-content">
          {/* 主要爭點 */}
          {keyContentions.length > 0 && (
            <div className="contentions-overview">
              <h3>主要爭點</h3>
              <div className="contentions-grid">
                {keyContentions.map((contention, index) => (
                  <div key={index} className="contention-card">
                    <div className="contention-header">
                      <h4>{contention.side === 'Advocate' ? '正方' : 
                           contention.side === 'Skeptic' ? '反方' : 
                           contention.side === 'Devil' ? '魔鬼代言人' : contention.side}</h4>
                      <span className="role-badge">
                        {contention.side === 'Advocate' ? '正方' : 
                         contention.side === 'Skeptic' ? '反方' : 
                         contention.side === 'Devil' ? '魔鬼代言人' : contention.side}
                      </span>
                    </div>
                    
                    {contention.thesis && (
                      <p className="contention-thesis">{contention.thesis}</p>
                    )}
                    
                    {contention.strongest_points && contention.strongest_points.length > 0 && (
                      <div className="contention-points">
                        <h5>主要論點：</h5>
                        <ul>
                          {contention.strongest_points.slice(0, 3).map((point, pointIndex) => (
                            <li key={pointIndex}>{point}</li>
                          ))}
                          {contention.strongest_points.length > 3 && (
                            <li>...還有 {contention.strongest_points.length - 3} 個論點</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 事件時間線 */}
          {events.length > 0 ? (
            <div className="events-timeline">
              <h3>辯論事件記錄</h3>
              <div className="timeline-list">
                {events.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-meta">
                      <span className="timeline-author">{event.author || '未知'}</span>
                      <span className="timeline-time">
                        {new Date(event.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                    {event.content?.parts?.[0]?.text && (
                      <div className="timeline-content-text">
                        <p>{event.content.parts[0].text.substring(0, 300)}
                          {event.content.parts[0].text.length > 300 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>暫無辯論流程記錄</p>
            </div>
          )}
        </div>
            </div>
          </div>
  );
}

// Courtroom分頁 - 新聞辯論法庭
function CourtroomPanel({ data }) {
  const finalReport = data?.final_report_json || {};
  const groundingChunks = data?.groundingChunks || [];
  const keyContentions = finalReport.stake_summaries || [];
  const juryResult = data?.jury_result || {};
  const social = data?.social || {};
  
  return (
    <div className="courtroom-section">
      <div className="container">
        <div className="section-header">
          <h2><FaGavel /> 新聞辯論法庭</h2>
          <p className="section-subtitle">主辯、檢察官查核、最終法官裁決、民眾視角</p>
        </div>

        <div className="courtroom-content">
          {/* 1. 主辯 - 正方反方辯論 */}
          <div className="main-debate-section">
            <h3><HiChatBubbleLeftRight /> 主辯</h3>
            <div className="debate-layout">
              {/* 正方 */}
              <div className="debate-side advocate-side">
                <h4><AiTwotoneSmile />&nbsp;正方</h4>
                {keyContentions.find(c => c.side === 'Advocate') && (
                  <div className="debate-content">
                    <p className="thesis">{keyContentions.find(c => c.side === 'Advocate').thesis}</p>
                    <div className="points">
                      <h5>主要論點：</h5>
                      <ul>
                        {keyContentions.find(c => c.side === 'Advocate').strongest_points?.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    {keyContentions.find(c => c.side === 'Advocate').weaknesses?.length > 0 && (
                      <div className="weaknesses">
                        <h5>弱點：</h5>
                        <ul>
                          {keyContentions.find(c => c.side === 'Advocate').weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 反方 */}
              <div className="debate-side skeptic-side">
                <h4>反方</h4>
                {keyContentions.find(c => c.side === 'Skeptic') && (
                  <div className="debate-content">
                    <p className="thesis">{keyContentions.find(c => c.side === 'Skeptic').thesis}</p>
                    <div className="points">
                      <h5>主要論點：</h5>
                      <ul>
                        {keyContentions.find(c => c.side === 'Skeptic').strongest_points?.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    {keyContentions.find(c => c.side === 'Skeptic').weaknesses?.length > 0 && (
                      <div className="weaknesses">
                        <h5>弱點：</h5>
                        <ul>
                          {keyContentions.find(c => c.side === 'Skeptic').weaknesses.map((weakness, index) => (
                            <li key={index}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 2. 檢察官查核 - 查核資料 */}
          <div className="prosecutor-section">
            <h3><HiClipboardDocumentList /> 檢察官查核</h3>
            <div className="grounding-chunks">
              {groundingChunks.length > 0 ? (
                groundingChunks.map((chunk, index) => (
                  <div key={index} className="grounding-block">
                    <div className="grounding-header">
                      <h4>{chunk.web?.title || '未知標題'}</h4>
                      <span className="domain-badge">{chunk.web?.domain || '未知來源'}</span>
                    </div>
                    {chunk.web?.uri && (
                      <a 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="grounding-link"
                      >
                        <FaExternalLinkAlt /> 查看原文
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>暫無查核資料</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 3. 最終法官裁決 */}
          <div className="judge-section">
            <h3><MdAccountBalance /> 最終法官裁決</h3>
            
            {/* 四維評分 */}
            {juryResult.scores && (
              <div className="jury-scores">
                <h4>四維評分</h4>
                <div className="scores-grid">
                  <div className="score-item">
                    <span className="score-label">證據品質</span>
                    <span className="score-value">{juryResult.scores.evidence_quality || 0}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">邏輯嚴謹</span>
                    <span className="score-value">{juryResult.scores.logical_rigor || 0}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">穩健性</span>
                    <span className="score-value">{juryResult.scores.robustness || 0}</span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">社會影響</span>
                    <span className="score-value">{juryResult.scores.social_impact || 0}</span>
                  </div>
                  <div className="score-item total-score">
                    <span className="score-label">總分</span>
                    <span className="score-value">{juryResult.scores.total || 0}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 判決結果 */}
            {juryResult.verdict && (
              <div className="verdict-result">
                <h4>判決結果</h4>
                <p className="verdict-text">{juryResult.verdict}</p>
                <div className={`verdict-badge ${juryResult.verdict_result === '正方' ? 'advocate' : 'skeptic'}`}>
                  {juryResult.verdict_result}
                </div>
              </div>
            )}
            
            {/* 證據摘要 */}
            {data?.evidence_checked && (
              <div className="evidence-summary">
                <h4>證據摘要</h4>
                <div className="evidence-content">
                  {Array.isArray(data.evidence_checked) ? (
                    <ul>
                      {data.evidence_checked.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{data.evidence_checked}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 4. 民眾視角 - 社會擾動 */}
          <div className="public-section">
            <h3><MdGroups /> 民眾視角</h3>
            <div className="social-disturbance">
              {social.disrupter && (
                <div className="disturbance-item">
                  <h4>擾動者</h4>
                  <p>{social.disrupter}</p>
                </div>
              )}
              
              {social.influencer_1 && (
                <div className="disturbance-item">
                  <h4>影響者1</h4>
                  <p>{social.influencer_1}</p>
                </div>
              )}
              
              {social.influencer_2 && (
                <div className="disturbance-item">
                  <h4>影響者2</h4>
                  <p>{social.influencer_2}</p>
                </div>
              )}
              
              {social.echo_chamber && (
                <div className="disturbance-item">
                  <h4>回音室</h4>
                  <p>{social.echo_chamber}</p>
                </div>
              )}
              
              {!social.disrupter && !social.influencer_1 && !social.influencer_2 && !social.echo_chamber && (
                <div className="empty-state">
                  <p>暫無社會擾動分析資料</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jury分頁 - 辯論角色圖卡
function JuryPanel({ data }) {
  const finalReport = data?.final_report_json || {};
  const weightCalculation = data?.weight_calculation_json || {};
  const keyContentions = finalReport.stake_summaries || [];
  
  // 統計角色出現次數
  const roleStats = keyContentions.reduce((acc, contention) => {
    const role = contention.side === 'Advocate' ? '正方' : 
                 contention.side === 'Skeptic' ? '反方' : 
                 contention.side === 'Devil' ? '魔鬼代言人' : contention.side;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="jury-section">
      <div className="container">
        <div className="section-header">
          <h2><GiTribunalJury /> 辯論角色圖卡</h2>
          <p className="section-subtitle">所有角色的名字、立場、出現次數</p>
        </div>
        
        <div className="jury-content">
          {/* 角色統計 */}
          <div className="role-stats">
            <h3>角色統計</h3>
            <div className="stats-grid">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="stat-card">
                  <h4>{role}</h4>
                  <div className="stat-count">{count} 次</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 詳細角色資訊 */}
          <div className="role-details">
            <h3>詳細角色資訊</h3>
            <div className="roles-grid">
              {keyContentions.map((contention, index) => {
                const roleName = contention.side === 'Advocate' ? '正方' : 
                                contention.side === 'Skeptic' ? '反方' : 
                                contention.side === 'Devil' ? '魔鬼代言人' : contention.side;
                
                return (
                  <div key={index} className="role-card">
                    <div className="role-header">
                      <h4>{roleName}</h4>
                      <span className="role-badge">{roleName}</span>
                    </div>
                    
                    {contention.thesis && (
                      <div className="role-thesis">
                        <h5>立場</h5>
                        <p>{contention.thesis}</p>
                      </div>
                    )}
                    
                    {contention.strongest_points && contention.strongest_points.length > 0 && (
                      <div className="role-points">
                        <h5>主要論點 ({contention.strongest_points.length} 個)</h5>
                        <ul>
                          {contention.strongest_points.slice(0, 3).map((point, pointIndex) => (
                            <li key={pointIndex}>{point}</li>
                          ))}
                          {contention.strongest_points.length > 3 && (
                            <li>...還有 {contention.strongest_points.length - 3} 個論點</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {contention.weaknesses && contention.weaknesses.length > 0 && (
                      <div className="role-weaknesses">
                        <h5>弱點 ({contention.weaknesses.length} 個)</h5>
                        <ul>
                          {contention.weaknesses.slice(0, 2).map((weakness, weaknessIndex) => (
                            <li key={weaknessIndex}>{weakness}</li>
                          ))}
                          {contention.weaknesses.length > 2 && (
                            <li>...還有 {contention.weaknesses.length - 2} 個弱點</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 評審分數 */}
          <div className="jury-scores">
            <h3>評審分數</h3>
            <div className="scores-card">
              <div className="scores-list">
                <div className="score-item">
                  <span className="score-label">LLM評分</span>
                  <span className="score-value">{weightCalculation.llm_score || 'N/A'}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">SLM評分</span>
                  <span className="score-value">{weightCalculation.slm_score || 'N/A'}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">陪審團評分</span>
                  <span className="score-value">{weightCalculation.jury_score || 'N/A'}</span>
                </div>
                <div className="score-item final-score">
                  <span className="score-label">最終評分</span>
                  <span className="score-value">{weightCalculation.final_score || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 判決摘要 */}
          <div className="jury-summary">
            <h3>判決摘要</h3>
            <div className="summary-content">
              <p>{finalReport.jury_brief || '無判決摘要'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Social分頁 - 社群擾動分析
function SocialPanel({ data }) {
  const social = data?.social || {};
  
  return (
    <div className="social-section">
      <div className="container">
        <div className="section-header">
          <h2><FaUsers /> 社群擾動分析</h2>
          <p className="section-subtitle">分析訊息在社群中的傳播與影響</p>
        </div>
        
        <div className="social-content">
          <div className="social-grid">
            {social.disrupter && (
              <div className="social-card">
                <div className="social-card-header">
                  <h3><HiBolt /> 擾動者</h3>
                </div>
                <div className="social-card-content">
                  <p>{social.disrupter}</p>
                </div>
              </div>
            )}
            
            {social.influencer_1 && (
              <div className="social-card">
                <div className="social-card-header">
                  <h3><FaUsers /> 影響者1</h3>
                </div>
                <div className="social-card-content">
                  <p>{social.influencer_1}</p>
                </div>
              </div>
            )}
            
            {social.influencer_2 && (
              <div className="social-card">
                <div className="social-card-header">
                  <h3><FaUsers /> 影響者2</h3>
                </div>
                <div className="social-card-content">
                  <p>{social.influencer_2}</p>
                </div>
              </div>
            )}
            
            {social.echo_chamber && (
              <div className="social-card">
                <div className="social-card-header">
                  <h3><HiChatBubbleLeftRight /> 回音室</h3>
                </div>
                <div className="social-card-content">
                  <p>{social.echo_chamber}</p>
                </div>
              </div>
            )}
          </div>
          
          {!social.disrupter && !social.influencer_1 && !social.influencer_2 && !social.echo_chamber && (
            <div className="empty-state">
              <p>暫無社群擾動分析資料</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 主要組件
function DebateCourt({ data }) {
  const [activeTab, setActiveTab] = useState('timeline');
  
  if (!data) return null;
  
  const tabs = [
    { id: 'timeline', label: '流程時間線', icon: MdTimeline },
    { id: 'courtroom', label: '新聞辯論法庭', icon: FaGavel },
    { id: 'jury', label: '辯論角色卡', icon: GiTribunalJury }
  ];

  // 錨點導航函數
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="debate-court-page">
      {/* 直接使用報紙版布局；需要保留舊分頁時，可改成條件渲染 */}
      <NewspaperView data={data} />
    </div>
  );
}

export default DebateCourt;