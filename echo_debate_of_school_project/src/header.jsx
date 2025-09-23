import './css/header.css'
import { MdOutlineNaturePeople } from "react-icons/md"
import { FiMenu, FiChevronsUp } from "react-icons/fi"
import { useState, useEffect } from "react"
import logo from './assets/logo.png';

{/* Header */}
function Header({ currentTab, onTabChange }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // 監聽滾動事件
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300); // 滾動超過300px時顯示
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = () => {
        onTabChange('home');
    };

    const handleNavClick = (tab) => {
        onTabChange(tab);
        setIsMobileMenuOpen(false); // 關閉移動端選單
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* 左側 Logo 和名稱 */}
                <div className="header-left" onClick={handleLogoClick}>
                    <div className="logo-container">
                        <div className="logo-icon">
                            <img src={logo} alt="logo" />
                        </div>
                        <div className="logo-text">
                            <h1 className="brand-name">假新聞雷達</h1>
                            <p className="brand-subtitle">基於多 Agent 的辯論系統平台</p>
                        </div>
                    </div>
                </div>

               {/* 右側導航選項 */}
                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <button 
                                className={`nav-button ${currentTab === 'home' ? 'active' : ''}`}
                                onClick={() => handleNavClick('home')}
                            >
                                首頁
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-button ${currentTab === 'trending' ? 'active' : ''}`}
                                onClick={() => handleNavClick('trending')}
                            >
                                熱門內容
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-button ${currentTab === 'fact_check' ? 'active' : ''}`}
                                onClick={() => handleNavClick('fact_check')}
                            >
                                事實查核
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-button ${currentTab === 'about' ? 'active' : ''}`}
                                onClick={() => handleNavClick('about')}
                            >
                                關於我們
                            </button>
                        </li>
                        <h2><MdOutlineNaturePeople /></h2>
                    </ul>
                </nav>

                {/* 平板端漢堡選單按鈕 */}
                <button 
                    className="mobile-menu-button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <FiMenu />
                </button>

                {/* 平板端移動選單 */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-nav-list">
                        <li className="mobile-nav-item">
                            <button 
                                className={`mobile-nav-button ${currentTab === 'home' ? 'active' : ''}`}
                                onClick={() => handleNavClick('home')}
                            >
                                首頁
                            </button>
                        </li>
                        <li className="mobile-nav-item">
                            <button 
                                className={`mobile-nav-button ${currentTab === 'trending' ? 'active' : ''}`}
                                onClick={() => handleNavClick('trending')}
                            >
                                熱門內容
                            </button>
                        </li>
                        <li className="mobile-nav-item">
                            <button 
                                className={`mobile-nav-button ${currentTab === 'fact_check' ? 'active' : ''}`}
                                onClick={() => handleNavClick('fact_check')}
                            >
                                事實查核
                            </button>
                        </li>
                        <li className="mobile-nav-item">
                            <button
                                className={`mobile-nav-button ${currentTab === 'about' ? 'active' : ''}`}
                                onClick={() => handleNavClick('about')}
                            >
                                關於我們
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 回到頂部按鈕 - 只有滾動時才顯示 */}
            {showScrollTop && (
                <button className="scroll-to-top" onClick={scrollToTop}>
                    <FiChevronsUp />
                </button>
            )}
        </header>
    )
}

export default Header