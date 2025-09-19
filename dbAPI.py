import os, decimal, datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
PG_DSN = os.getenv("PG_DSN")
if not PG_DSN:
    raise RuntimeError("PG_DSN not set")

engine = create_engine(PG_DSN, pool_pre_ping=True, future=True)
app = FastAPI(title="Echo Debate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pinchen1017.github.io",
        "http://127.0.0.1:5173", "http://localhost:5173",
        "http://127.0.0.1:8000", "http://localhost:8000",
    ],
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
