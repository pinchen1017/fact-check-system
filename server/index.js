import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const runs = new Map();    // demo 狀態
const streams = new Map(); // run_id -> Set(res)

const signToken = (rid) => jwt.sign({ rid }, JWT_SECRET, { expiresIn: "24h" });
const verifyToken = (req, res, next) => {
  try {
    const raw = req.query.t || req.headers.authorization?.replace("Bearer ", "");
    if (!raw) return res.status(401).json({ error: "missing token" });
    const { rid } = jwt.verify(raw, JWT_SECRET);
    req.rid = rid;
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
};

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Cloud SQL 連線設定（使用與 test_cloud_sql.py 相同參數）
const pool = new pg.Pool({
  host: process.env.DB_HOST || "35.229.243.129",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "@Aa123456",
  database: process.env.DB_NAME || "postgres",
  max: 5,
  ssl: (process.env.DB_SSL === "true" || process.env.RENDER === "true" || process.env.NODE_ENV === "production")
    ? { rejectUnauthorized: false }
    : false,
});

// 直接寫入 session 記錄
app.post("/save_session_record", async (req, res) => {
  try {
    const { userId, sessionId } = req.body || {};
    if (!userId || !sessionId) return res.status(400).json({ error: "missing userId or sessionId" });
    const client = await pool.connect();
    try {
      const now = new Date();
      await client.query(
        "INSERT INTO session (id, session_id, timestamp) VALUES ($1, $2, $3)",
        [userId, sessionId, now]
      );
      res.json({ ok: true, userId, sessionId, timestamp: now.toISOString() });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("save_session_record error:", e);
    res.status(500).json({ error: "db_error", detail: String(e?.message || e) });
  }
});

// 由 session_id 查詢對應的 user_id
app.get("/get_user_by_session", async (req, res) => {
  try {
    const sessionId = (req.query.sessionId || req.query.session_id || "").toString();
    if (!sessionId) return res.status(400).json({ error: "missing sessionId" });
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        "SELECT id FROM session WHERE session_id = $1 ORDER BY timestamp DESC LIMIT 1",
        [sessionId]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ error: "not_found" });
      res.json({ userId: rows[0].id, sessionId });
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("get_user_by_session error:", e);
    res.status(500).json({ error: "db_error", detail: String(e?.message || e) });
  }
});

app.post("/api/runs", (req, res) => {
  const id = "rk_" + Math.random().toString(36).slice(2);
  runs.set(id, { id, status: "running", progress: 0, overview: null, analysisResult: null });

  // 2 秒推中間進度
  setTimeout(() => pushPatch(id, {
    progress: 0.4,
    overview: { verdict: "不確定", score_true: 0.52, last_updated: new Date().toISOString() },
    analysisResult: partialAnalysis()
  }), 2000);

  // 5 秒推最終完成
  setTimeout(() => pushPatch(id, {
    status: "done",
    progress: 1,
    overview: { verdict: "假消息", score_true: 0.18, last_updated: new Date().toISOString() },
    analysisResult: fullAnalysis()
  }), 5000);

  res.json({
    run_id: id,
    quick_verdict: { label: "不確定", score_true: 0.52, reason: "正在收集證據" },
    deep_link: `http://localhost:5173/r/${id}?t=${signToken(id)}`
  });
});

app.get("/api/runs/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  if (id !== req.rid) return res.status(403).json({ error: "rid mismatch" });
  const r = runs.get(id);
  if (!r) return res.status(404).json({ error: "not found" });
  const { status, progress, overview, analysisResult } = r;
  res.json({ status, progress, overview, analysisResult });
});

app.get("/api/runs/:id/stream", verifyToken, (req, res) => {
  const id = req.params.id;
  if (id !== req.rid) return res.status(403).json({ error: "rid mismatch" });
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
  res.flushHeaders?.();

  const set = streams.get(id) ?? new Set();
  set.add(res);
  streams.set(id, set);

  const r = runs.get(id);
  if (r) res.write(`data: ${JSON.stringify(shape(r))}\n\n`);

  req.on("close", () => { set.delete(res); if (set.size === 0) streams.delete(id); res.end(); });
});

//給模型/流程用的更新端點，日後接真資料
app.post("/api/runs/:id/update", (req, res) => {
  const id = req.params.id;
  const r = runs.get(id);
  if (!r) return res.status(404).json({ error: "not found" });
  const patch = req.body.patch || {};
  const next = { ...r, ...patch };
  if (patch.analysisResult) next.analysisResult = { ...(r.analysisResult || {}), ...patch.analysisResult };
  runs.set(id, next);
  broadcast(id, shape(next));
  res.json({ ok: true });
});

// helpers
const shape = ({ status, progress, overview, analysisResult }) => ({ status, progress, overview, analysisResult });
const broadcast = (id, payload) => {
  const set = streams.get(id);
  if (!set) return;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) res.write(data);
};
const pushPatch = (id, patch) => {
  const cur = runs.get(id);
  if (!cur) return;
  const next = { ...cur, ...patch };
  if (patch.analysisResult) next.analysisResult = { ...(cur.analysisResult || {}), ...patch.analysisResult };
  runs.set(id, next);
  broadcast(id, shape(next));
};

// 完整的分析結果格式（符合您提供的JSON結構）
function partialAnalysis() {
  return {
    newsCorrectness: Math.random() > 0.5 ? '真實' : '假消息',
    ambiguityScore: Math.floor(Math.random() * 100),
    analysis: '正在蒐集與比對證據，初步結果仍不確定。',
    references: [
      'https://example.com/reference1',
      'https://example.com/reference2'
    ],
    models: {
      n8n: {
        correctness: Math.floor(Math.random() * 100),
        truthfulness: Math.floor(Math.random() * 100),
        perspective: '新聞內容與摘要一致，提供了貨到付款詐騙退貨退款的相關步驟，並提及官方回應及爭議點，支持了輸入文本的真實性。'
      },
      llm: {
        correctness: Math.floor(Math.random() * 100),
        truthfulness: Math.floor(Math.random() * 100),
        perspective: '大型語言模型基於語料判讀，觀點偏中立，對來源可信度持審慎態度。'
      }
    },
    debate: {
      prosecution: [
        { speaker: '正方', message: '已有相左報導', timestamp: '10:30' },
        { speaker: '正方', message: '等待官方說法', timestamp: '10:31' }
      ],
      defense: [
        { speaker: '反方', message: '等待官方說法', timestamp: '10:31' }
      ],
      judge: {
        verdict: '尚待釐清',
        confidence: 40
      }
    }
  };
}

function fullAnalysis() {
  return {
    newsCorrectness: Math.random() > 0.5 ? '真實' : '假消息',
    ambiguityScore: Math.floor(Math.random() * 100),
    analysis: '根據多個可靠來源的交叉驗證，此消息的真實性存在爭議。專家意見分歧，需要進一步調查。',
    references: [
      'https://example.com/reference1',
      'https://example.com/reference2',
      'https://example.com/reference3'
    ],
    models: {
      n8n: {
        correctness: Math.floor(Math.random() * 100),
        truthfulness: Math.floor(Math.random() * 100),
        perspective: '新聞內容與摘要一致，提供了貨到付款詐騙退貨退款的相關步驟，並提及官方回應及爭議點，支持了輸入文本的真實性。',
        references: [
          'https://example.com/reference1',
          'https://example.com/reference2',
          'https://example.com/reference3'
        ],
      },
      llm: {
        correctness: Math.floor(Math.random() * 100),
        truthfulness: Math.floor(Math.random() * 100),
        perspective: '大型語言模型基於語料判讀，觀點偏中立，對來源可信度持審慎態度。\n\n\n\n',
        references: [
          'https://example.com/reference1',
          'https://example.com/reference2',
          'https://example.com/reference3'
        ],
      },
      slm: {
        correctness: Math.floor(Math.random() * 100),
        truthfulness: Math.floor(Math.random() * 100),
        perspective: '小型模型根據關鍵特徵比對，指出部分敘述缺乏佐證。',
        references: [
          'https://example.com/reference1',
          'https://example.com/reference2',
          'https://example.com/reference3'
        ],
      }
    },
    debate: {
      prosecution: [
        { speaker: '正方', message: '多個事實查核機構已將此消息標記為可疑。', timestamp: '10:32' },
        { speaker: '正方', message: '根據證據顯示，此消息缺乏可靠來源支持。', timestamp: '10:30' },
        { speaker: '正方', message: '相關專家對此消息的準確性表示質疑。', timestamp: '10:35' },
        { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
        { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
        { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' },
        { speaker: '正方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' }
      ],
      defense: [
        { speaker: '反方', message: '我方當事人提供了相關證據支持此消息。', timestamp: '10:31' },
        { speaker: '反方', message: '部分專家學者對此消息持支持態度。', timestamp: '10:33' },
        { speaker: '反方', message: '需要考慮消息發布的時空背景。', timestamp: '10:36' }
      ],
      judge: {
        verdict: '經法庭審理，此消息的真實性存在爭議，建議公眾謹慎對待，等待進一步權威驗證。',
        confidence: 65
      }
    }
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on port ${PORT}`));
