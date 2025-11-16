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

    // 熱門查證相關狀態
    const [trendingData, setTrendingData] = useState([])
    const [isLoadingTrending, setIsLoadingTrending] = useState(false)
    const [trendingError, setTrendingError] = useState(null)

    // 獲取用戶歷史分析記錄
    const fetchUserHistory = async (userId = actualUserId) => {
        setIsLoadingHistory(true)
        setHistoryError(null)
        
        try {
            console.log('=== 開始獲取用戶歷史記錄 ===')
            console.log('Current User ID:', userId)
            
            // 直接使用現有的 API 端點獲取該用戶的所有 sessions
            // 避免 307 重定向，使用不帶尾部斜線的 URL
            const sessionsUrl = `/api-proxy/apps/judge/users/${userId}/sessions`
            console.log('正在獲取用戶所有 sessions:', sessionsUrl)
            
            const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                redirect: 'follow' // 明確處理重定向
            })
            
            console.log('Sessions 回應狀態:', sessionsResponse.status)
            
            if (!sessionsResponse.ok) {
                const errorText = await sessionsResponse.text()
                console.log('Sessions 錯誤內容:', errorText)
                
                // 如果主要 API 失敗，嘗試備用 API
                console.log('主要 API 失敗，嘗試備用 API...')
                const backupUrl = `/api-proxy/apps/judge/users/${userId}/sessions/`
                console.log('嘗試備用 URL:', backupUrl)
                
                const backupResponse = await fetch(backupUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    redirect: 'follow'
                })
                
                if (!backupResponse.ok) {
                    throw new Error(`獲取 sessions 失敗: ${sessionsResponse.status} - ${errorText}`)
                }
                
                const sessions = await backupResponse.json()
                console.log('備用 API 成功，獲取到的 sessions 數量:', sessions?.length || 0)
                console.log('備用 API 獲取到的 sessions 詳細:', sessions)
                
                if (!Array.isArray(sessions) || sessions.length === 0) {
                    console.log('備用 API 也沒有找到歷史 sessions，顯示空狀態')
                    setHistoryData([])
                    return
                }
                
                // 列出所有 session ID
                console.log(`備用 API 找到 ${sessions.length} 個歷史 sessions:`)
                sessions.forEach((session, index) => {
                    console.log(`  ${index + 1}. Session ID: ${session.id}`)
                    if (session.created_at) {
                        console.log(`     創建時間: ${session.created_at}`)
                    }
                    if (session.updated_at) {
                        console.log(`     更新時間: ${session.updated_at}`)
                    }
                })
                
                console.log(`開始逐個獲取詳細資料...`)
                
                // 對每個 session 逐個獲取詳細資料
                const historyResults = []
                
                for (let i = 0; i < sessions.length; i++) {
                    const session = sessions[i]
                    const sessionId = session.id
                    
                    try {
                        console.log(`處理 session ${i + 1}/${sessions.length}: ${sessionId}`)
                        
                        // 使用現有的 API 端點獲取 session 詳細資料
                        const sessionUrl = `/api-proxy/apps/judge/users/${userId}/sessions/${sessionId}`
                        console.log('正在獲取 session 詳細資料:', sessionUrl)
                
                const sessionResponse = await fetch(sessionUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                
                        console.log(`Session ${sessionId} 回應狀態:`, sessionResponse.status)
                
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json()
                            console.log(`Session ${sessionId} 獲取成功`)
                    
                            // 處理 session 資料
                    if (sessionData.state && sessionData.state.final_report_json) {
                        const finalReport = sessionData.state.final_report_json
                        const weightCalc = sessionData.state.weight_calculation_json || {}
                                const factCheck = sessionData.state.fact_check_result_json || {}
                                const classification = sessionData.state.classification_json || {}
                                
                            // 調試：檢查可用的時間戳
                            console.log(`Session ${sessionId} 的完整數據結構:`)
                            console.log('sessionData:', sessionData)
                            console.log('sessionData.state:', sessionData.state)
                            console.log('session:', session)
                            
                            console.log(`Session ${sessionId} 的時間戳選項:`)
                            console.log('- finishReason.timestamp:', sessionData.state?.finishReason?.timestamp)
                            console.log('- session.created_at:', session.created_at)
                            console.log('- sessionData.created_at:', sessionData.created_at)
                            console.log('- sessionData.updated_at:', sessionData.updated_at)
                            console.log('- sessionData.timestamp:', sessionData.timestamp)
                            console.log('- sessionData.createdAt:', sessionData.createdAt)
                            console.log('- sessionData.updatedAt:', sessionData.updatedAt)
                                
                                // 嘗試多種時間戳來源
                                let dateString = '未知日期'
                                if (sessionData.state?.finishReason?.timestamp) {
                                    dateString = new Date(sessionData.state.finishReason.timestamp).toLocaleDateString('zh-TW')
                                    console.log('使用 finishReason.timestamp:', dateString)
                                } else if (sessionData.timestamp) {
                                    dateString = new Date(sessionData.timestamp).toLocaleDateString('zh-TW')
                                    console.log('使用 sessionData.timestamp:', dateString)
                                } else if (sessionData.createdAt) {
                                    dateString = new Date(sessionData.createdAt).toLocaleDateString('zh-TW')
                                    console.log('使用 sessionData.createdAt:', dateString)
                                } else if (sessionData.updatedAt) {
                                    dateString = new Date(sessionData.updatedAt).toLocaleDateString('zh-TW')
                                    console.log('使用 sessionData.updatedAt:', dateString)
                                } else if (session.created_at) {
                                    dateString = new Date(session.created_at).toLocaleDateString('zh-TW')
                                    console.log('使用 session.created_at:', dateString)
                                } else if (sessionData.created_at) {
                                    dateString = new Date(sessionData.created_at).toLocaleDateString('zh-TW')
                                    console.log('使用 sessionData.created_at:', dateString)
                                } else if (sessionData.updated_at) {
                                    dateString = new Date(sessionData.updated_at).toLocaleDateString('zh-TW')
                                    console.log('使用 sessionData.updated_at:', dateString)
                                } else {
                                    // 如果都沒有，使用當前時間
                                    dateString = new Date().toLocaleDateString('zh-TW')
                                    console.log('使用當前時間:', dateString)
                                }
                        
                        const historyItem = {
                            id: sessionData.id,
                            title: finalReport.topic || '未知主題',
                            summary: finalReport.overall_assessment || '無評估內容',
                            result: getCredibilityLevel(weightCalc.final_score || 0.5),
                                    date: dateString,
                            sessionId: sessionData.id,
                                    finalScore: weightCalc.final_score || 0.5,
                                    analyzedText: sessionData.state.analyzed_text || '未知內容',
                                    juryBrief: finalReport.jury_brief || '無陪審團簡報',
                                    factCheckClassification: factCheck.classification || '未知',
                                    modelClassification: classification.classification || '未知',
                                    scores: {
                                        llm_score: weightCalc.llm_score || 0,
                                        slm_score: weightCalc.slm_score || 0,
                                        jury_score: weightCalc.jury_score || 0,
                                        final_score: weightCalc.final_score || 0
                                    },
                                    factCheck: factCheck,
                                    modelClassificationData: classification
                                }
                                
                                historyResults.push(historyItem)
                                console.log(`Session ${sessionId} 處理完成:`, historyItem)
                            } else {
                                console.log(`Session ${sessionId} 沒有完整的分析數據`)
                            }
                        } else {
                            console.log(`Session ${sessionId} 獲取失敗:`, sessionResponse.status)
                        }
                    } catch (error) {
                        console.log(`處理 session ${sessionId} 時發生錯誤:`, error.message)
                        continue
                    }
                }
                
                console.log(`成功處理 ${historyResults.length} 個歷史記錄`)
                console.log('處理後的歷史數據:', historyResults)
                
                // 按日期排序（最新的在前）
                historyResults.sort((a, b) => new Date(b.date) - new Date(a.date))
                
                setHistoryData(historyResults)
                console.log('=== 歷史記錄獲取完成（使用備用 API）===')
                return
            }
            
            const sessions = await sessionsResponse.json()
            console.log('獲取到的 sessions 數量:', sessions?.length || 0)
            console.log('獲取到的 sessions 詳細:', sessions)
            
            if (!Array.isArray(sessions) || sessions.length === 0) {
                console.log('沒有找到歷史 sessions，顯示空狀態')
                setHistoryData([])
                return
            }
            
            // 列出所有 session ID
            console.log(`找到 ${sessions.length} 個歷史 sessions:`)
            sessions.forEach((session, index) => {
                console.log(`  ${index + 1}. Session ID: ${session.id}`)
                if (session.created_at) {
                    console.log(`     創建時間: ${session.created_at}`)
                }
                if (session.updated_at) {
                    console.log(`     更新時間: ${session.updated_at}`)
                }
            })
            
            console.log(`開始逐個獲取詳細資料...`)
            
            // 對每個 session 逐個獲取詳細資料
            const historyResults = []
            
            for (let i = 0; i < sessions.length; i++) {
                const session = sessions[i]
                const sessionId = session.id
                
                try {
                    console.log(`處理 session ${i + 1}/${sessions.length}: ${sessionId}`)
                    
                    // 使用現有的 API 端點獲取 session 詳細資料
                    const sessionUrl = `/api-proxy/apps/judge/users/${userId}/sessions/${sessionId}`
                    console.log('正在獲取 session 詳細資料:', sessionUrl)
                    
                    const sessionResponse = await fetch(sessionUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                    
                    console.log(`Session ${sessionId} 回應狀態:`, sessionResponse.status)
                    
                    if (sessionResponse.ok) {
                        const sessionData = await sessionResponse.json()
                        console.log(`Session ${sessionId} 獲取成功`)
                        
                        // 處理 session 資料
                        if (sessionData.state && sessionData.state.final_report_json) {
                            const finalReport = sessionData.state.final_report_json
                            const weightCalc = sessionData.state.weight_calculation_json || {}
                            const factCheck = sessionData.state.fact_check_result_json || {}
                            const classification = sessionData.state.classification_json || {}
                            
                            // 調試：檢查可用的時間戳
                            console.log(`備用API Session ${sessionId} 的完整數據結構:`)
                            console.log('sessionData:', sessionData)
                            console.log('sessionData.state:', sessionData.state)
                            console.log('session:', session)
                            
                            console.log(`備用API Session ${sessionId} 的時間戳選項:`)
                            console.log('- finishReason.timestamp:', sessionData.state?.finishReason?.timestamp)
                            console.log('- session.created_at:', session.created_at)
                            console.log('- sessionData.created_at:', sessionData.created_at)
                            console.log('- sessionData.updated_at:', sessionData.updated_at)
                            console.log('- sessionData.timestamp:', sessionData.timestamp)
                            console.log('- sessionData.createdAt:', sessionData.createdAt)
                            console.log('- sessionData.updatedAt:', sessionData.updatedAt)
                            
                            // 嘗試多種時間戳來源
                            let dateString = '未知日期'
                            if (sessionData.state?.finishReason?.timestamp) {
                                dateString = new Date(sessionData.state.finishReason.timestamp).toLocaleDateString('zh-TW')
                                console.log('使用 finishReason.timestamp:', dateString)
                            } else if (sessionData.timestamp) {
                                dateString = new Date(sessionData.timestamp).toLocaleDateString('zh-TW')
                                console.log('使用 sessionData.timestamp:', dateString)
                            } else if (sessionData.createdAt) {
                                dateString = new Date(sessionData.createdAt).toLocaleDateString('zh-TW')
                                console.log('使用 sessionData.createdAt:', dateString)
                            } else if (sessionData.updatedAt) {
                                dateString = new Date(sessionData.updatedAt).toLocaleDateString('zh-TW')
                                console.log('使用 sessionData.updatedAt:', dateString)
                            } else if (session.created_at) {
                                dateString = new Date(session.created_at).toLocaleDateString('zh-TW')
                                console.log('使用 session.created_at:', dateString)
                            } else if (sessionData.created_at) {
                                dateString = new Date(sessionData.created_at).toLocaleDateString('zh-TW')
                                console.log('使用 sessionData.created_at:', dateString)
                            } else if (sessionData.updated_at) {
                                dateString = new Date(sessionData.updated_at).toLocaleDateString('zh-TW')
                                console.log('使用 sessionData.updated_at:', dateString)
                            } else {
                                // 如果都沒有，使用當前時間
                                dateString = new Date().toLocaleDateString('zh-TW')
                                console.log('使用當前時間:', dateString)
                            }
                        
                        const historyItem = {
                                id: sessionData.id,
                            title: finalReport.topic || '未知主題',
                            summary: finalReport.overall_assessment || '無評估內容',
                            result: getCredibilityLevel(weightCalc.final_score || 0.5),
                                date: dateString,
                                sessionId: sessionData.id,
                                finalScore: weightCalc.final_score || 0.5,
                                analyzedText: sessionData.state.analyzed_text || '未知內容',
                                juryBrief: finalReport.jury_brief || '無陪審團簡報',
                                factCheckClassification: factCheck.classification || '未知',
                                modelClassification: classification.classification || '未知',
                                scores: {
                                    llm_score: weightCalc.llm_score || 0,
                                    slm_score: weightCalc.slm_score || 0,
                                    jury_score: weightCalc.jury_score || 0,
                                    final_score: weightCalc.final_score || 0
                                },
                                factCheck: factCheck,
                                modelClassificationData: classification
                            }
                            
                            historyResults.push(historyItem)
                            console.log(`Session ${sessionId} 處理完成:`, historyItem)
                        } else {
                            console.log(`Session ${sessionId} 沒有完整的分析數據`)
                        }
                    } else {
                        console.log(`Session ${sessionId} 獲取失敗:`, sessionResponse.status)
                    }
                } catch (error) {
                    console.log(`處理 session ${sessionId} 時發生錯誤:`, error.message)
                    continue
                }
            }
            
            console.log(`成功處理 ${historyResults.length} 個歷史記錄`)
            console.log('處理後的歷史數據:', historyResults)
            
            // 按日期排序（最新的在前）
            historyResults.sort((a, b) => new Date(b.date) - new Date(a.date))
            
            setHistoryData(historyResults)
            console.log('=== 歷史記錄獲取完成 ===')
            
        } catch (error) {
            console.error('獲取歷史數據失敗:', error)
            setHistoryError(`取得失敗: ${error.message}`)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // 獲取熱門查證數據
    const fetchTrendingData = async () => {
        setIsLoadingTrending(true)
        setTrendingError(null)
        
        try {
            console.log('=== 開始獲取熱門查證資料 ===')
            
            // 直接使用現有的 API 獲取最新的 sessions
            const sessionsUrl = `http://120.107.172.114:8080/apps/judge/users/Ub57p8h5pm9db7u62uh8pj/sessions`
            console.log('正在獲取最新 sessions:', sessionsUrl)
            
            const sessionsResponse = await fetch(sessionsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            })
            
            console.log('Sessions 回應狀態:', sessionsResponse.status)
            console.log('Sessions 回應頭:', Object.fromEntries(sessionsResponse.headers.entries()))
            
            if (!sessionsResponse.ok) {
                const errorText = await sessionsResponse.text()
                console.log('Sessions 錯誤內容:', errorText)
                console.log('Sessions 錯誤狀態:', sessionsResponse.status)
                console.log('Sessions 錯誤狀態文字:', sessionsResponse.statusText)
                throw new Error(`獲取 sessions 失敗: ${sessionsResponse.status} - ${errorText}`)
            }
            
            const sessionsData = await sessionsResponse.json()
            console.log('獲取到的 sessions 數據:', sessionsData)
            
            // 取最新的 5 個 sessions
            const latestSessions = sessionsData.slice(0, 5)
            console.log('最新的 5 個 sessions:', latestSessions)
            
            // 逐一獲取每個 session 的詳細資料
            const trendingData = []
            for (let i = 0; i < latestSessions.length; i++) {
                const sessionId = latestSessions[i]
                console.log(`正在獲取 session ${i + 1}/${latestSessions.length}: ${sessionId}`)
                
                try {
                    const sessionUrl = `http://120.107.172.114:8080/apps/judge/users/Ub57p8h5pm9db7u62uh8pj/sessions/${sessionId}`
                    const sessionResponse = await fetch(sessionUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                    })
                    
                    console.log(`Session ${sessionId} 回應狀態:`, sessionResponse.status)
                    console.log(`Session ${sessionId} 回應頭:`, Object.fromEntries(sessionResponse.headers.entries()))
                    
                    if (sessionResponse.ok) {
                        const sessionData = await sessionResponse.json()
                        console.log(`Session ${sessionId} 詳細資料:`, sessionData)
                        
                        // 處理時間戳
                        let dateString = '未知日期'
                        if (sessionData.timestamp) {
                            try {
                                const date = new Date(sessionData.timestamp)
                                if (!isNaN(date.getTime())) {
                                    dateString = date.toLocaleDateString('zh-TW', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                }
                            } catch (e) {
                                console.log('日期解析失敗:', e)
                            }
                        }
                        
                        // 處理模型分類
                        let modelClassification = '未知'
                        if (sessionData.model_classification && typeof sessionData.model_classification === 'object') {
                            modelClassification = sessionData.model_classification.classification || '未知'
                        } else if (typeof sessionData.model_classification === 'string') {
                            modelClassification = sessionData.model_classification
                        }
                        
                        const trendingItem = {
                            id: `trending-${sessionId}-${i}`,
                            sessionId: sessionId,
                            userId: 'Ub57p8h5pm9db7u62uh8pj',
                            date: dateString,
                            title: sessionData.topic || `查證主題 ${sessionId.substring(0, 8)}...`,
                            summary: sessionData.analyzed_text || '這是熱門查證記錄',
                            result: sessionData.overall_assessment || '中等可信度',
                            analyzedText: sessionData.analyzed_text || '這是熱門查證記錄',
                            juryBrief: sessionData.jury_brief || '陪審團簡報內容',
                            scores: sessionData.scores || {
                                llm_score: 0.6,
                                slm_score: 0.5,
                                jury_score: 0.5,
                                final_score: 0.6
                            },
                            factCheckClass: sessionData.fact_check_classification || '政治',
                            modelClass: modelClassification,
                            credibilityLevel: sessionData.credibility_level || '中等可信度'
                        }
                        
                        trendingData.push(trendingItem)
                        console.log(`Session ${sessionId} 處理完成`)
                    } else {
                        const errorText = await sessionResponse.text()
                        console.log(`Session ${sessionId} 獲取失敗: ${sessionResponse.status}`)
                        console.log(`Session ${sessionId} 錯誤內容:`, errorText)
                        console.log(`Session ${sessionId} 錯誤狀態文字:`, sessionResponse.statusText)
                    }
                } catch (error) {
                    console.error(`處理 session ${sessionId} 時發生錯誤:`, error)
                }
            }
            
            console.log('所有熱門查證數據處理完成:', trendingData)
            setTrendingData(trendingData)
            console.log('=== 熱門查證獲取完成 ===')
            
        } catch (error) {
            console.error('獲取熱門查證數據失敗:', error)
            setTrendingError(`獲取熱門查證數據失敗: ${error.message}`)
        } finally {
            setIsLoadingTrending(false)
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

    // 組件載入時獲取歷史數據和熱門查證數據
    useEffect(() => {
        const initializeData = async () => {
            const actualUserId = await getUserIdFromSession()
            console.log('實際使用的 user_id:', actualUserId)
            setActualUserId(actualUserId)
            fetchUserHistory(actualUserId)
            fetchTrendingData()
        }
        
        initializeData()
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
                                    <article key={item.id} className="fact-check-item history-card">
                                        <div className="item-content">
                                            <div className="item-date">
                                                {item.date}
                                            </div><br />
                                            <div className="item-header">
                                                <span className={`status-badge ${item.result.includes('高') ? 'true' : item.result.includes('低') ? 'false' : 'mixed'}`}>
                                                    {item.result}
                                                </span>
                                            </div>
                                            <h3 className="item-title">{item.title}</h3>
                                            <p className="item-summary">{item.summary}</p>
                                            
                                            {/* 詳細分析信息 - 下拉式 */}
                                            <div className="analysis-details-collapsible">
                                                <button 
                                                    className="toggle-details-btn"
                                                    onClick={() => {
                                                        const details = document.getElementById(`details-${item.id}`)
                                                        if (details) {
                                                            details.style.display = details.style.display === 'none' ? 'block' : 'none'
                                                        }
                                                    }}
                                                >
                                                    <span className="toggle-text">查看詳細分析</span>
                                                    <span className="toggle-icon">▼</span>
                                                </button>
                                                
                                                <div id={`details-${item.id}`} className="analysis-details" style={{display: 'none'}}>
                                                    <div className="detail-section">
                                                        <h4>分析內容</h4>
                                                        <p className="analyzed-text">{item.analyzedText}</p>
                                                    </div>
                                                    
                                                    <div className="detail-section">
                                                        <h4>陪審團宣稱</h4>
                                                        <p className="jury-brief">{item.juryBrief}</p>
                                                    </div>
                                                    
                                                    <div className="detail-section">
                                                        <h4>評分詳情</h4>
                                                        <div className="score-details">
                                                            <span className="score-item">私家偵探：{Math.round((item.scores.llm_score || 0) * 100)}%</span>
                                                            <span className="score-item">業界學者：{Math.round((item.scores.slm_score || 0) * 100)}%</span>
                                                            <span className="score-item">陪審團：{Math.round((item.scores.jury_score || 0) * 100)}%</span>
                                                            <span className="score-item final-score">最終分數：{Math.round((item.scores.final_score || 0) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* 跳轉到詳細資料的按鈕 */}
                                            <div className="action-buttons">
                                                <button 
                                                    className="view-details-btn"
                                                    onClick={() => {
                                                        // 修改 URL 的 session_id 參數
                                                        const url = new URL(window.location.href)
                                                        url.searchParams.set('session_id', item.sessionId)
                                                        window.location.href = url.toString()
                                                    }}
                                                >
                                                    <span className="btn-text">查看詳細分析</span>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Trending