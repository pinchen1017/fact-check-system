function SlmAnalysis({ data }){
  if (!data) return null

  return (
    <div className="model-analysis slm">
      <div className="model-metrics">
        <div className="metric-item">
          <span>正確性</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{width: `${data?.correctness ?? 0}%`}}></div>
          </div>
          <span className="metric-value">{data?.correctness ?? 0}%</span>
        </div>
        <div className="metric-item">
          <span>真實性分數</span>
          <div className="metric-bar">
            <div className="metric-fill truth" style={{width: `${data?.truthfulness ?? 0}%`}}></div>
          </div>
          <span className="metric-value">{data?.truthfulness ?? 0}%</span>
        </div>
      </div>
      
      {/* 參考網址
      {data?.references && data.references.length > 0 && (
        <div className="references">
          <h3>參考網址</h3>
          <ul>
            {data.references.map((ref, index) => (
              <li key={index}>
                <a href={ref} target="_blank" rel="noopener noreferrer">
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  )
}

export default SlmAnalysis