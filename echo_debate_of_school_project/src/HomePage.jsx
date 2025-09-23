import './css/HomePage.css'
import { FaSearch, FaShieldAlt, FaUsers, FaBrain, FaGavel, FaChartLine, FaRocket, FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa'
import { MdOutlineNaturePeople, MdVerifiedUser, MdSpeed, MdSecurity } from 'react-icons/md'

function HomePage({ onTabChange }) {
    return (
        <div className="homepage">
            {/* Hero Section - 參考 Cofacts 的設計 */}
            <section className="hero-section">
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
                        
                        {/* 搜索區域 - 參考 Cofacts */}
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

            {/* 功能特色區域 - 參考 APMIC 的設計 */}
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
                            <h3>即時分析</h3>
                            <p>快速響應的查證系統，在幾秒鐘內為您提供詳細的分析結果和建議。</p>
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

            {/* 工作流程區域 */}
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

            {/* 統計數據區域 - 參考 Cofacts */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">250+</div>
                            <div className="stat-label">每週查證訊息</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">95%</div>
                            <div className="stat-label">準確率</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">12</div>
                            <div className="stat-label">智能代理</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">即時服務</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 最新查證預覽 */}
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

            {/* 行動呼籲區域 */}
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
        </div>
    )
}

export default HomePage