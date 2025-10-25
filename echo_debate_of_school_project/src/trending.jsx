import { useState, useEffect } from 'react'
import './css/header.css'
import './css/trending.css'
import { MdVerifiedUser } from "react-icons/md"
import { MdOutlineHistoryToggleOff } from "react-icons/md"

{/*Trending*/ }
function Trending({ factChecks, currentUserId = 'user' }) {
    const [historyData, setHistoryData] = useState([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [historyError, setHistoryError] = useState(null)
    const [actualUserId, setActualUserId] = useState(currentUserId)

    // 獲取用戶歷史分析記錄
    const fetchUserHistory = async (userId = actualUserId) => {
        setIsLoadingHistory(true)
        setHistoryError(null)
        
        try {
            console.log('=== 開始獲取用戶歷史記錄 ===')
            console.log('Current User ID:', userId)
            
            // 使用單個 session 查詢方法（避免 307 重定向問題）
            const currentSessionId = new URLSearchParams(window.location.search).get('session_id')
            console.log('當前 session_id:', currentSessionId)
            
            if (currentSessionId) {
                // 查詢當前 session 的詳細資料
                const sessionUrl = `/api-proxy/apps/judge/users/${userId}/sessions/${currentSessionId}`
                console.log('正在獲取當前 session 詳細資料:', sessionUrl)
                
                const sessionResponse = await fetch(sessionUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                
                console.log('Session 回應狀態:', sessionResponse.status)
                
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json()
                    console.log('獲取到的 session 資料:', sessionData)
                    
                    // 處理當前 session 的資料
                    if (sessionData.state && sessionData.state.final_report_json) {
                        const finalReport = sessionData.state.final_report_json
                        const weightCalc = sessionData.state.weight_calculation_json || {}
                        
                        const historyItem = {
                            id: sessionData.id,
                            title: finalReport.topic || '未知主題',
                            summary: finalReport.overall_assessment || '無評估內容',
                            result: getCredibilityLevel(weightCalc.final_score || 0.5),
                            date: new Date(sessionData.created_at || Date.now()).toLocaleDateString('zh-TW'),
                            sessionId: sessionData.id,
                            finalScore: weightCalc.final_score || 0.5
                        }
                        
                        console.log('當前 session 處理完成:', historyItem)
                        setHistoryData([historyItem])
                        return
                    }
                }
            }
            
            // 如果沒有當前 session 或查詢失敗，嘗試獲取所有 sessions
            const sessionsUrl = `/api-proxy/apps/judge/users/${userId}/sessions/`
            console.log('正在獲取用戶歷史 sessions:', sessionsUrl)
            
            const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            
            console.log('Sessions 回應狀態:', sessionsResponse.status)
            
            if (!sessionsResponse.ok) {
                const errorText = await sessionsResponse.text()
                console.log('Sessions 錯誤內容:', errorText)
                throw new Error(`獲取 sessions 失敗: ${sessionsResponse.status} - ${errorText}`)
            }
            
            const sessions = await sessionsResponse.json()
            console.log('獲取到的 sessions 數量:', sessions?.length || 0)
            console.log('獲取到的 sessions 詳細:', sessions)
            
            if (!Array.isArray(sessions) || sessions.length === 0) {
                console.log('沒有找到歷史 sessions，顯示空狀態')
                setHistoryData([])
                return
            }
            
            console.log(`找到 ${sessions.length} 個歷史 sessions，直接處理完整資料...`)
            
            // 直接處理每個 session 的完整資料（不需要額外查詢）
            const historyResults = sessions.map((session, index) => {
                try {
                    console.log(`處理 session ${index + 1}/${sessions.length}: ${session.id}`)
                    
                    // 直接從 session 資料中提取需要的數據
                    if (session.state && session.state.final_report_json) {
                        const finalReport = session.state.final_report_json
                        const weightCalc = session.state.weight_calculation_json || {}
                        
                        const historyItem = {
                            id: session.id,
                            title: finalReport.topic || '未知主題',
                            summary: finalReport.overall_assessment || '無評估內容',
                            result: getCredibilityLevel(weightCalc.final_score || 0.5),
                            date: new Date(session.created_at || Date.now()).toLocaleDateString('zh-TW'),
                            sessionId: session.id,
                            finalScore: weightCalc.final_score || 0.5
                        }
                        
                        console.log(`Session ${session.id} 處理完成:`, historyItem)
                        return historyItem
                    } else {
                        console.log(`Session ${session.id} 沒有 final_report_json 數據`)
                        return null
                    }
                } catch (error) {
                    console.log(`處理 session ${session.id} 失敗:`, error.message)
                    return null
                }
            })
            
            const validHistory = historyResults.filter(item => item !== null)
            
            console.log(`成功處理 ${validHistory.length} 個歷史記錄`)
            console.log('處理後的歷史數據:', validHistory)
            
            // 按日期排序（最新的在前）
            validHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
            
            setHistoryData(validHistory)
            console.log('=== 歷史記錄獲取完成 ===')
            
        } catch (error) {
            console.error('獲取歷史數據失敗:', error)
            setHistoryError(`取得失敗: ${error.message}`)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // 可信度評級函數
    const getCredibilityLevel = (score) => {
        if (score === 1) return '完全可信'
        if (score < 1 && score >= 0.875) return '可信度極高'
        if (score < 0.875 && score >= 0.625) return '可信度高'
        if (score < 0.625 && score > 0.5) return '可信度稍高'
        if (score === 0.5) return '半信半疑'
        if (score < 0.5 && score >= 0.375) return '可信度稍低'
        if (score < 0.375 && score >= 0.125) return '可信度低'
        if (score < 0.125 && score > 0) return '可信度極低'
        if (score === 0) return '完全不可信'
        return '未知'
    }

    // 從 URL 獲取 session_id 並獲取對應的 user_id
    const getUserIdFromSession = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const sessionId = params.get('session_id')
            
            if (sessionId) {
                console.log('從 URL 獲取到 session_id:', sessionId)
                
                // 通過 API 獲取對應的 user_id
                const response = await fetch(`/local-api/get_user_by_session?sessionId=${encodeURIComponent(sessionId)}`)
                if (response.ok) {
                    const data = await response.json()
                    const userId = data.userId
                    console.log('獲取到對應的 user_id:', userId)
                    return userId
                } else {
                    console.log('無法獲取 user_id，使用預設值')
                    return currentUserId
                }
            } else {
                console.log('URL 中沒有 session_id，使用預設值')
                return currentUserId
            }
        } catch (error) {
            console.log('獲取 user_id 失敗:', error)
            return currentUserId
        }
    }

    // 組件載入時獲取歷史數據
    useEffect(() => {
        const initializeHistory = async () => {
            const actualUserId = await getUserIdFromSession()
            console.log('實際使用的 user_id:', actualUserId)
            setActualUserId(actualUserId)
            fetchUserHistory(actualUserId)
        }
        
        initializeHistory()
    }, [])

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

                        {isLoadingHistory ? (
                            <div className="loading-message">
                                <p>正在載入歷史查證記錄...</p>
                            </div>
                        ) : historyError ? (
                            <div className="error-message">
                                <p>載入歷史記錄失敗: {historyError}</p>
                                <button onClick={fetchUserHistory} className="retry-button">
                                    重試
                                </button>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="empty-message">
                                <p>暫無歷史查證記錄</p>
                            </div>
                        ) : (
                            <div className="fact-checks-list">
                                {historyData.map((item) => (
                                    <article key={item.id} className="fact-check-item">
                                        <div className="item-content">
                                            <div className="item-header">
                                                <span className={`status-badge ${item.result.includes('高') ? 'true' : item.result.includes('低') ? 'false' : 'mixed'}`}>
                                                    {item.result}
                                                </span>
                                            </div>
                                            <h3 className="item-title">{item.title}</h3>
                                            <p className="item-summary">{item.summary}</p>
                                            <div className="item-meta">
                                                <span className="item-date">{item.date}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
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