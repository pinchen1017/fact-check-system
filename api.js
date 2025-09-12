POST /runs
Body: { url?, text?, image_base64?, audio_base64?, from: "line" }
Resp: {
  run_id: "rk_9xZp...",
  quick_verdict: { label:"偏假", score_true:0.23, reason:"來源等級低/KB未命中" },
  deep_link: "https://app.example.com/r/rk_9xZp...?t=JWT"
}

GET /runs/{run_id}
Resp: {
  status: "running"|"done"|"failed",
  overview: {
    verdict: "真/假/部分/不確定",
    score_true: 0~1,
    radar: { source,evidence,consistency,tone,script_match,risk_steps,action_complexity },
    last_updated: "2025-08-30T03:15:00Z"
  },
  summary: {
    pros: [{title, quote, url, source_tier}],
    cons: [{title, quote, url, source_tier}],
    judge: { ruling, rationale }
  },
  links: { debate: "/runs/{id}/debate", evidence: "/runs/{id}/evidence" }
}

GET /runs/{run_id}/debate
Resp: {
  rounds: [
    { idx:1, speaker:"Advocate", claim_id:"c1", text:"...", evidence_ids:["e12"] },
    { idx:2, speaker:"Skeptic", text:"...", refute_of:1, evidence_ids:["e7","e9"] },
    ...
  ]
}

GET /runs/{run_id}/evidence
Resp: {
  items: [
    { id:"e12", title:"...", url:"...", quote:"...", snapshot_hash:"...", captured_at:"..." , domain_tier:1 }
  ]
}
