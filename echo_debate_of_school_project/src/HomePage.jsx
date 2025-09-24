import './css/HomePage.css'
import { FaSearch, FaShieldAlt, FaUsers, FaBrain, FaGavel, FaChartLine, FaRocket, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaRobot, FaMicrochip } from 'react-icons/fa'
import { MdOutlineNaturePeople, MdVerifiedUser, MdSpeed, MdSecurity } from 'react-icons/md'
import { useState, useEffect } from 'react'
import homepage_snow from './assets/homepage_snow.jpg'

function HomePage({ onTabChange }) {
    const [scrollY, setScrollY] = useState(0);

    // 監聽滾動事件
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.pageYOffset);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="homepage">
            {/* 第一部分：假新聞雷達名稱跟一句話簡介 */}
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
                        onError={(e) => {
                            console.log('圖片載入失敗:', e.target.src);
                            e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                            console.log('圖片載入成功');
                        }}
                    />
                </div>
                
                {/* 內容層 */}
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            假新聞雷達
                            <span className="hero-subtitle">基於多 Agent 的辯論系統平台</span>
                        </h1>
                        <p className="hero-description">
                            運用先進的人工智能技術，透過多個智能代理的辯論機制，
                            為您提供最準確、最可靠的新聞事實查核服務。
                        </p>
                        
                        {/* 搜索區域 */}
                        <div className="hero-search">
                            <div className="search-container">
                                <div className="search-box">
                                    <FaSearch className="search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="貼上可疑的文字內容..." 
                                        className="search-input"
                                    />
                                </div>
                                <button className="search-button" onClick={() => onTabChange('fact_check')}>
                                    快速查詢
                                </button>
                            </div>
                            <p className="search-hint">
                                或點擊下方按鈕開始使用我們的辯論系統
                            </p>
                        </div>

                        <div className="hero-actions">
                            <button className="cta-button primary" onClick={() => onTabChange('fact_check')}>
                                <FaRocket /> 開始查證
                            </button>
                            <button className="cta-button secondary" onClick={() => onTabChange('about')}>
                                <MdOutlineNaturePeople /> 了解更多
                            </button>
                        </div>
                    </div>
                    
                    {/* 特色圖示區域 */}
                    <div className="hero-visual">
                        <div className="feature-icons">
                            <div className="icon-item">
                                <FaBrain className="icon" />
                                <span>AI 分析</span>
                            </div>
                            <div className="icon-item">
                                <FaGavel className="icon" />
                                <span>辯論系統</span>
                            </div>
                            <div className="icon-item">
                                <FaShieldAlt className="icon" />
                                <span>事實查核</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第二部分：如何操作 */}
            <section className="workflow-section">
                <div className="container">
                    <div className="section-header">
                        <h2>如何運作？</h2>
                        <p>簡單三步驟，輕鬆查證新聞真偽</p>
                    </div>
                    
                    <div className="workflow-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>輸入內容</h3>
                                <p>貼上您想要查證的新聞內容或可疑訊息</p>
                            </div>
                        </div>
                        
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>AI 分析</h3>
                                <p>多個智能代理進行辯論分析，評估內容真實性</p>
                            </div>
                        </div>
                        
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>獲得結果</h3>
                                <p>查看詳細的分析報告和辯論過程</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 第三部分：介紹我們的技術優勢 */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>我們的技術優勢</h2>
                        <p>結合多種先進技術，提供最可靠的事實查核服務</p>
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

            {/* 第四部分：針對我們流程的三個分支進行優勢介紹 */}
            <section className="process-branches-section">
                <div className="container">
                    <div className="section-header">
                        <h2>三大核心技術分支</h2>
                        <p>每個分支都有其獨特的優勢，共同構建完整的事實查核體系</p>
                    </div>
                    
                    <div className="branches-content">
                        {/* 三大分支介紹 */}
                        <div className="branches-grid">
                            <div className="branch-card llm-branch">
                                <div className="branch-header">
                                    <div className="branch-icon">
                                        <FaRobot />
                                    </div>
                                    <div className="branch-title">
                                        <h3>LLM-AGS</h3>
                                        <span className="branch-subtitle">智慧顧問系統</span>
                                    </div>
                                </div>
                                <div className="branch-content">
                                    <p className="branch-description">
                                        大型語言模型提供「智慧顧問」角色，快速理解新聞文本語意，給出第一層建議並以可量化的分數呈現。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>快速理解：</strong>強大的自然語言處理能力</li>
                                            <li><strong>量化評估：</strong>提供具體的可信度分數</li>
                                            <li><strong>廣泛知識：</strong>基於海量數據訓練的深度理解</li>
                                            <li><strong>即時響應：</strong>秒級分析速度</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="branch-card slm-branch">
                                <div className="branch-header">
                                    <div className="branch-icon">
                                        <FaMicrochip />
                                    </div>
                                    <div className="branch-title">
                                        <h3>SLM</h3>
                                        <span className="branch-subtitle">專業裁判系統</span>
                                    </div>
                                </div>
                                <div className="branch-content">
                                    <p className="branch-description">
                                        專精的小型模型，針對新聞關鍵詞與外部資料進行比對，給出精確的可信度評估。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>精確比對：</strong>與外部資料庫進行詳細比對</li>
                                            <li><strong>專業判斷：</strong>針對特定領域的深度分析</li>
                                            <li><strong>高效運算：</strong>輕量級模型，快速響應</li>
                                            <li><strong>細節檢驗：</strong>關注新聞內容的具體細節</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="branch-card ma-branch">
                                <div className="branch-header">
                                    <div className="branch-icon">
                                        {/* <FaScaleBalanced /> */}
                                    </div>
                                    <div className="branch-title">
                                        <h3>多代理辯論系統</h3>
                                        <span className="branch-subtitle">法庭式辯論機制</span>
                                    </div>
                                </div>
                                <div className="branch-content">
                                    <p className="branch-description">
                                        模擬法庭辯論，整合不同觀點，確保結論不是單一模型說了算，提供多角度分析。
                                    </p>
                                    <div className="branch-advantages">
                                        <h4>核心優勢：</h4>
                                        <ul>
                                            <li><strong>多角度分析：</strong>正反雙方觀點全面呈現</li>
                                            <li><strong>公正裁決：</strong>模擬法庭的公正判決機制</li>
                                            <li><strong>透明過程：</strong>完整的辯論過程可追溯</li>
                                            <li><strong>社會模擬：</strong>模擬資訊在社群中的傳播</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
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