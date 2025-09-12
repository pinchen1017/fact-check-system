import './css/header.css'
import './css/trending.css'
import { MdVerifiedUser } from "react-icons/md"

{/*Trending*/ }
function Trending({ factChecks }) {
    return (
        <>
            {/* 主要內容區域 */}
            <div className="main-content-area">
                {/* 特色內容 */}
                {/* <div className="featured-section">
                    <h2>特色查證</h2>
                    <div className="featured-card">
                        <div className="featured-image">
                            <div className="image-placeholder">圖片</div>
                        </div>
                        <div className="featured-content">
                            <span className="featured-badge">特色</span>
                            <h3>12個關於氣候變化的圖片我們已經查證過</h3>
                            <p>聲稱顯示海平面上升或溫度升高的地圖或圖片經常在網上流傳。有些是真實的，有些則不是。</p>
                            <span className="featured-author">作者：張小明</span>
                        </div>
                    </div>
                </div> */}

                {/* 最新查證 */}
                <div className="latest-section">
                    <div className="section-header">
                        <h2><MdVerifiedUser /> 最新查證</h2>
                        <a href="#" className="view-all-link">查看全部</a>
                    </div>

                    <div className="fact-checks-list">
                        {factChecks && factChecks.map((item) => (
                            <article key={item.id} className="fact-check-item">
                                <div className="item-content">
                                    <div className="item-header">
                                        <span className={`status-badge ${item.result === '真實' ? 'true' : item.result === '假消息' ? 'false' : 'mixed'}`}>
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
        </>
    )
}

export default Trending