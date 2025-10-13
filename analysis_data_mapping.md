# 分析數據結構映射

## 從 Session API 提取的分析 Key 值

基於 session ID: `f429a410-dfa7-4f87-9a0c-cb89f83a4a8d` 的實際數據結構

### 1. 權重計算數據 (weight_calculation_json)
```json
{
    "llm_label": "部分正確",
    "llm_score": 0.75,
    "slm_score": 0.0037,
    "jury_score": -0.7244,
    "final_score": 0.4063
}
```

### 2. 最終報告數據 (final_report_json)
```json
{
    "topic": "川普總統宣布對中國商品徵收100%關稅",
    "overall_assessment": "川普總統宣布對中國商品徵收100%關稅...",
    "jury_score": 80,
    "jury_brief": "事實查核顯示川普總統...",
    "evidence_digest": [
        "川普總統宣布10月10日宣布對中國商品徵收100%關稅...",
        "事實查核顯示川普總統...",
        "川普政府已對中國商品徵收關稅...",
        "即使川普總統的關稅政策..."
    ],
    "stake_summaries": [
        {
            "side": "Advocate",
            "thesis": "川普對中國商品的關稅政策強硬保護美國利益...",
            "strongest_points": [...],
            "weaknesses": [...]
        },
        {
            "side": "Skeptic", 
            "thesis": "事實查核的關稅政策可能導致經濟不穩定...",
            "strongest_points": [...],
            "weaknesses": [...]
        },
        {
            "side": "Devil",
            "thesis": "事實查核的立場可能不正確...",
            "strongest_points": [...],
            "weaknesses": [...]
        }
    ],
    "key_contentions": [
        {
            "question": "事實查核宣布的關稅政策事實是否正確？",
            "what_advocates_say": [...],
            "what_skeptics_say": [...],
            "what_devil_pushed": [...],
            "status": "證據不足"
        }
    ],
    "risks": [
        {
            "name": "經濟的不確定性",
            "why": "事實查核的立場...",
            "mitigation": "未來經濟評估..."
        }
    ],
    "open_questions": [
        "如果事實查核沒有經過總統選舉...",
        "即使事實查核不正確...",
        "關於關稅政策事實對經濟..."
    ],
    "appendix_links": ["相關連結"]
}
```

### 3. 事實查核結果 (fact_check_result_json)
```json
{
    "analysis": "事實查核：根據中國央社、LINE Bank、自由財經、Yahoo新聞等多個來源...",
    "classification": "部分正確"
}
```

### 4. 分類結果 (classification_json)
```json
{
    "Probability": "0.003721293294802308",
    "classification": "錯誤"
}
```

## 完整的 Session State 結構

### 所有可用的 Key 值：
- `analyzed_text` - 分析文本
- `classification_json` - 分類結果
- `classification_result` - 分類結果
- `classification_tool_called` - 分類工具調用
- `curation` - 策展數據
- `curation_raw` - 原始策展數據
- `debate_messages` - 辯論訊息
- `devil_search_raw` - 魔鬼搜索原始數據
- `devil_turn` - 魔鬼轉向
- `disrupter` - 破壞者
- `echo_chamber` - 回音室
- `evidence_checked` - 證據檢查
- `evidence_raw` - 原始證據
- `fact_check_result` - 事實查核結果
- `fact_check_result_json` - 事實查核結果 JSON
- `fallacy_list` - 謬誤列表
- `final_report_json` - 最終報告 JSON
- `history` - 歷史
- `influencer` - 影響者
- `influencer_1` - 影響者1
- `influencer_2` - 影響者2
- `JuryOutputfinal_json` - 陪審團最終輸出 JSON
- `jury_result` - 陪審團結果
- `next_decision` - 下一步決定
- `orchestrator_exec` - 協調器執行
- `social_log` - 社交日誌
- `social_noise` - 社交噪音
- `stop_signal` - 停止信號
- `weight_calculation_json` - 權重計算 JSON
- `weight_calculation_result` - 權重計算結果

## 分析表對應關係

### 主要分析數據來源：
1. **權重計算** → `weight_calculation_json`
2. **最終報告** → `final_report_json` 
3. **事實查核** → `fact_check_result_json`
4. **分類結果** → `classification_json`

### 輔助數據：
- **辯論訊息** → `debate_messages`
- **證據檢查** → `evidence_checked`
- **陪審團結果** → `jury_result`
- **影響者分析** → `influencer`, `influencer_1`, `influencer_2`
