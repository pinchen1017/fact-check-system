import './css/header.css'
import { MdOutlineNaturePeople } from "react-icons/md"

{/* Header */}
function Header({ currentTab, onTabChange }) {
    return (
        <header className="header">
            <div className="header-container">
                {/* 左側 Logo 和名稱 */}
                <div className="header-left">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <a href="index.php"><img src="./src/assets/logo.png" alt="" /></a>
                        </div>
                        <div className="logo-text">
                            <h1 className="brand-name">Echo & Debat</h1>
                            <p className="brand-subtitle">基於多 Agent 的辯論系統平台</p>
                        </div>
                    </div>
                </div>

               {/* 右側導航選項 */}
                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <button 
                                className={`nav-button ${currentTab === 'trending' ? 'active' : ''}`}
                                onClick={() => onTabChange('trending')}
                            >
                                熱門內容
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-button ${currentTab === 'fact_check' ? 'active' : ''}`}
                                onClick={() => onTabChange('fact_check')}
                            >
                                事實查核
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-button ${currentTab === 'about' ? 'active' : ''}`}
                                onClick={() => onTabChange('about')}
                            >
                                關於我們
                            </button>
                        </li>
                        <h2><MdOutlineNaturePeople /></h2>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header