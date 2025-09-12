import './css/footer.css'

function Footer(){
    return(
        <footer className='footer'>
            <div className='footer-container'>
                {/* 使用方式 */}
                <div className='footer-section'>
                    <h3>使用方式</h3>
                    <div className='footer-content'>
                        <p>1. 在 LINE 將新聞或貼文<strong>分享</strong>給 Debat & Echo。</p>
                        <p>2. 立即取得<strong>快判分數</strong>與一句話理由。</p>
                        <p>3. 點開連結至網頁查看<strong>完整辯論、證據鏈與風險分析</strong>。</p>
                    </div>
                </div>

                {/* 团队信息 */}
                <div className='footer-section'>
                    <h3>團隊</h3>
                    <div className='footer-content'>
                        <p><strong>指導單位：</strong>國立彰化師範大學 資訊工程學系</p>
                        <p><strong>成員：</strong>資工系學生</p>
                        <p><strong>指導教授：</strong>賴聯福 教授</p>
                        <p><strong>目標：</strong>以工程實作回應資訊亂象，讓每個人都能更快找到可信的答案。</p>
                    </div>
                </div>

                {/* 联络合作 */}
                <div className='footer-section'>
                    <h3>聯絡與合作</h3>
                    <div className='footer-content'>
                        <p><strong>合作洽談／資料授權／教育方案：</strong><br/>lflai@gm.ncue.edu.tw</p>
                        <p><strong>Git/技術文件：</strong><br/>https://github.com/Grasonyang/Agent-Judge</p>
                        <p><strong>LINE 官方入口：</strong><br/>@730cdmmq</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer