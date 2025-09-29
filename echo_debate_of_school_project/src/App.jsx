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
      setSearchQuery('國高中改10點上課現在實施中'); // 預設查詢
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
        slm_score: 0.0795,
        jury_score: -0.7244,
        final_score: 0.035
      },
      final_report_json: {
        topic: "國高中改10點上課現在實施中",
        overall_assessment: "「國高中改10點上課現在實施中」的說法為假。目前台灣並未全面實施此政策，僅為一項已達附議門檻、待教育部回應的公共政策提案。社會對此議題意見高度分歧，教育部預計於11月14日前做出回應，但過往經驗顯示全面實施的可能性較低，更傾向於彈性調整。",
        jury_score: 72,
        jury_brief: "證據不足。未全面實施，但提案已達附議門檻。",
        evidence_digest: [
          "公共政策網路參與平台：國高中改10點上課提案已達萬人附議門檻，教育部須於11/14前回應。",
          "教育部 (2017年類似提案處理)：曾有建議9點上課提案，最終未全面採納，僅放寬早自習彈性。",
          "教育部 (2022年作息調整)：修正發布作息注意事項，讓高中生第一節課前時間更有彈性，非全面延後。",
          "Yahoo新聞網路投票：超過六成參與者不贊成或完全不贊成國高中改為10點上課。",
          "社群觀察：學生普遍支持，家長、教育工作者多數反對或擔憂實際操作。"
        ],
        stake_summaries: [
          {
            side: "Advocate",
            thesis: "國高中改為上午10點上課的提案，旨在改善學生睡眠不足及提升學習效率，是符合學生福祉的改革方向。",
            strongest_points: [
              "改善學生慢性睡眠不足問題，提升學習效率。",
              "降低學生憂鬱、自傷風險。",
              "學生已具備自行通勤能力，不需配合家長作息。",
              "提案獲萬人附議，顯示廣大學生與家長強烈需求。"
            ],
            weaknesses: [
              "未能有效回應家長接送、交通、補習文化等實際衝擊。",
              "未充分說明如何解決課程時數壓縮與教學品質問題。",
              "過於樂觀看待教育部對提案的採納程度，忽略歷史經驗。"
            ]
          },
          {
            side: "Skeptic",
            thesis: "國高中改10點上課的提案，雖立意良善，但實際執行將對家庭作息、學校行政、教學品質及社會運作造成巨大衝擊，且社會反對聲浪高。",
            strongest_points: [
              "政策尚未實施，僅為提案討論中，與「實施中」說法不符。",
              "若無配套，可能壓縮教學時數，影響教學品質。",
              "學生可能將多餘時間用於補習，無法真正改善睡眠。",
              "過去類似提案最終僅給予學校彈性，顯示全面實施的複雜性。"
            ],
            weaknesses: [
              "可能低估學生睡眠不足對學習與身心健康的長期負面影響。",
              "未能提出具體替代方案來解決學生睡眠問題。",
              "過於強調現有體制的維持，可能忽略教育改革的必要性。"
            ]
          }
        ]
      },
      fact_check_result_json: {
        analysis: "根據目前的資料顯示，「國高中改10點上課現在實施中」的說法並不正確。1. 尚未全面實施： 台灣目前並沒有全面實施國高中延後至上午10點上課的政策。大部分國高中仍維持在早上7點半至8點左右開始上課。2. 公民提案與教育部回應： 國高中改為10點上課的議題，是在「公共政策網路參與平台」上獲得超過萬人附議的公民提案。教育部已承諾將針對此提案進行研議，並預計於2025年11月14日前做出具體回應。3. 過去的調整與提案：\n*   教育部在2022年3月曾修正發布「教育部主管高級中等學校學生在校作息時間規劃注意事項」，並於同年8月1日起實施。這項修正主要是讓高中生第一節課前的時間更有彈性，例如將全校性集會活動從每週最多2天調整為最多1天，其餘時間學生可自主規劃運用，但這並非全面更改上課起始時間至10點。\n*   在2017年，也曾有類似建議國高中改為上午9點上課的提案，但教育部評估後並未全面採納，當時僅放寬高中早自習和第八節課的彈性參與。4. 社會意見分歧：\n*   學生群體普遍支持延後上課，認為有助於改善睡眠品質、提升學習效率與身心發展。有些學生也觀察到部分高中已將早自習改為自主時間，被視為一種實質上的延後上課。\n*   家長與通勤族群多數反對，擔憂延後上課會衝擊家長接送、自身工作時間安排、放學時間延後可能影響補習與才藝班時間，以及對交通運作可能造成的影響。一項由Yahoo新聞發起的網路投票顯示，有超過六成的參與者不贊成或完全不贊成國高中改為10點上課。\n*   教育工作者與學校行政則持觀望態度，擔憂全面延後上課對現有課綱、教學時數、學校行政排程、教師授課時間及校園設施使用都會是巨大的挑戰，認為這與過去的彈性調整概念不同。結論：目前國高中並沒有全面實施10點上課的政策，此訊息為誤解。",
        classification: "完全錯誤"
      },
      classification_json: {
        Probability: "0.07950027287006378",
        classification: "錯誤"
      }
    };

    // 可信度評級函數
    const getCredibilityLevel = (score) => {
      if (score <= 1 && score > 0.875) return '可信度極高';
      if (score <= 0.875 && score > 0.625) return '可信度高';
      if (score <= 0.625 && score > 0.5) return '可信度稍高';
      if (score <= 0.5 && score > 0.375) return '可信度稍低';
      if (score <= 0.375 && score > 0.125) return '可信度低';
      if (score <= 0.125 && score >= 0) return '可信度極低';
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
          correctness: mockAnalysisResult.final_report_json.jury_score,
          truthfulness: mockAnalysisResult.final_report_json.jury_score,
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