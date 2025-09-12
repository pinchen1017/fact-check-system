import './css/debateCourt.css'
import { GiTribunalJury } from "react-icons/gi"

function DebateCourt({ data }) {
  if (!data) return null

  return (
    <div className="debate-court-section">
      <h2 className="section-title">⚖️ 辯論法庭系統</h2>

      <div className="court-layout">
        {/* 檢察官區域 */}
        <div className="prosecution-area">
          <div className="role-header prosecution">
            <h3>☺ 正方</h3>
          </div>
          <div className="debate-messages">
            {data?.debate?.prosecution?.map((msg, index) => (
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
            <h3>☹ 反方</h3>
          </div>
          <div className="debate-messages">
            {data?.debate?.defense?.map((msg, index) => (
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

        {/* 法官判決區域 */}
        <div className="judge-area">
          <div className="role-header judge">
            <h3><GiTribunalJury /> 法官判決</h3>
          </div>
          <div className="judgment-content">
            <div className="judgment-text">
              <p>{data?.debate?.judge?.verdict || '無判決資料'}</p>
            </div>
            <div className="confidence-meter">
              <span>判決信心度</span>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${data?.debate?.judge?.confidence || 0}%` }}
                ></div>
              </div>
              <span>{data?.debate?.judge?.confidence || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebateCourt