import './css/HomePage.css'
import { FaSearch, FaUsers, FaBrain, FaGavel, FaChartLine, FaRocket, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaRobot, FaMicrochip, FaHandshake, FaEye, FaComments, FaBalanceScale, FaLine, FaShieldAlt } from 'react-icons/fa'
import { MdOutlineNaturePeople, MdVerifiedUser, MdSpeed, MdSecurity } from 'react-icons/md'
import { RiRadarFill } from "react-icons/ri"
import { useState, useEffect } from 'react'
import homepage_snow from './assets/homepage_snow.jpg'
import panguin from './assets/panguin.png'
import qrcodeLINE from './assets/qrcodeLINE.png'
import judge from './assets/judge.jpg'
import private_detective from './assets/private_detective.png'
import professor from './assets/professor.png'
import judge_character from './assets/judge.png'

function HomePage({ onTabChange }) {
    const [scrollY, setScrollY] = useState(0);
    const [showCharacters, setShowCharacters] = useState(false);

    // 監聽滾動事件
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
            
            // 當滾動到 branches-content 時觸發角色動畫
            const branchesContent = document.querySelector('.branches-content');
            if (branchesContent) {
                const rect = branchesContent.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // 當 branches-content 進入視窗時觸發動畫
                if (rect.top < windowHeight * 0.7 && rect.bottom > 0) {
                    setShowCharacters(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="homepage">
            {/* 第一部分：假新聞雷達 - 參考 Cofacts 簡潔設計 */}
            <section className="hero-section">
                {/* 背景圖層 - 視差滾動效果 */}
                <div 
                    className="hero-background"
                    style={{
                        transform: `translateX(${scrollY * 0.1}px)`
                    }}
                >
                    <img 
                        src={homepage_snow} 
                        alt="homepage_snow" 
                    />
                </div>
                
                {/* 內容層 */}
                <div className="hero-container">
                    {/* 企鵝圖片 - 左側 */}
                    <div className="hero-panguin">
                        <img src={panguin} alt="企鵝" className="panguin-image" />
                    </div>
                    
                    <div className="hero-content">
                        <h1 className="hero-title">
                            假新聞雷達 <RiRadarFill />
                        </h1>
                        
                        <p className="hero-description">
                            運用多 Agent 辯論系統，為您提供最準確的新聞事實查核服務
                        </p>

                        <div className="hero-actions">
                            <button className="cta-button primary" onClick={() => onTabChange('fact_check')}>
                                <FaRocket /> 開始查證
                            </button>
                            <button className="cta-button secondary" onClick={() => onTabChange('about')}>
                                <MdOutlineNaturePeople /> 了解更多
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第二部分：如何使用 - 參考 Cofacts */}
            <section className="how-to-use-section">
                <div className="container">
                    <div className="section-header">
                        <h1>發現真相 ...</h1>
                    </div>
                    
                    <div className="usage-methods">
                        {/* LINE 查詢方式 */}
                        <div className="usage-method line-method">
                            <div className="method-header">
                                <h1><FaLine /></h1>
                                <h3>透過 LINE 查詢</h3>
                            </div>
                            <div className="method-content">
                                <p>透過 LINE 輸入可疑訊息，系統會先搜查 Cofacts 資料庫，然後執行後端分析流程，回傳簡易 LINE 回復和詳細網頁分析。</p>
                                
                                <div className="line-steps">
                                    <div className="step">
                                        <div className="step-text">1. 掃描 QR Code 加入 LINE 好友</div>
                                    </div>
                                    <div className="step">
                                        <div className="step-text">2. 轉傳可疑訊息給機器人</div>
                                    </div>
                                    <div className="step">
                                        <div className="step-text">3. 獲得即時查證結果</div>
                                    </div>
                                </div>
                                
                                <div className="qr-code-section">
                                    <h4>掃描 QR Code 加入好友</h4>
                                    <div className="qr-code-container">
                                        <img src={qrcodeLINE} alt="LINE QR Code" className="qr-code" />
                                    </div>
                                    {/* <p className="qr-hint">ID 搜尋 @730cdmmq 或掃描 QR Code</p> */}
                                </div>
                            </div>
                        </div>
                        
                        {/* 網頁查詢方式 */}
                        <div className="usage-method web-method">
                            <div className="method-header">
                                <h1><FaSearch /></h1>
                                <h3>網頁直接查詢</h3>
                            </div>
                            <div className="method-content">
                                <p>直接在網頁上輸入可疑訊息，獲得完整的多 Agent 辯論分析報告和詳細查證結果。</p>
                                
                                <div className="web-features">
                                    <div className="feature">
                                        <span>1. 點擊開始網頁查詢</span>
                                    </div>
                                    <div className="feature">
                                        <span>2. 輸入可疑訊息</span>
                                    </div>
                                    <div className="feature">
                                        <span>3. 點擊開始分析</span>
                                    </div>
                                    <div className="feature">
                                        <span>4. 獲得模型詳細分析結果</span>
                                    </div>
                                </div>
                                
                                <div className="web-actions">
                                    <button className="cta-button primary" onClick={() => onTabChange('fact_check')}>
                                        <FaSearch /> 開始網頁查詢
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第三部分：針對我們流程的三個分支進行優勢介紹 */}
            <section className="process-branches-section">
                <div className="branches-background">
                    <img src={judge} alt="Judge Background" className="judge-bg-image" />
                    <div className="branches-overlay"></div>
                </div>
                
                <div className="container">
                    <div className="section-header">
                        <h1>可靠的法治社會</h1>
                    </div>
                    <div className="section-subtitle">
                        <p>三個分支共同構建完整的事實查核體系</p>
                    </div>
                    
                    <div className="branches-content">
                        {/* 三大分支介紹 */}
                        <div className="branches-grid">
                            <div className="branch-card prosecutor-branch">
                                <div className="branch-content">
                                    <div className="branch-header">
                                        <div className="branch-icon">
                                            <FaGavel />
                                        </div>
                                        <div className="branch-title">
                                            <h3>私家偵探 (LLM)</h3>
                                            <span className="branch-subtitle">質疑與挑戰</span>
                                        </div>
                                    </div>
                                    <p className="branch-description">
                                        負責質疑和挑戰訊息的真實性，從批判角度分析可疑內容，提出質疑點和反駁論據。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>質疑可疑訊息：</strong>從批判角度分析內容</li>
                                            <li><strong>提出反駁論據：</strong>尋找邏輯漏洞和矛盾</li>
                                            <li><strong>批判性分析：</strong>深度檢驗訊息可信度</li>
                                            <li><strong>挑戰假設：</strong>質疑未經證實的聲稱</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="branch-card defender-branch">
                                <div className="branch-content">
                                    <div className="branch-header">
                                        <div className="branch-icon">
                                            <FaShieldAlt />
                                        </div>
                                        <div className="branch-title">
                                            <h3>業界學者 (SLM)</h3>
                                            <span className="branch-subtitle">辯護與支持</span>
                                        </div>
                                    </div>
                                    <p className="branch-description">
                                        負責為訊息辯護，尋找支持證據，從正面角度分析內容的合理性，提供辯護論據。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>尋找支持證據：</strong>挖掘有利於訊息的證據</li>
                                            <li><strong>提供辯護論據：</strong>從正面角度分析合理性</li>
                                            <li><strong>正面分析：</strong>尋找訊息的正面價值</li>
                                            <li><strong>平衡觀點：</strong>確保公正的辯論環境</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="branch-card judge-branch">
                                <div className="branch-content">
                                    <div className="branch-header">
                                        <div className="branch-icon">
                                            <FaBalanceScale />
                                        </div>
                                        <div className="branch-title">
                                            <h3>法官 Agent</h3>
                                            <span className="branch-subtitle">公正裁決</span>
                                        </div>
                                    </div>
                                    <p className="branch-description">
                                        負責綜合分析雙方論據，做出最終判斷，提供客觀公正的結論和建議。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>綜合分析論據：</strong>整合正反雙方觀點</li>
                                            <li><strong>客觀公正判斷：</strong>基於證據做出裁決</li>
                                            <li><strong>提供最終結論：</strong>給出明確的判斷結果</li>
                                            <li><strong>透明過程：</strong>完整的裁決過程可追溯</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 角色動畫區域 */}
                    <div className="characters-animation">
                        <div className={`character detective-character ${showCharacters ? 'show' : ''}`}>
                            <img src={private_detective} alt="Private Detective" className="character-image" />
                        </div>
                        <div className={`character professor-character ${showCharacters ? 'show' : ''}`}>
                            <img src={professor} alt="Professor" className="character-image" />
                        </div>
                        <div className={`character judge-character ${showCharacters ? 'show' : ''}`}>
                            <img src={judge_character} alt="Judge" className="character-image" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 第四部分：介紹我們的技術優勢 */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h1>全力得以保障</h1>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaBrain />
                            </div>
                            <h3>多 Agent 辯論系統</h3>
                            <p>運用多個智能代理進行辯論，從不同角度分析新聞內容，確保查證結果的客觀性和準確性。</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaChartLine />
                            </div>
                            <h3>模糊分數評估</h3>
                            <p>提供 0-100% 的模糊分數評估，幫助您了解新聞內容的可信度和模糊程度。</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaGavel />
                            </div>
                            <h3>辯論法庭系統</h3>
                            <p>創新的辯論法庭界面，展示正反雙方的論點，讓您清楚了解查證過程和結論。</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">
                                <MdSpeed />
                            </div>
                            <h3>Cofact輔助查證</h3>
                            <p>查詢前會先查詢Cofact，提供查證結果，幫助您快速了解新聞內容的真實性。</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">
                                <MdSecurity />
                            </div>
                            <h3>安全可靠</h3>
                            <p>採用先進的安全技術，保護您的隱私，確保查證過程的安全性和可靠性。</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaUsers />
                            </div>
                            <h3>社群協作</h3>
                            <p>鼓勵用戶參與事實查核，建立開放透明的查證社群，共同對抗假新聞。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第五部分：準備開始對抗假新聞了嗎？ */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>準備開始對抗假新聞了嗎？</h2>
                        <p>加入我們，一起建立更真實、更可信的資訊環境</p>
                        <div className="cta-buttons">
                            <button className="cta-button primary" onClick={() => onTabChange('fact_check')}>
                                <FaRocket /> 立即開始查證
                            </button>
                            <button className="cta-button secondary" onClick={() => onTabChange('about')}>
                                了解更多
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第六部分：最新查證 */}
            <section className="latest-section">
                <div className="container">
                    <div className="section-header">
                        <h2><MdVerifiedUser /> 最新查證</h2>
                        <button className="view-all-btn" onClick={() => onTabChange('trending')}>
                            查看全部
                        </button>
                    </div>
                    
                    <div className="latest-grid">
                        <div className="latest-item">
                            <div className="result-badge true">
                                <FaCheckCircle /> 真實
                            </div>
                            <h4>某地區將實施新的交通管制措施？</h4>
                            <p>相關政策文件已正式發布，將於下月開始實施。</p>
                            <span className="date">2024-01-13</span>
                        </div>
                        
                        <div className="latest-item">
                            <div className="result-badge false">
                                <FaTimesCircle /> 假消息
                            </div>
                            <h4>網傳某政治人物擁有海外秘密帳戶？</h4>
                            <p>經查證，該傳言缺乏具體證據支持，相關指控已被當事人否認。</p>
                            <span className="date">2024-01-15</span>
                        </div>
                        
                        <div className="latest-item">
                            <div className="result-badge mixed">
                                <FaQuestionCircle /> 部分真實
                            </div>
                            <h4>某品牌食品含有致癌物質？</h4>
                            <p>該品牌部分產品確實含有微量相關物質，但含量遠低於安全標準。</p>
                            <span className="date">2024-01-14</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage