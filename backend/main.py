# backend/main.py
import os
import json
import logging
import traceback
from typing import Optional

import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# ---------- 環境變數（可由 Render Dashboard 設定） ----------
DB_HOST = os.getenv("DB_HOST", "35.221.147.151")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "linebot_v2")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "@Aa123456")

JUDGE_BASE = os.getenv("JUDGE_BASE", "http://120.107.172.133:10001")

# ---------- App 與日誌 ----------
app = FastAPI(title="Fact Check System API", description="事實查核系統後端 API", version="1.0.0")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("factcheck-backend")

# ---------- CORS ----------
ALLOWED_ORIGINS = [
    "https://fact-check-system-static.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 公用型別 ----------
class MessageIn(BaseModel):
    user: str
    message: str

# ---------- DB 連線 ----------
def get_conn():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
    )

# ---------- 全域例外處理（除錯友善） ----------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"全局錯誤: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "內部服務器錯誤",
            "error": str(exc),
            "timestamp": "2024-01-01T00:00:00Z"
        },
    )

# ---------- Startup: 建表（若不存在） ----------
@app.on_event("startup")
def startup():
    try:
        conn = get_conn()
        cur = conn.cursor()
        # messages table（你原本就有）
        cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            username TEXT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        # linebot_v2 用來儲存 session 紀錄（如果你已有此表可保留）
        cur.execute("""
        CREATE TABLE IF NOT EXISTS linebot_v2 (
            seq SERIAL PRIMARY KEY,
            id TEXT,
            session_id UUID,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        # 嘗試建立 unique constraint（若已存在會拋錯，我們捕捉）
        try:
            cur.execute("ALTER TABLE linebot_v2 ADD CONSTRAINT uniq_session_id UNIQUE (session_id);")
        except Exception:
            # ignore if constraint already exists or other conflict
            pass
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Startup: DB tables ensured")
    except Exception as e:
        logger.exception("Startup DB check failed: %s", e)

# ---------- 基本 endpoint ----------
@app.get("/")
def root():
    return {"message": "Fact Check System Backend API", "status": "running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/db-test")
def test_database():
    """測試資料庫連接並回傳 env（debug 用）"""
    try:
        env_status = {
            "DB_HOST": DB_HOST,
            "DB_PORT": DB_PORT,
            "DB_NAME": DB_NAME,
            "DB_USER": DB_USER,
            "DB_PASS": "***" if DB_PASS else "NOT_SET"
        }
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1 as test")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return {
            "status": "ok",
            "database": "connected",
            "test_result": result[0],
            "environment_variables": env_status,
            "connection_info": f"Connected to {DB_HOST}:{DB_PORT}/{DB_NAME} as {DB_USER}"
        }
    except Exception as e:
        logger.exception("DB test failed")
        return {
            "status": "error",
            "database": "connection_failed",
            "error": str(e),
            "error_type": type(e).__name__,
            "environment_variables": {
                "DB_HOST": DB_HOST,
                "DB_PORT": DB_PORT,
                "DB_NAME": DB_NAME,
                "DB_USER": DB_USER,
                "DB_PASS": "***" if DB_PASS else "NOT_SET"
            },
            "connection_string": f"postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        }

# ---------- messages endpoints ----------
@app.post("/api/message")
def receive_message(payload: MessageIn):
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO messages (username, message) VALUES (%s, %s) RETURNING id;", (payload.user, payload.message))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"status":"ok", "id": new_id}
    except Exception as e:
        logger.exception("receive_message failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages")
def list_messages(limit: int = 20):
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, username, message, created_at FROM messages ORDER BY id DESC LIMIT %s;", (limit,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {"status":"ok", "messages": rows}
    except Exception as e:
        logger.exception("list_messages failed")
        raise HTTPException(status_code=500, detail=str(e))

# ---------- 通用 proxy: 轉發到 JUDGE_BASE 並嘗試把 judge 回傳的 session_id 存入 DB ----------
@app.api_route("/api-proxy/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def proxy_and_save(request: Request, path: str):
    """
    通用 proxy：把 /api-proxy/... 轉發到 JUDGE_BASE/{path}
    若 judge 回傳 JSON 且含 session_id 或 id，會嘗試儲存到 linebot_v2
    最終把 judge 的回應原封不動回傳給前端（保持 status code）
    """
    target_url = f"{JUDGE_BASE}/{path}"
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)

    logger.info(f"Proxy forwarding to {target_url} (method={request.method})")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.request(
                method=request.method,
                url=target_url,
                content=body,
                headers=headers,
                allow_redirects=False
            )
        except httpx.RequestError as exc:
            logger.exception(f"Proxy request failed to {target_url}: {exc}")
            raise HTTPException(status_code=502, detail=f"Proxy request failed: {exc}")

    # 解析 judge 回傳 JSON（若能解析）
    sid: Optional[str] = None
    try:
        j = resp.json()
        sid = j.get("session_id") or j.get("id")
    except Exception:
        j = None

    # 解析原始 request body 以取得 userId（如果有）
    user_id: Optional[str] = None
    try:
        rb = json.loads(body.decode("utf-8")) if body else {}
        user_id = rb.get("userId") or rb.get("user_id") or rb.get("id") or rb.get("user")
    except Exception:
        user_id = None

    # 若有 sid，嘗試寫入 DB（非阻斷處理）
    if sid:
        try:
            conn = get_conn()
            cur = conn.cursor()
            try:
                cur.execute(
                    "INSERT INTO linebot_v2 (id, session_id) VALUES (%s, %s) ON CONFLICT (session_id) DO NOTHING;",
                    (user_id or "unknown", sid)
                )
            except Exception:
                # fallback: 若資料庫不支援 ON CONFLICT 或 constraint 不存在
                cur.execute("INSERT INTO linebot_v2 (id, session_id) VALUES (%s, %s);", (user_id or "unknown", sid))
            conn.commit()
            cur.close()
            conn.close()
            logger.info(f"Saved session {sid} into DB for user {user_id}")
        except Exception as e:
            logger.exception(f"Failed to save session {sid} to DB: {e}")

    # 將 judge 的原始 response 回傳
    response_headers = {k:v for k,v in resp.headers.items() if k.lower() not in ("content-encoding","transfer-encoding","connection","keep-alive")}
    return Response(content=resp.content, status_code=resp.status_code, headers=response_headers)

# ---------- 從資料庫查 session（取代原本模擬 GET） ----------
@app.get("/api-proxy/apps/judge/users/{user}/sessions/{session_id}")
def get_user_session_from_db(user: str, session_id: str):
    """
    從資料庫查 session 紀錄，若找不到回 404
    """
    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT seq, id, session_id, timestamp FROM linebot_v2 WHERE session_id = %s LIMIT 1;", (session_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"status":"ok", "session": row}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error fetching session {session_id} from DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Cofact API ----------
COFACT_TOKEN = os.getenv("COFACT_TOKEN")  # 後端 env，請在 Render 設定

COFACT_API_BASE = "https://unknown4853458-cofacts-agent-rag.hf.space"  # 假設 Cofact 的公開 API base，請依實際 API URL 調整

@app.post("/api/cofact/check")
def cofact_check_post(request_data: dict = None):
    """
    後端代理 Cofact：後端把 COFACT_TOKEN 加到 Authorization header，轉發請求並回傳結果。
    """
    try:
        if COFACT_TOKEN is None:
            raise HTTPException(status_code=500, detail="COFACT_TOKEN not configured on server")

        text = request_data.get("text", "") if request_data else ""
        # 組成要送給 Cofact 的 payload（依 Cofact API 規格調整）
        payload = {"text": text}

        # 真實 Cofact endpoint (示範)
        target = f"{COFACT_API_BASE}/check"  # <-- 改成實際 Cofact API 路徑

        headers = {
            "Authorization": f"Bearer {COFACT_TOKEN}",
            "Content-Type": "application/json"
        }

        # 使用 httpx 同步請求（如你使用 async，也可改成 async）
        resp = httpx.post(target, json=payload, headers=headers, timeout=30.0)
        resp.raise_for_status()
        # 把 Cofact 的結果原樣回傳
        return JSONResponse(status_code=resp.status_code, content=resp.json())
    except httpx.HTTPStatusError as he:
        logger.exception("Cofact API returned error")
        # 傳回 Cofact 的錯誤訊息給前端（不要包含 token）
        try:
            err_json = he.response.json()
        except Exception:
            err_json = {"detail": he.response.text}
        raise HTTPException(status_code=he.response.status_code, detail=err_json)
    except Exception as e:
        logger.exception("cofact_check_post error")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/multi-agent-analysis")
def multi_agent_analysis_get():
    try:
        logger.info("多代理分析請求 (GET)")
        return {
            "status":"ok",
            "analysis_id":"analysis_123",
            "result": {
                "weight_calculation_json": {"weights":[0.3,0.4,0.3],"total_score":0.75},
                "final_report_json": {"summary":"分析完成","confidence":0.8},
                "fact_check_result_json": {"credibility":0.8,"source":"可信來源"},
                "classification_json": {"category":"新聞","type":"真實"}
            },
            "timestamp":"2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.exception("multi_agent_analysis_get error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/multi-agent-analysis")
def multi_agent_analysis_post(analysis_data: dict = None):
    try:
        logger.info("多代理分析請求 (POST)")
        return {
            "status":"ok",
            "analysis_id":"analysis_123",
            "result": {
                "weight_calculation_json":{"weights":[0.3,0.4,0.3],"total_score":0.75},
                "final_report_json":{"summary":"分析完成","confidence":0.8},
                "fact_check_result_json":{"credibility":0.8,"source":"可信來源"},
                "classification_json":{"category":"新聞","type":"真實"}
            },
            "timestamp":"2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.exception("multi_agent_analysis_post error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api-proxy/run")
def run_analysis(request_data: dict = None):
    try:
        logger.info("收到 /api-proxy/run 請求")
        logger.info(f"請求數據: {request_data}")
        analysis_result = {
            "status":"success",
            "message":"Analysis completed successfully",
            "session_id": request_data.get("sessionId","unknown") if request_data else "unknown",
            "user_id": request_data.get("userId","user_123") if request_data else "user_123",
            "query": request_data.get("message","測試查詢") if request_data else "測試查詢",
            "analysis_data": {
                "weight_calculation_json": {
                    "llm_label":"部分正確",
                    "slm_label":"需要更多資訊",
                    "n8n_label":"待確認",
                    "final_score":0.6
                },
                "final_report_json":{"summary":"經過多代理分析，此訊息部分正確","confidence":0.6,"sources":["來源1","來源2"]},
                "fact_check_result_json":{"credibility":0.6,"verification_status":"部分驗證"},
                "classification_json":{"category":"新聞","type":"部分真實"}
            },
            "timestamp":"2024-01-01T00:00:00Z"
        }
        logger.info("Run 端點分析完成")
        return analysis_result
    except Exception as e:
        logger.exception("run_analysis error")
        raise HTTPException(status_code=500, detail=str(e))
