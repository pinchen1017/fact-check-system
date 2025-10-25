import './css/header.css'
import './css/trending.css'
import { MdVerifiedUser } from "react-icons/md"
import { MdOutlineHistoryToggleOff } from "react-icons/md"

{/*Trending*/ }
function Trending({ factChecks }) {
    return (
        <>
            <div className="main-content-area">        
                <div className="trending-section">
                    <h1>歷史查證</h1>

                    {/* 歷史查證 */}
                    <div className="latest-section">
                        <div className="section-header">
                            <h2><MdOutlineHistoryToggleOff /> 歷史查證</h2>
                            <a href="#" className="view-all-link">查看全部</a>
                        </div>

                        <div className="fact-checks-list">
                            {factChecks && factChecks.map((item) => (
                                <article key={item.id} className="fact-check-item">
                                    <div className="item-content">
                                        <div className="item-header">
                                            <span className={`status-badge ${item.result.includes('高') ? 'true' : item.result.includes('低') ? 'false' : 'mixed'}`}>
                                                {item.result}
                                            </span>
                                            <span className="category-badge">{item.category}</span>
                                        </div>
                                        <h3 className="item-title">{item.title}</h3>
                                        <p className="item-summary">{item.summary}</p>
                                        <div className="item-meta">
                                            <span className="item-author">作者：{item.author}</span>
                                            <span className="item-date">{item.date}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* 最新查證 */}
                    <div className="latest-section">
                        <div className="section-header">
                            <h2><MdVerifiedUser /> 最新查證</h2>
                        </div>

                        <div className="fact-checks-list">
                            {factChecks && factChecks.map((item) => (
                                <article key={item.id} className="fact-check-item">
                                    <div className="item-content">
                                        <div className="item-header">
                                            <span className={`status-badge ${item.result.includes('高') ? 'true' : item.result.includes('低') ? 'false' : 'mixed'}`}>
                                                {item.result}
                                            </span>
                                            <span className="category-badge">{item.category}</span>
                                        </div>
                                        <h3 className="item-title">{item.title}</h3>
                                        <p className="item-summary">{item.summary}</p>
                                        <div className="item-meta">
                                            <span className="item-author">作者：{item.author}</span>
                                            <span className="item-date">{item.date}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* 分類內容 */}
                    <div className="categories-content">
                        <div className="category-section">
                            <h2>政治</h2>
                            <div className="category-items">
                                {factChecks && factChecks.filter(item => item.category === '政治').map((item) => (
                                    <div key={item.id} className="category-item">
                                        <h4>{item.title}</h4>
                                        <span className="item-date">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="category-section">
                            <h2>健康</h2>
                            <div className="category-items">
                                {factChecks && factChecks.filter(item => item.category === '健康').map((item) => (
                                    <div key={item.id} className="category-item">
                                        <h4>{item.title}</h4>
                                        <span className="item-date">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Trending