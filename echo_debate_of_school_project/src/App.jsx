import { useState, useEffect } from 'react'
import './css/App.css'
import Header from './header'
import HomePage from './HomePage'
import FactCheck from './fact_check'
import AboutUs from './aboutus'
import Trending from './trending'
import Footer from './footer'
import Analysis from './analysis'
import RealTimeAnalysisPage from './pages/RealTimeAnalysisPage'

function App() {
  // 狀態設定
  const [currentTab, setCurrentTab] = useState('home') // 改為默認顯示首頁
  const [analysisState, setAnalysisState] = useState({ modelKey: null, data: null })
  const [searchQuery, setSearchQuery] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showRealTimeAnalysis, setShowRealTimeAnalysis] = useState(false)

  // 頁面切換函數 - 強制滾動到最上層
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    // 強制滾動到頁面最上層
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  // 檢查URL路由和session_id參數
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (path.startsWith('/r/')) {
      setShowRealTimeAnalysis(true);
    } else if (sessionId) {
      // 如果有session_id參數，直接跳轉到事實查核頁面並載入分析結果
      setCurrentTab('fact_check');
      setSearchQuery('柯文哲是總統'); // 預設查詢
      // 載入對應的分析結果
      loadAnalysisBySessionId(sessionId);
    } else {
      setShowRealTimeAnalysis(false);
    }
  }, []);

  // 根據session_id載入分析結果的函數
  const loadAnalysisBySessionId = (sessionId) => {
    console.log('loadAnalysisBySessionId called with sessionId:', sessionId);
    // 使用 response_b1.json 的數據
    const mockAnalysisResult = {
      weight_calculation_json: {
        llm_label: "完全錯誤",
        llm_score: 0,
        slm_score: 0.00461792666465044,
        jury_score: "反方",
        final_score: 0.0017
      },
      final_report_json: {
        topic: "柯文哲是總統",
        overall_assessment: "柯文哲目前並非台灣總統。官方選舉結果、新聞報導及社群輿論均明確指出，賴清德為現任總統，柯文哲在2024年大選中敗選，且正因法律案件纏身。此查詢為不實資訊。",
        jury_score: 94,
        jury_brief: "壓倒性證據顯示柯文哲並非總統，賴清德為現任總統。",
        evidence_digest: [
          "柯文哲目前並非台灣總統。他曾是2024年台灣總統大選的候選人，但在選舉中敗選。(來源: CURATION)",
          "2024年中華民國總統大選結果，由賴清德與蕭美琴當選並於2024年5月20日就任中華民國第16任總統、副總統。(來源: 官方選舉結果)",
          "柯文哲曾任台北市市長（2014年12月25日至2022年12月25日），現任台灣民眾黨主席。(來源: CURATION)",
          "柯文哲因京華城案涉嫌圖利，於2024年9月5日被裁定羈押禁見，並於2025年9月5日以新台幣7000萬元交保。(來源: CURATION)",
          "柯文哲因政治獻金案向民眾黨請假三個月並接受黨內調查。(來源: CURATION)"
        ],
        stake_summaries: [
          {
            side: "Advocate",
            thesis: "柯文哲是總統",
            strongest_points: [
              "柯文哲在民眾心中仍有影響力，具備『準總統級』的政治號召力。",
              "部分支持者仍期望柯文哲未來能成為總統。"
            ],
            weaknesses: [
              "缺乏官方選舉結果支持。",
              "與現任總統資訊不符。",
              "與柯文哲目前的法律狀況和黨職不符。"
            ]
          },
          {
            side: "Skeptic",
            thesis: "柯文哲目前並非總統，總統是賴清德。",
            strongest_points: [
              "柯文哲並未在最近一次總統選舉中勝出。",
              "總統職位目前由賴清德擔任。",
              "中華民國中央選舉委員會證實賴清德當選2024年總統。",
              "各大新聞媒體均報導賴清德就任總統。",
              "柯文哲目前擔任台灣民眾黨主席，並非國家元首。",
              "柯文哲因京華城案涉嫌圖利被羈押交保，並因政治獻金案請假調查。"
            ],
            weaknesses: []
          },
          {
            side: "Devil",
            thesis: "柯文哲雖非在任總統，但其影響力已達『準總統級』，且其政治之路仍在持續。",
            strongest_points: [
              "柯文哲在民眾心中所建立的『第三勢力』形象，以及在網路社群中持續保持的巨大影響力。",
              "京華城案被部分輿論解讀為政治鬥爭下的『犧牲品』，凸顯其政治潛力。",
              "『總統』概念不單純是職位，更是一種影響力、民意投射和持續發展的政治敘事。"
            ],
            weaknesses: [
              "缺乏具體數據支持其「準總統級」影響力。",
              "將法律爭議解讀為「政治手腕」或「施政魄力」缺乏普遍共識。",
              "混淆了「職位」與「影響力」的概念。"
            ]
          }
        ]
      },
      fact_check_result_json: {
        analysis: "根據多個台灣網站的資料顯示，柯文哲目前並非台灣總統。他是2024年台灣總統大選的候選人，但在選舉中敗選。現任中華民國總統為賴清德，於2024年5月20日就職。此外，柯文哲現為台灣民眾黨主席，並因涉入京華城案於2024年9月5日被羈押禁見，後於2025年9月5日交保。",
        classification: "完全錯誤"
      },
      classification_json: {
        Probability: "0.00461792666465044",
        classification: "錯誤"
      }
    };

    // 可信度評級函數
    const getCredibilityLevel = (score) => {
      if (score === 1) return '完全可信';
      if (score < 1 && score >= 0.875) return '可信度極高';
      if (score < 0.875 && score >= 0.625) return '可信度高';
      if (score < 0.625 && score > 0.5) return '可信度稍高';
      if (score === 0.5) return '半信半疑';
      if (score < 0.5 && score >= 0.375) return '可信度稍低';
      if (score < 0.375 && score >= 0.125) return '可信度低';
      if (score < 0.125 && score > 0) return '可信度極低';
      if (score === 0) return '完全不可信';
      return '未知';
    };

    // n8n陪審團評級函數
    const getN8nVerdict = (score) => {
      // 處理字串類型的jury_score
      if (typeof score === 'string') {
        if (score === '正方') return '勝訴';
        if (score === '反方') return '敗訴';
        return '未知';
      }
      
      // 處理數值類型的score
      if (score > 0) return '勝訴';
      if (score < 0) return '敗訴';
      if (score === 0) return '無法判決';
      return '未知';
    };

    // 計算整體結果
    const messageVerification = getCredibilityLevel(mockAnalysisResult.weight_calculation_json.final_score);
    const credibilityScore = (mockAnalysisResult.weight_calculation_json.final_score * 100).toFixed(1);

    const newAnalysisResult = {
      ...mockAnalysisResult,
      cofact: { found: false, correctness: '未知', perspective: '', cofactUrl: 'https://cofact.org/search?q=' + encodeURIComponent('國高中改10點上課現在實施中') },
      newsCorrectness: messageVerification,
      ambiguityScore: credibilityScore,
      analysis: mockAnalysisResult.fact_check_result_json.analysis,
      models: {
        n8n: {
          correctness: getN8nVerdict(mockAnalysisResult.weight_calculation_json.jury_score),
          truthfulness: getN8nVerdict(mockAnalysisResult.weight_calculation_json.jury_score),
          perspective: mockAnalysisResult.final_report_json.overall_assessment,
          references: mockAnalysisResult.final_report_json.evidence_digest
        },
        llm: {
          correctness: (mockAnalysisResult.weight_calculation_json.llm_score * 100).toFixed(1),
          truthfulness: (mockAnalysisResult.weight_calculation_json.llm_score * 100).toFixed(1),
          perspective: mockAnalysisResult.fact_check_result_json.analysis,
          references: mockAnalysisResult.final_report_json.evidence_digest
        },
        slm: {
          correctness: (parseFloat(mockAnalysisResult.classification_json.Probability) * 100).toFixed(1),
          truthfulness: (parseFloat(mockAnalysisResult.classification_json.Probability) * 100).toFixed(1),
          perspective: mockAnalysisResult.fact_check_result_json.analysis,
          references: mockAnalysisResult.final_report_json.evidence_digest
        }
      },
      debate: {
        prosecution: mockAnalysisResult.final_report_json.stake_summaries
          .find(s => s.side === "Advocate")?.strongest_points.map((point, index) => ({
            speaker: '正方',
            message: point,
            timestamp: `10:${30 + index}`
          })) || [],
        defense: mockAnalysisResult.final_report_json.stake_summaries
          .find(s => s.side === "Skeptic")?.strongest_points.map((point, index) => ({
            speaker: '反方',
            message: point,
            timestamp: `10:${31 + index}`
          })) || [],
        judge: {
          verdict: mockAnalysisResult.final_report_json.jury_brief,
          confidence: mockAnalysisResult.final_report_json.jury_score
        }
      }
    };

    console.log('Setting analysisResult:', newAnalysisResult);
    console.log('analysisResult.classification_json:', newAnalysisResult.classification_json);
    setAnalysisResult(newAnalysisResult);
  };

  // 最新資料
  
  const factChecks = [
    {
      id: 1,
      title: "網傳某政治人物擁有海外秘密帳戶？",
      category: "政治",
      status: "已查證",
      result: "假消息",
      date: "2024-01-15",
      summary: "經查證，該傳言缺乏具體證據支持，相關指控已被當事人否認。",
      author: "張小明"
    },
    {
      id: 2,
      title: "某品牌食品含有致癌物質？",
      category: "健康",
      status: "已查證",
      result: "部分真實",
      date: "2024-01-14",
      summary: "該品牌部分產品確實含有微量相關物質，但含量遠低於安全標準。",
      author: "李華"
    },
    {
      id: 3,
      title: "某地區將實施新的交通管制措施？",
      category: "政策",
      status: "已查證",
      result: "真實",
      date: "2024-01-13",
      summary: "相關政策文件已正式發布，將於下月開始實施。",
      author: "王美"
    },
    {
      id: 4,
      title: "AI生成的假新聞正在影響選舉結果？",
      category: "科技",
      status: "已查證",
      result: "真實",
      date: "2024-01-12",
      summary: "研究顯示AI生成的假新聞確實對選舉產生影響，需要加強監管。",
      author: "陳科技"
    },
    {
      id: 5,
      title: "某明星被拍到在餐廳與神秘人物會面？",
      category: "娛樂",
      status: "已查證",
      result: "假消息",
      date: "2024-01-11",
      summary: "照片經過PS處理，實際上是多年前的舊照片。",
      author: "劉娛樂"
    },
    {
      id: 6,
      title: "新型疫苗會改變人體DNA？",
      category: "科學",
      status: "已查證",
      result: "假消息",
      date: "2024-01-10",
      summary: "科學證據明確顯示，mRNA疫苗不會改變人體DNA。",
      author: "趙科學"
    }
  ]

  // 如果顯示實時分析頁面，直接渲染該頁面
  if (showRealTimeAnalysis) {
    return <RealTimeAnalysisPage />;
  }

  // 網頁顯現
  return (
    <div className="app">
      {/*Header*/}
      <Header currentTab={currentTab} onTabChange={handleTabChange} />

      {/*Content*/}
      {currentTab === 'home' ? (
        <HomePage onTabChange={handleTabChange} />
      ) : currentTab === 'trending' ? (
        <main className="main-content">
          <div className="content-wrapper">
            <Trending factChecks={factChecks} />
          </div>
        </main>
      ) : currentTab === 'fact_check' ? (
        <main className="main-content">
          <div className="content-wrapper">
            <FactCheck 
              searchQuery={searchQuery} 
              factChecks={factChecks} 
              setSearchQuery={setSearchQuery}
              analysisResult={analysisResult}
              setAnalysisResult={setAnalysisResult}
              onOpenAnalysis={(modelKey, data) => { setAnalysisState({ modelKey, data }); handleTabChange('analysis'); }}
              onStartRealTimeAnalysis={() => setShowRealTimeAnalysis(true)}
            />
          </div>
        </main>
      ) : currentTab === 'analysis' ? (
        <main className="main-content">
          <div className="content-wrapper">
            <Analysis 
              modelKey={analysisState.modelKey} 
              data={analysisState.data} 
              onBack={() => handleTabChange('fact_check')}
            />
          </div>
        </main>
      ) : (
        <main className="main-content">
          <div className="content-wrapper">
            <AboutUs />
          </div>
        </main>
      )}

      {/*footer*/}
      <Footer />

    </div>
  )
}

export default App