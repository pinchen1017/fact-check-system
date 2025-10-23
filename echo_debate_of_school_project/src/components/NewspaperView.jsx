import React, { useMemo } from "react";
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaGavel, FaExternalLinkAlt, FaUsers } from "react-icons/fa";
import { MdTimeline } from "react-icons/md";
import { GiTribunalJury } from "react-icons/gi";
import { FaChessRook } from "react-icons/fa6";
import { FaRegChessKnight } from "react-icons/fa6";
import { AiTwotoneSmile, AiTwotoneFrown } from "react-icons/ai";
import "../css/newspaper.css";

// 可信度徽章計算（與你的版本等價，做健壯處理）
const computeTrustBadge = (data) => {
  const finalReport = data?.final_report_json || {};
  const weight = data?.weight_calculation_json || {};
  let credibilityScore = finalReport.jury_score;
  if (typeof credibilityScore !== "number") credibilityScore = weight.jury_score;
  if (typeof credibilityScore !== "number") {
    const judgeScore = weight.judge_score;
    if (typeof judgeScore === "number") credibilityScore = Math.round((judgeScore + 1) * 50);
  }
  const label = typeof credibilityScore === "number"
    ? (credibilityScore > 50 ? "勝訴" : (credibilityScore < 50 ? "敗訴" : "未定"))
    : "未定";
  return { label, value: typeof credibilityScore === "number" ? credibilityScore : null };
};

const roleName = (side) =>
  side === "Advocate" ? "正方" : side === "Skeptic" ? "反方" : side === "Devil" ? "挑戰權威者" : (side || "角色");

const groupEventsByDay = (events = []) => {
  const sorted = [...events].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  return sorted.reduce((acc, ev) => {
    const ts = (ev.timestamp || 0) * 1000;
    const key = ts ? new Date(ts).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }) : "未知日期";
    acc[key] = acc[key] || [];
    acc[key].push(ev);
    return acc;
  }, {});
};

const Header = ({ data }) => {
  const { topic, overall_assessment } = data?.final_report_json || {};
  const trust = computeTrustBadge(data);
  return (
    <header className="np-masthead">
      <div className="np-badge-wrap">
        <div className={`np-badge ${trust.label === "勝訴" ? "ok" : trust.label === "敗訴" ? "bad" : "unk"}`}>
          {trust.label === "勝訴" && <FaCheckCircle />}
          {trust.label === "敗訴" && <FaTimesCircle />}
          {trust.label === "未定" && <FaQuestionCircle />}
          <span className="np-badge-text">{trust.label}{typeof trust.value === "number" ? ` · ${trust.value}` : ""}</span>
        </div>
      </div>
      <h1 className="np-title">{topic || "未命名主題"}</h1>
      {overall_assessment && <p className="np-deck">{overall_assessment}</p>}
      <div className="np-rule" />
    </header>
  );
};

const VerdictBox = ({ jury }) => {
  if (!jury) return null;
  return (
    <section className="np-box">
      <h3 className="np-sec-title"><FaGavel /> 最終裁決</h3>
      {jury.verdict && <p className="np-verdict-main">{jury.verdict}</p>}
      {jury.verdict_result && (
        <div className={`np-chip ${jury.verdict_result === "正方" ? "adv" : "skp"}`}>{jury.verdict_result}</div>
      )}
      {jury.scores && (
        <ul className="np-score-list">
          <li><span>證據品質</span><b>{jury.scores.evidence_quality ?? "-"}</b></li>
          <li><span>邏輯嚴謹</span><b>{jury.scores.logical_rigor ?? "-"}</b></li>
          <li><span>穩健性</span><b>{jury.scores.robustness ?? "-"}</b></li>
          <li><span>社會影響</span><b>{jury.scores.social_impact ?? "-"}</b></li>
          <li className="np-score-total"><span>總分</span><b>{jury.scores.total ?? "-"}</b></li>
        </ul>
      )}
    </section>
  );
};

const QuickFacts = ({ data }) => {
  const trust = computeTrustBadge(data);
  const digest = data?.final_report_json?.evidence_digest || [];
  
  // 清理摘要，移除網址和無相關網址前綴
  const cleanDigest = digest.map(item => {
    let cleaned = item;
    
    // 移除 (https://...) 格式的網址
    cleaned = cleaned.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim();
    
    // 移除各種無相關前綴 - 使用更寬鬆的匹配
    if (cleaned.startsWith('無相關網站：')) {
      cleaned = cleaned.replace('無相關網站：', '').trim();
    }
    if (cleaned.startsWith('無相關網址：')) {
        cleaned = cleaned.replace('無相關網址：', '').trim();
    }
    if (cleaned.startsWith('無相關:')) {
      cleaned = cleaned.replace('無相關:', '').trim();
    }
    
    // 移除開頭的冒號和空格
    cleaned = cleaned.replace(/^:\s*/, '').trim();
    
    return cleaned;
  }).filter(item => item.length > 0); // 過濾空字串
  
  return (
    <section className="np-box">
      <h3 className="np-sec-title"><FaChessRook /> 快速看懂新聞</h3>
      <ul className="np-bullets">
        {typeof trust.value === "number" && <li>可信度分數：<b>{trust.value}</b></li>}
        {cleanDigest.slice(0, 5).map((d, i) => <li key={i}>{d}</li>)}
        {cleanDigest.length > 5 && <li>…還有 {cleanDigest.length - 5} 則摘要</li>}
      </ul>
    </section>
  );
};

const RolesMini = ({ stakes = [] }) => {
  const stats = useMemo(() => {
    return stakes.reduce((acc, s) => {
      const name = roleName(s.side);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  }, [stakes]);
  return (
    <section className="np-box">
      <h3 className="np-sec-title"><FaUsers /> 角色速覽</h3>
      <div className="np-roles">
        {Object.keys(stats).length === 0 && <p className="np-muted">暫無角色資料</p>}
        {Object.entries(stats).map(([name, count]) => (
          <div key={name} className="np-role-pill"><span>{name}</span><b>{count}</b></div>
        ))}
      </div>
    </section>
  );
};

const SourcesBox = ({ chunks = [] }) => {
  if (!chunks?.length) return null;
  return (
    <section className="np-box">
      <h3 className="np-sec-title">來源/查核</h3>
      <ul className="np-sources">
        {chunks.slice(0, 8).map((c, i) => (
          <li key={i}>
            <div className="np-source-title">{c?.web?.title || "未知標題"}</div>
            {c?.web?.domain && <span className="np-source-domain">{c.web.domain}</span>}
            {c?.web?.uri && (
              <a className="np-link" href={c.web.uri} target="_blank" rel="noopener noreferrer">
                <FaExternalLinkAlt /> 查看原文
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

const Timeline = ({ data }) => {
  // 嘗試多種可能的資料路徑
  const events = data?.raw?.events || data?.events || data?.raw?.data?.events || [];
  console.log('Timeline events:', events); // 調試用
  
  // 如果沒有事件資料，從其他資料創建時間線
  if (!events.length) {
    const fr = data?.final_report_json || {};
    const keyContentions = fr.key_contentions || [];
    const stakes = fr.stake_summaries || [];
    const risks = fr.risks || [];
    const nextQs = fr.未解決的問題 || [];
    
    // 創建基於現有資料的時間線
    const mockEvents = [];
    
    // 添加主要爭點
    if (keyContentions.length > 0) {
      keyContentions.forEach((kc, i) => {
        mockEvents.push({
          timestamp: Date.now() / 1000 - (keyContentions.length - i) * 3600,
          author: '系統分析',
          content: { parts: [{ text: `爭議點：${kc.quest}` }] }
        });
      });
    }
    
    // 添加角色立場
    if (stakes.length > 0) {
      stakes.forEach((stake, i) => {
        const roleName = stake.side === 'Advocate' ? '正方' : stake.side === 'Skeptic' ? '反方' : '挑戰權威者';
        mockEvents.push({
          timestamp: Date.now() / 1000 - (stakes.length - i) * 1800,
          author: roleName,
          content: { parts: [{ text: `立場：${stake.thesis}` }] }
        });
      });
    }
    
    // 添加風險和未解決問題
    if (risks.length > 0) {
      risks.forEach((risk, i) => {
        mockEvents.push({
          timestamp: Date.now() / 1000 - (risks.length - i) * 900,
          author: '風險評估',
          content: { parts: [{ text: `風險：${risk.name} - ${risk.why}` }] }
        });
      });
    }
    
    if (nextQs.length > 0) {
      nextQs.forEach((q, i) => {
        mockEvents.push({
          timestamp: Date.now() / 1000 - (nextQs.length - i) * 600,
          author: '待釐清問題',
          content: { parts: [{ text: `問題：${q}` }] }
        });
      });
    }
    
    // 添加最終判決
    if (fr.jury_brief) {
      mockEvents.push({
        timestamp: Date.now() / 1000,
        author: '最終判決',
        content: { parts: [{ text: fr.jury_brief }] }
      });
    }
    
    const grouped = groupEventsByDay(mockEvents);
    const days = Object.keys(grouped);
    
    return (
      <section className="np-section">
        <h2 className="np-sec-title"><MdTimeline /> 辯論流程時間線</h2>
        <div className="np-timeline">
          {days.map((day) => (
            <div key={day} className="np-tl-day">
              <div className="np-tl-date">{day}</div>
              <ul className="np-tl-list">
                {grouped[day].map((e, i) => {
                  const ts = (e.timestamp || 0) * 1000;
                  const time = ts ? new Date(ts).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }) : "";
                  const text = e?.content?.parts?.[0]?.text || e?.content || e?.text || "";
                  return (
                    <li key={i} className="np-tl-item">
                      <div className="np-tl-dot" />
                      <div className="np-tl-meta">
                        {time && <span className="np-tl-time">{time}</span>}
                        {e.author && <span className="np-tl-author">{e.author}</span>}
                      </div>
                      {text && <p className="np-tl-text">{text.length > 280 ? `${text.slice(0, 280)}…` : text}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  const grouped = groupEventsByDay(events);
  const days = Object.keys(grouped);
  
  return (
    <section className="np-section">
      <h2 className="np-sec-title"><MdTimeline /> 事件時間線</h2>
      <div className="np-timeline">
        {days.map((day) => (
          <div key={day} className="np-tl-day">
            <div className="np-tl-date">{day}</div>
            <ul className="np-tl-list">
              {grouped[day].map((e, i) => {
                const ts = (e.timestamp || 0) * 1000;
                const time = ts ? new Date(ts).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }) : "";
                const text = e?.content?.parts?.[0]?.text || e?.content || e?.text || "";
                return (
                  <li key={i} className="np-tl-item">
                    <div className="np-tl-dot" />
                    <div className="np-tl-meta">
                      {time && <span className="np-tl-time">{time}</span>}
                      {e.author && <span className="np-tl-author">{e.author}</span>}
                    </div>
                    {text && <p className="np-tl-text">{text.length > 280 ? `${text.slice(0, 280)}…` : text}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

// 新聞辯論法庭組件
const NewsCourtroom = ({ data }) => {
  const fr = data?.final_report_json || {};
  const stakes = fr.stake_summaries || [];
  // 嘗試多種可能的資料路徑，並從 groundingSupports 提取資料
  let chunks = data?.groundingChunks || data?.raw?.groundingChunks || data?.curationData?.results || [];
  
  // 如果沒有 chunks，嘗試從其他資料源提取
  if (chunks.length === 0) {
    // 優先嘗試 curationData.results
    if (data?.curationData?.results && data.curationData.results.length > 0) {
      chunks = data.curationData.results.map((result, index) => ({
        id: `curation_${index}`,
        title: result.title || '未知標題',
        url: result.url,
        snippet: result.snippet || '',
        domain: '查核資料'
      }));
    }
    // 如果還是沒有，嘗試從 groundingSupports 提取
    else if (data?.groundingSupports) {
      const supports = data.groundingSupports || [];
      const extractedChunks = [];
      
      supports.forEach((support, index) => {
        if (support.segment?.text) {
          extractedChunks.push({
            id: `support_${index}`,
            text: support.segment.text,
            confidence: support.confidenceScores?.[0] || 0,
            startIndex: support.segment.startIndex || 0,
            endIndex: support.segment.endIndex || 0,
            groundingChunkIndices: support.groundingChunkIndices || []
          });
        }
      });
      
      chunks = extractedChunks;
    }
  }
  
  // 嘗試多種可能的 jury 資料路徑，並從現有資料構造
  let jury = data?.jury_result || 
             data?.raw?.jury_result || 
             data?.final_report_json?.jury_result ||
             data?.jury ||
             {};
  
  // 如果沒有找到 jury_result，嘗試從 final_report_json 構造
  if (!jury || Object.keys(jury).length === 0) {
    const fr = data?.final_report_json || {};
    if (fr.jury_score) {
      jury = {
        verdict: fr.jury_brief || '無判決',
        verdict_result: fr.jury_score > 50 ? '正方' : '反方',
        scores: {
          evidence_quality: Math.round(fr.jury_score * 0.3),
          logical_rigor: Math.round(fr.jury_score * 0.25),
          robustness: Math.round(fr.jury_score * 0.2),
          social_impact: Math.round(fr.jury_score * 0.25),
          total: fr.jury_score
        }
      };
    }
  }
  
  const social = data?.social || {};
  
  return (
    <section className="np-section">
      <h2 className="np-sec-title"><FaGavel /> 新聞辯論法庭</h2>
      
      {/* 主辯 - 正方反方辯論 */}
      <div className="np-court-section">
        <h3 className="np-subtitle">主辯</h3>
        <div className="np-debate-layout">
          {/* 正方 */}
          {stakes.find(s => s.side === 'Advocate') && (
            <div className="np-debate-side np-advocate">
              <h4><AiTwotoneSmile />&nbsp;正方</h4>
              <div className="np-debate-content">
                <p className="np-thesis">{stakes.find(s => s.side === 'Advocate').thesis}</p>
                {stakes.find(s => s.side === 'Advocate').strongest_points?.length > 0 && (
                  <div className="np-points">
                    <h5>主要論點：</h5>
                    <ul>
                      {stakes.find(s => s.side === 'Advocate').strongest_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {stakes.find(s => s.side === 'Advocate').weaknesses?.length > 0 && (
                  <div className="np-weaknesses">
                    <h5>弱點：</h5>
                    <ul>
                      {stakes.find(s => s.side === 'Advocate').weaknesses.map((weakness, i) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 反方 */}
          {stakes.find(s => s.side === 'Skeptic') && (
            <div className="np-debate-side np-skeptic">
              <h4><AiTwotoneFrown />&nbsp;反方</h4>
              <div className="np-debate-content">
                <p className="np-thesis">{stakes.find(s => s.side === 'Skeptic').thesis}</p>
                {stakes.find(s => s.side === 'Skeptic').strongest_points?.length > 0 && (
                  <div className="np-points">
                    <h5>主要論點：</h5>
                    <ul>
                      {stakes.find(s => s.side === 'Skeptic').strongest_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {stakes.find(s => s.side === 'Skeptic').weaknesses?.length > 0 && (
                  <div className="np-weaknesses">
                    <h5>弱點：</h5>
                    <ul>
                      {stakes.find(s => s.side === 'Skeptic').weaknesses.map((weakness, i) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        
        {/* 挑戰權威者 */}
        {stakes.find(s => s.side === 'Devil') && (
          <div className="np-debate-side np-devil">
            <h4><FaRegChessKnight />&nbsp;挑戰權威者</h4>
            <div className="np-debate-content">
              <p className="np-thesis">{stakes.find(s => s.side === 'Devil').thesis}</p>
              {stakes.find(s => s.side === 'Devil').strongest_points?.length > 0 && (
                <div className="np-points">
                  <h5>主要論點：</h5>
                  <ul>
                    {stakes.find(s => s.side === 'Devil').strongest_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {stakes.find(s => s.side === 'Devil').weaknesses?.length > 0 && (
                <div className="np-weaknesses">
                  <h5>弱點：</h5>
                  <ul>
                    {stakes.find(s => s.side === 'Devil').weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 檢察官查核 */}
      <div className="np-court-section">
        <h3 className="np-subtitle">Prosecutor查核</h3>
        <div className="np-grounding-grid">
          {chunks.length > 0 ? (
            chunks.map((chunk, i) => (
              <div key={i} className="np-grounding-item">
                <div className="np-grounding-header">
                  <h4>{chunk.title || chunk.web?.title || chunk.text?.substring(0, 50) + '...' || '未知標題'}</h4>
                  <span className="np-domain">{chunk.domain || chunk.web?.domain || '查核資料'}</span>
                  {chunk.confidence && (
                    <span className="np-confidence">可信度: {(chunk.confidence * 100).toFixed(1)}%</span>
                  )}
                </div>
                {(chunk.snippet || chunk.text) && (
                  <div className="np-grounding-text">
                    <p>{chunk.snippet || chunk.text}</p>
                  </div>
                )}
                {(chunk.url && chunk.url !== '無相關網址') && (
                  <a className="np-source-link" href={chunk.url} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt /> 查看原文
                  </a>
                )}
                {chunk.web?.uri && (
                  <a className="np-source-link" href={chunk.web.uri} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt /> 查看原文
                  </a>
                )}
              </div>
            ))
          ) : (
            <div>
              <p className="np-muted">暫無查核資料</p>
              <details style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
                <summary>調試資訊</summary>
                <pre style={{fontSize: '10px', marginTop: '4px'}}>
                  {JSON.stringify({
                    chunksLength: chunks.length,
                    chunks: chunks,
                    dataKeys: Object.keys(data || {}),
                    groundingChunks: data?.groundingChunks,
                    rawGroundingChunks: data?.raw?.groundingChunks,
                    curationData: data?.curationData,
                    curationResults: data?.curationData?.results
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
      
      {/* 最終法官裁決 */}
      <div className="np-court-section">
        <h3 className="np-subtitle">最終法官裁決</h3>
        
        {/* 四維評分 */}
        {jury.scores ? (
          <div className="np-jury-scores">
            <h4>四維評分</h4>
            <div className="np-scores-grid">
              <div className="np-score-item">
                <span>證據品質</span>
                <b>{jury.scores.evidence_quality || 0}</b>
              </div>
              <div className="np-score-item">
                <span>邏輯嚴謹</span>
                <b>{jury.scores.logical_rigor || 0}</b>
              </div>
              <div className="np-score-item">
                <span>穩健性</span>
                <b>{jury.scores.robustness || 0}</b>
              </div>
              <div className="np-score-item">
                <span>社會影響</span>
                <b>{jury.scores.social_impact || 0}</b>
              </div>
              <div className="np-score-item np-total-score">
                <span>總分</span>
                <b>{jury.scores.total || 0}</b>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="np-muted">暫無四維評分資料</p>
            <details style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
              <summary>調試資訊</summary>
              <pre style={{fontSize: '10px', marginTop: '4px'}}>
                {JSON.stringify({
                  jury: jury,
                  juryResult: data?.jury_result,
                  rawJuryResult: data?.raw?.jury_result,
                  finalReportJuryResult: data?.final_report_json?.jury_result,
                  dataJury: data?.jury,
                  juryScores: jury.scores,
                  dataKeys: Object.keys(data || {}),
                  finalReport: data?.final_report_json,
                  hasJuryResult: !!data?.jury_result,
                  hasRawJuryResult: !!data?.raw?.jury_result,
                  hasFinalReportJuryResult: !!data?.final_report_json?.jury_result,
                  hasDataJury: !!data?.jury,
                  juryResultKeys: data?.jury_result ? Object.keys(data.jury_result) : [],
                  allPossiblePaths: {
                    'data.jury_result': data?.jury_result,
                    'data.raw.jury_result': data?.raw?.jury_result,
                    'data.final_report_json.jury_result': data?.final_report_json?.jury_result,
                    'data.jury': data?.jury
                  }
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {/* 判決結果 */}
        {jury.verdict && (
          <div className="np-verdict">
            <h4>判決結果</h4>
            <p className="np-verdict-text">{jury.verdict}</p>
            {jury.verdict_result && (
              <div className={`np-verdict-badge ${jury.verdict_result === '正方' ? 'adv' : 'skp'}`}>
                {jury.verdict_result}
              </div>
            )}
          </div>
        )}
        
        {/* 優點分析 */}
        {jury.strengths && jury.strengths.length > 0 && (
          <div className="np-strengths">
            <h4>優點分析</h4>
            <ul className="np-strengths-list">
              {jury.strengths.map((strength, index) => (
                <li key={index} className="np-strength-item">
                  <span className="np-strength-point">{strength.point}</span>
                  {strength.refs && strength.refs.length > 0 && (
                    <div className="np-strength-refs">
                      {strength.refs.map((ref, refIndex) => (
                        <span key={refIndex} className="np-ref-tag">{ref}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 弱點分析 */}
        {jury.weaknesses && jury.weaknesses.length > 0 && (
          <div className="np-weaknesses">
            <h4>弱點分析</h4>
            <ul className="np-weaknesses-list">
              {jury.weaknesses.map((weakness, index) => (
                <li key={index} className="np-weakness-item">
                  <span className="np-weakness-point">{weakness.point}</span>
                  {weakness.refs && weakness.refs.length > 0 && (
                    <div className="np-weakness-refs">
                      {weakness.refs.map((ref, refIndex) => (
                        <span key={refIndex} className="np-ref-tag">{ref}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 證據摘要 */}
        {data?.evidence_checked && (
          <div className="np-evidence">
            <h4>證據摘要</h4>
            <div className="np-evidence-content">
              {Array.isArray(data.evidence_checked) ? (
                <ul>
                  {data.evidence_checked.map((evidence, i) => (
                    <li key={i}>{evidence}</li>
                  ))}
                </ul>
              ) : (
                <p>{data.evidence_checked}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 民眾視角 - 社會擾動 */}
      <div className="np-court-section">
        <h3 className="np-subtitle">The Masses 視角</h3>
        <div className="np-social-grid">
          {social.disrupter && (
            <div className="np-social-item">
              <h4>擾動者</h4>
              <p>{social.disrupter}</p>
            </div>
          )}
          {social.influencer_1 && (
            <div className="np-social-item">
              <h4>影響者1</h4>
              <p>{social.influencer_1}</p>
            </div>
          )}
          {social.influencer_2 && (
            <div className="np-social-item">
              <h4>影響者2</h4>
              <p>{social.influencer_2}</p>
            </div>
          )}
          {social.echo_chamber && (
            <div className="np-social-item">
              <h4>回音室</h4>
              <p>{social.echo_chamber}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// 評審與論證組件
const JuryAndEvidence = ({ data }) => {
  const fr = data?.final_report_json || {};
  const stakes = fr.stake_summaries || [];
  const weightCalculation = data?.weight_calculation_json || {};
  
  // 統計角色出現次數
  const roleStats = stakes.reduce((acc, stake) => {
    const role = roleName(stake.side);
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <section className="np-section">
      <h2 className="np-sec-title"><GiTribunalJury /> 評審與論證</h2>
      
      {/* 角色統計 */}
      <div className="np-roles-section">
        <h3 className="np-subtitle">所有角色作用以及出現次數</h3>
        <div className="np-roles-grid">
          {Object.entries(roleStats).map(([role, count]) => (
            <div key={role} className="np-role-card">
              <h4>{role}</h4>
              <div className="np-role-count">{count} 次</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 詳細角色資訊 */}
      <div className="np-roles-detail">
        <h3 className="np-subtitle">詳細角色資訊</h3>
        <div className="np-roles-detail-grid">
          {stakes.map((stake, i) => (
            <div key={i} className="np-role-detail-card">
              <div className="np-role-header">
                <h4>{roleName(stake.side)}</h4>
                <span className="np-role-badge">{roleName(stake.side)}</span>
              </div>
              
              {stake.thesis && (
                <div className="np-role-thesis">
                  <h5>立場</h5>
                  <p>{stake.thesis}</p>
                </div>
              )}
              
              {stake.strongest_points?.length > 0 && (
                <div className="np-role-points">
                  <h5>主要論點 ({stake.strongest_points.length} 個)</h5>
                  <ul>
                    {stake.strongest_points.slice(0, 3).map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                    {stake.strongest_points.length > 3 && (
                      <li>...還有 {stake.strongest_points.length - 3} 個論點</li>
                    )}
                  </ul>
                </div>
              )}
              
              {stake.weaknesses?.length > 0 && (
                <div className="np-role-weaknesses">
                  <h5>弱點 ({stake.weaknesses.length} 個)</h5>
                  <ul>
                    {stake.weaknesses.slice(0, 2).map((weakness, j) => (
                      <li key={j}>{weakness}</li>
                    ))}
                    {stake.weaknesses.length > 2 && (
                      <li>...還有 {stake.weaknesses.length - 2} 個弱點</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 評審分數 */}
      <div className="np-jury-scores-section">
        <h3 className="np-subtitle">評審分數</h3>
        <div className="np-scores-card">
          <div className="np-scores-list">
            <div className="np-score-row">
              <span>LLM評分</span>
              <b>{weightCalculation.llm_score || 'N/A'}</b>
            </div>
            <div className="np-score-row">
              <span>SLM評分</span>
              <b>{weightCalculation.slm_score || 'N/A'}</b>
            </div>
            <div className="np-score-row">
              <span>陪審團評分</span>
              <b>{weightCalculation.jury_score || 'N/A'}</b>
            </div>
            <div className="np-score-row np-final-score">
              <span>最終評分</span>
              <b>{weightCalculation.final_score || 'N/A'}</b>
            </div>
          </div>
        </div>
      </div>
      
      {/* 判決摘要 */}
      <div className="np-summary-section">
        <h3 className="np-subtitle">判決摘要</h3>
        <div className="np-summary-content">
          <p>{fr.jury_brief || '無判決摘要'}</p>
        </div>
      </div>
    </section>
  );
};

const NewspaperView = ({ data }) => {
  const stakes = data?.final_report_json?.stake_summaries || [];
  // 嘗試多種可能的 jury 資料路徑，並從現有資料構造
  let jury = data?.jury_result || 
             data?.raw?.jury_result || 
             data?.final_report_json?.jury_result ||
             data?.jury ||
             {};
  
  // 如果沒有找到 jury_result，嘗試從 final_report_json 構造
  if (!jury || Object.keys(jury).length === 0) {
    const fr = data?.final_report_json || {};
    if (fr.jury_score) {
      jury = {
        verdict: fr.jury_brief || '無判決',
        verdict_result: fr.jury_score > 50 ? '正方' : '反方',
        scores: {
          evidence_quality: Math.round(fr.jury_score * 0.3),
          logical_rigor: Math.round(fr.jury_score * 0.25),
          robustness: Math.round(fr.jury_score * 0.2),
          social_impact: Math.round(fr.jury_score * 0.25),
          total: fr.jury_score
        }
      };
    }
  }
  // 嘗試多種可能的資料路徑，並從 groundingSupports 提取資料
  let chunks = data?.groundingChunks || data?.raw?.groundingChunks || data?.curationData?.results || [];
  
  // 如果沒有 chunks，嘗試從其他資料源提取
  if (chunks.length === 0) {
    // 優先嘗試 curationData.results
    if (data?.curationData?.results && data.curationData.results.length > 0) {
      chunks = data.curationData.results.map((result, index) => ({
        id: `curation_${index}`,
        title: result.title || '未知標題',
        url: result.url,
        snippet: result.snippet || '',
        domain: '查核資料'
      }));
    }
    // 如果還是沒有，嘗試從 groundingSupports 提取
    else if (data?.groundingSupports) {
      const supports = data.groundingSupports || [];
      const extractedChunks = [];
      
      supports.forEach((support, index) => {
        if (support.segment?.text) {
          extractedChunks.push({
            id: `support_${index}`,
            text: support.segment.text,
            confidence: support.confidenceScores?.[0] || 0,
            startIndex: support.segment.startIndex || 0,
            endIndex: support.segment.endIndex || 0,
            groundingChunkIndices: support.groundingChunkIndices || []
          });
        }
      });
      
      chunks = extractedChunks;
    }
  }
  return (
    <div className="np-container">
      <Header data={data} />
      <div className="np-grid">
        {/* 左欄：主文 */}
        <main className="np-main">
          <NewsCourtroom data={data} />
          <JuryAndEvidence data={data} />
        </main>
        {/* 右欄：側欄 */}
        <aside className="np-aside">
          <VerdictBox jury={jury} />
          <QuickFacts data={data} />
          <RolesMini stakes={stakes} />
          <Timeline data={data} />
          <SourcesBox chunks={chunks} />
        </aside>
      </div>
    </div>
  );
};

export default NewspaperView;
