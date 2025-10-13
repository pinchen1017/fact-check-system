import os, decimal, datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
PG_DSN = os.getenv("PG_DSN")
if not PG_DSN:
    print("Warning: PG_DSN not set, using in-memory database")
    # 使用 SQLite 作為後備
    engine = create_engine("sqlite:///./test.db", pool_pre_ping=True, future=True)
else:
    engine = create_engine(PG_DSN, pool_pre_ping=True, future=True)
app = FastAPI(title="Echo Debate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pinchen1017.github.io",
        "http://127.0.0.1:5173", "http://localhost:5173",
        "http://127.0.0.1:8000", "http://localhost:8000",
        "http://172.20.112.1:5173",  # 添加本機 IP
        "*"  # 開發環境允許所有來源
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _norm(v):
    if isinstance(v, decimal.Decimal): return float(v)
    if isinstance(v, (datetime.datetime, datetime.date)): return v.isoformat()
    return v
def row2dict(row): return {k: _norm(v) for k, v in dict(row).items()}

@app.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"ok": True}

@app.get("/analysis/{t}")
def analysis(t: str):
    with engine.connect() as conn:
        conv = conn.execute(text("""
            SELECT status, input_text FROM conversations WHERE t=:t
        """), {"t": t}).mappings().first()
        if not conv:
            raise HTTPException(404, "not found")
        if conv["status"] != "done":
            return {"status": conv["status"], "input_text": conv["input_text"]}

        summary = conn.execute(text("""
            SELECT cofact_correctness, cofact_viewpoints,
                   news_truth_label, credibility_percent,
                   model_final_correctness, model_viewpoints,
                   judge_final_verdict, judge_confidence,
                   llm_correctness, llm_viewpoints, llm_refs,
                   slm_correctness, extra, created_at
            FROM analysis_summary
            WHERE conversation_t=:t
        """), {"t": t}).mappings().first()

        turns = conn.execute(text("""
            SELECT side, turn_index, content, score, meta
            FROM debate_turns
            WHERE conversation_t=:t
            ORDER BY side, turn_index
        """), {"t": t}).mappings().all()

    return {
        "status": "done",
        "input_text": conv["input_text"],
        "summary": row2dict(summary) if summary else {},
        "debate": [row2dict(r) for r in turns],
    }

# 添加 session 相關端點
from pydantic import BaseModel
from typing import Dict, Any
import uuid

class SessionCreate(BaseModel):
    appName: str
    userId: str
    sessionId: str

class SessionResponse(BaseModel):
    id: str
    appName: str
    userId: str
    state: Dict[str, Any] = {}

# 存儲 sessions 的簡單字典（生產環境應使用數據庫）
sessions_db = {}

@app.post("/apps/judge/users/user/sessions", response_model=SessionResponse)
def create_session(session_data: SessionCreate):
    """創建新的 session"""
    session_id = session_data.sessionId
    sessions_db[session_id] = {
        "id": session_id,
        "appName": session_data.appName,
        "userId": session_data.userId,
        "state": {}
    }
    return SessionResponse(
        id=session_id,
        appName=session_data.appName,
        userId=session_data.userId,
        state={}
    )

@app.get("/apps/judge/users/user/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str):
    """獲取指定的 session"""
    if session_id not in sessions_db:
        raise HTTPException(404, "Session not found")
    return SessionResponse(**sessions_db[session_id])

@app.get("/apps/judge/users/user/sessions/")
def list_sessions():
    """列出所有 sessions"""
    return list(sessions_db.values())

# 添加 run 端點
class RunRequest(BaseModel):
    appName: str
    userId: str
    sessionId: str
    newMessage: Dict[str, Any]
    streaming: bool = False

@app.post("/run")
def run_analysis(request: RunRequest):
    """執行分析"""
    import json
    import random
    from datetime import datetime
    
    # 獲取用戶訊息
    user_message = request.newMessage.get("parts", [{}])[0].get("text", "")
    session_id = request.sessionId
    
    print(f"收到分析請求 - Session: {session_id}, Message: {user_message}")
    
    # 檢查 session 是否存在
    if session_id not in sessions_db:
        raise HTTPException(404, "Session not found")
    
    # 模擬分析過程 - 生成符合前端期望的格式
    analysis_result = {
        "id": session_id,
        "appName": request.appName,
        "userId": request.userId,
        "state": {
            "_init_session": f"分析會話已初始化，正在處理：{user_message}",
            "weight_calculation_json": {
                "llm_score": round(random.uniform(0.3, 0.9), 2),
                "slm_score": round(random.uniform(0.2, 0.8), 2),
                "jury_score": round(random.uniform(0.4, 0.9), 2),
                "verdict_result": round(random.uniform(0.3, 0.8), 2),
                "llm_label": random.choice(["真實", "假消息", "不確定", "需要更多證據"])
            },
            "final_report_json": {
                "topic": user_message,
                "overall_assessment": f"基於多agent分析，此消息的真實性評估為：{random.choice(['高', '中', '低'])}可信度",
                "jury_score": random.randint(30, 90),
                "jury_brief": f"陪審團評估：{user_message} 的可信度為 {random.randint(30, 90)}%",
                "evidence_digest": [
                    "多個事實查核機構已驗證此消息",
                    "專家意見存在分歧",
                    "需要進一步調查確認"
                ],
                "stake_summaries": [
                    "正方觀點：支持消息真實性",
                    "反方觀點：質疑消息來源",
                    "法官裁決：需要更多證據"
                ]
            },
            "fact_check_result_json": {
                "analysis": f"事實查核結果：{user_message} 經過多方驗證，可信度為 {random.randint(40, 85)}%",
                "classification": random.choice(["真實", "假消息", "不確定", "需要更多證據"]),
                "confidence": round(random.uniform(0.4, 0.9), 2)
            },
            "classification_json": {
                "classification": random.choice(["真實", "假消息", "不確定"]),
                "Probability": str(round(random.uniform(0.3, 0.9), 2))
            }
        },
        "events": [
            {
                "event": "analysis_started",
                "timestamp": datetime.now().isoformat(),
                "message": "開始多agent分析"
            },
            {
                "event": "llm_analysis",
                "timestamp": datetime.now().isoformat(),
                "message": "大型語言模型分析完成"
            },
            {
                "event": "slm_analysis", 
                "timestamp": datetime.now().isoformat(),
                "message": "小型語言模型分析完成"
            },
            {
                "event": "jury_deliberation",
                "timestamp": datetime.now().isoformat(),
                "message": "陪審團審議完成"
            },
            {
                "event": "analysis_completed",
                "timestamp": datetime.now().isoformat(),
                "message": "分析完成"
            }
        ]
    }
    
    # 更新 session 狀態
    sessions_db[session_id]["state"] = analysis_result["state"]
    
    print(f"分析完成 - Session: {session_id}")
    return analysis_result
