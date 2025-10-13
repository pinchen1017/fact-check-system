import './css/fact_check.css'
import './css/debateCourt.css'
import { GiTribunalJury } from "react-icons/gi"
import { CiFaceFrown } from "react-icons/ci"
import { CiFaceSmile } from "react-icons/ci"

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

function DebateCourt({ data }) {
  if (!data) return null;

  // 從數據中提取各個模型的結果
  const weightCalculation = data.weight_calculation_json || {};
  const finalReport = data.final_report_json || {};
  
  // 提取辯論觀點
  const advocatePoints = finalReport.stake_summaries?.find(s => s.side === 'Advocate')?.strongest_points || [];
  const skepticPoints = finalReport.stake_summaries?.find(s => s.side === 'Disrupter')?.strongest_points || [];
  
  console.log('DebateCourt - finalReport:', finalReport);
  console.log('DebateCourt - stake_summaries:', finalReport.stake_summaries);
  console.log('DebateCourt - advocatePoints:', advocatePoints);
  console.log('DebateCourt - skepticPoints:', skepticPoints);

  return (
    <div className="debate-court-section">
      <div className="court-layout">
        {/* 法官判決區域 */}
        <div className="judge-area">
          <div className="role-header judge">
            <h3><GiTribunalJury /> 最終法官判決</h3>
          </div>
          <div className="judgment-content">
            <div className="judgment-verdict">
              <div className={`verdict-badge ${getN8nVerdict(weightCalculation.jury_score || 0) === '勝訴' ? 'correct' : 'incorrect'}`}>
                {getN8nVerdict(weightCalculation.jury_score || 0)}
              </div>
            </div>
            <div className="judgment-text">
              <p>{finalReport.jury_brief || '無判決資料'}</p>
            </div>
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
}

export default DebateCourt