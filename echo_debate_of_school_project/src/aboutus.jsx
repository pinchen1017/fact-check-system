import './css/aboutus.css'
import { HiAcademicCap } from "react-icons/hi2"
import { HiAdjustmentsHorizontal } from "react-icons/hi2"
import { HiChatBubbleBottomCenterText } from "react-icons/hi2"
import { DiAndroid } from "react-icons/di"
import { HiChatBubbleLeftRight } from "react-icons/hi2"
import { HiClipboardDocumentList } from "react-icons/hi2";
import { HiBolt } from "react-icons/hi2"

{/*AboutUs*/}
function AboutUs() {
    return (
        <>
            <div className="main-content-area">
                <div className="about-section">
                    <h1>關於我們</h1>
                    
                    <div className="about-intro-section">
                        {/* <h2>我們是誰</h2> */}
                        <p className="about-intro">
                            我們是彰化師範大學資訊工程學系的學生，致力於運用先進的AI技術解決社會問題。
                            我們提供一個創新的多代理辯論平台，透過「辯論—社會傳播—裁決—整合」四階段流程，
                            打造可被觀察、可審計、可復現的事實查核系統。
                        </p>
                    </div>

                    <div className="about-platform-section">
                        <h2><HiAcademicCap /> 平台特色</h2>
                        <p className="platform-intro">
                            一鍵分享、秒級快判；多代理辯論，給你看得懂、查得到、能追溯的真相。
                        </p>
                    </div>

                    <div className="about-features">
                        <div className="about-feature">
                            <div className="feature-icon">
                                {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none"> */}
                                    <h2><DiAndroid className='about-icon'/></h2>
                                    {/* <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> */}
                                {/* </svg> */}
                            </div>
                            <h3>AI智能分析</h3>
                            <p>運用最新的自然語言處理技術，快速識別可疑內容並進行初步分析</p>
                        </div>

                        <div className="about-feature">
                            <div className="feature-icon">
                                {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none"> */}
                                    <h2><HiChatBubbleLeftRight /></h2>
                                    {/* <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> */}
                                {/* </svg> */}
                            </div>
                            <h3>多代理辯論系統</h3>
                            <p>透過多個AI代理進行辯論，確保分析過程的全面性和客觀性</p>
                        </div>

                        <div className="about-feature">
                            <div className="feature-icon">
                                <h2><HiClipboardDocumentList /></h2>
                                {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg> */}
                            </div>
                            <h3>結構化證據鏈</h3>
                            <p>輸出真偽結論、爭點整理、可信度分數、傳播風險、歷史脈絡與建議</p>
                        </div>

                        <div className="about-feature">
                            <div className="feature-icon">
                                <h2><HiBolt /></h2>
                                {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg> */}
                            </div>
                            <h3>快速響應</h3>
                            <p>秒級快判，讓您在信息爆炸的時代快速獲得可靠的事實查核結果</p>
                        </div>
                    </div>

                    <div className="about-process-section">
                        <h2><HiAdjustmentsHorizontal /> 四階段流程</h2>
                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-number">1</div>
                                <h4>辯論</h4>
                                <p>多個AI代理針對同一議題進行辯論，從不同角度分析問題</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">2</div>
                                <h4>社會傳播</h4>
                                <p>分析信息在社會中的傳播路徑和影響範圍</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">3</div>
                                <h4>裁決</h4>
                                <p>基於辯論結果和傳播分析，做出客觀的事實判斷</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">4</div>
                                <h4>整合</h4>
                                <p>整合所有分析結果，輸出結構化的最終報告</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-contact-section">
                        <h2><HiChatBubbleBottomCenterText /> 聯絡我們</h2>
                        <p>如果您對我們的平台有任何建議或問題，歡迎與我們聯繫。</p>
                        <p className="contact-info">
                            <strong>專案名稱：</strong>Debat & Echo 多代理辯論事實查核系統<br />
                            <strong>開發團隊：</strong>彰化師範大學資訊工程學系<br/>
                            <strong>LINEID：</strong>@730cdmmq<br />
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AboutUs