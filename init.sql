-- 建議用獨立 schema 管理
CREATE SCHEMA IF NOT EXISTS echo;
SET search_path TO echo, public;

-- ======================
-- 1) 會話主表：conversations（必建）
-- ======================
CREATE TABLE IF NOT EXISTS conversations (
  id          BIGSERIAL PRIMARY KEY,
  t           UUID UNIQUE NOT NULL,                          -- 對外查詢憑證
  channel     VARCHAR(16) NOT NULL CHECK (channel IN ('line','web')),
  user_id     VARCHAR(128),                                  -- LINE userId 或 Web 使用者ID
  input_text  TEXT NOT NULL,                                 -- 使用者輸入原文
  status      VARCHAR(16) NOT NULL                           -- pending|running|done|failed
               CHECK (status IN ('pending','running','done','failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  conversations IS '一次對話/分析主紀錄；LINE 與 Web 統一路徑';
COMMENT ON COLUMN conversations.t          IS '外部可見的會話憑證(UUID)，前端/LINE 用它查結果';
COMMENT ON COLUMN conversations.channel    IS '訊息來源：line | web';
COMMENT ON COLUMN conversations.user_id    IS 'LINE userId 或網站使用者識別';
COMMENT ON COLUMN conversations.input_text IS '使用者輸入全文';
COMMENT ON COLUMN conversations.status     IS '分析狀態：pending → running → done/failed';

CREATE INDEX IF NOT EXISTS idx_conversations_status     ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user       ON conversations(user_id, channel);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION echo_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION echo_set_updated_at();

-- ==================================
-- 2) 分析摘要：analysis_summary（必建；1:1 by t）
--    將你的最終指標全部彙總在此
-- ==================================
CREATE TABLE IF NOT EXISTS analysis_summary (
  id                     BIGSERIAL PRIMARY KEY,
  conversation_t         UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,

  -- Cohort A：cofact 正確觀點分析 + 新聞正確性
  cofact_viewpoints      JSONB,               -- [{viewpoint, stance, evidence?, score?}...]
  news_truth_label       VARCHAR(16)          -- true|false|mixed|unverified
                         CHECK (news_truth_label IN ('true','false','mixed','unverified')),

  -- Cohort B：模型最終判斷 + 可信度 + 觀點分析（你整條 pipeline 的「總結」）
  model_final_correctness VARCHAR(16),        -- e.g., true|false|mixed|unverified|uncertain
  credibility_percent     NUMERIC(5,2),       -- 0~100
  model_viewpoints        JSONB,              -- [{point, pro_con?, weight?, rationale?}...]

  -- Cohort C：法官最終判決與信心度
  judge_final_verdict     TEXT,
  judge_confidence        NUMERIC(5,2),       -- 0~100

  -- Cohort D：LLM 結果（正確性、觀點、參考網址）
  llm_correctness         JSONB,              -- {label, score, rationale...}
  llm_viewpoints          JSONB,              -- [{viewpoint, stance, ...}]
  llm_refs                JSONB,              -- 參考網址清單 [{url, title, publisher?, snippet?}...]

  -- Cohort E：SLM 結果（正確性）
  slm_correctness         JSONB,              -- {label, score, detail...}

  -- 彈性擴充
  extra                   JSONB,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  analysis_summary IS '本次會話的最終彙總（cofact/新聞正確性/模型總結/LLM/SLM/法官裁決）';
COMMENT ON COLUMN analysis_summary.cofact_viewpoints       IS 'cofact 正確觀點分析（JSON 陣列）';
COMMENT ON COLUMN analysis_summary.news_truth_label        IS '新聞正確性：true|false|mixed|unverified';
COMMENT ON COLUMN analysis_summary.model_final_correctness IS '整體模型最終判斷';
COMMENT ON COLUMN analysis_summary.credibility_percent     IS '可信度百分比（0~100）';
COMMENT ON COLUMN analysis_summary.model_viewpoints        IS '整體觀點分析（總結層級）';
COMMENT ON COLUMN analysis_summary.judge_final_verdict     IS '法官最終判決';
COMMENT ON COLUMN analysis_summary.judge_confidence        IS '法官信心度（0~100）';
COMMENT ON COLUMN analysis_summary.llm_correctness         IS 'LLM 正確性（JSON）';
COMMENT ON COLUMN analysis_summary.llm_viewpoints          IS 'LLM 觀點（JSON 陣列）';
COMMENT ON COLUMN analysis_summary.llm_refs                IS 'LLM 參考網址（JSON 陣列）';
COMMENT ON COLUMN analysis_summary.slm_correctness         IS 'SLM 正確性（JSON）';

CREATE UNIQUE INDEX IF NOT EXISTS ux_analysis_summary_t       ON analysis_summary(conversation_t);
CREATE INDEX        IF NOT EXISTS idx_analysis_summary_truth  ON analysis_summary(news_truth_label);
CREATE INDEX        IF NOT EXISTS idx_analysis_summary_cred   ON analysis_summary(credibility_percent);
CREATE INDEX        IF NOT EXISTS idx_analysis_summary_extra  ON analysis_summary USING GIN (extra);

-- ==================================
-- 3) 辯論回合：debate_turns（必建；1:N by t）
-- ==================================
CREATE TABLE IF NOT EXISTS debate_turns (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  side             VARCHAR(8) NOT NULL CHECK (side IN ('pro','con')),  -- 正/反
  turn_index       INT NOT NULL CHECK (turn_index BETWEEN 1 AND 12),   -- 1..12
  content          TEXT,                                               -- 回合內容
  score            NUMERIC(5,2),                                       -- 可選：回合分數/信心
  meta             JSONB,                                              -- 擴充資訊
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (conversation_t, side, turn_index)
);

COMMENT ON TABLE debate_turns IS '正反方各 12 回合的逐回合內容與分數';
CREATE INDEX IF NOT EXISTS idx_debate_turns_key ON debate_turns(conversation_t, side, turn_index);

-- ==================================
-- 4) LINEID 自動登入：一次性綁定碼（6 位數），用來把瀏覽器綁到 LINE user_id
-- ==================================
CREATE TABLE IF NOT EXISTS echo.bind_codes (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(8) UNIQUE NOT NULL,        -- 例如 6 位數字/字母
  web_sid         UUID NOT NULL,                     -- 此瀏覽器/分頁的臨時識別（前端產生）
  status          VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','bound','expired')),
  line_user_id    VARCHAR(128),                      -- 綁定後填入
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,              -- 建議 10 分鐘
  bound_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bind_codes_status ON echo.bind_codes(status, expires_at);

-- ==================================
-- 5)（可選）參考連結明細：evidence_links（1:N by t）
--    若你想把 llm_refs 展開成列，便於治理/去重/排序
-- ==================================
CREATE TABLE IF NOT EXISTS evidence_links (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  title            TEXT,
  publisher        TEXT,
  snippet          TEXT,
  confidence       NUMERIC(5,2),               -- 對此來源的信心 0~100
  added_by         VARCHAR(16) CHECK (added_by IN ('llm','slm','human')),
  dedup_key        TEXT,                        -- 規則化網址/指紋（可自訂）
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (conversation_t, url)
);

COMMENT ON TABLE evidence_links IS '本次會話的參考來源逐列紀錄（方便治理與分析）';
CREATE INDEX IF NOT EXISTS idx_evidence_publisher ON evidence_links(publisher);
CREATE INDEX IF NOT EXISTS idx_evidence_conf      ON evidence_links(confidence);

-- ==================================
-- 6)（可選）稽核事件：audit_events（1:N by t）
-- ==================================
CREATE TABLE IF NOT EXISTS audit_events (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID REFERENCES conversations(t) ON DELETE CASCADE,
  event_type       VARCHAR(64) NOT NULL,       -- e.g., 'ingest.accepted','bg.start','judge.done','error'
  detail           JSONB,                      -- 事件細節（堆疊、訊息、重試…）
  actor            VARCHAR(32),                -- system/line/web/cron
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_events IS '流程稽核與除錯事件時間線';
CREATE INDEX IF NOT EXISTS idx_audit_events ON audit_events(conversation_t, event_type, created_at);

-- ==================================
-- 7)（可選）模型原始輸出：model_outputs（1:N by t）
-- ==================================
CREATE TABLE IF NOT EXISTS model_outputs (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  model_type       VARCHAR(24) NOT NULL
                   CHECK (model_type IN ('cofact','judge','llm','slm','classifier','retriever','other')),
  model_name       VARCHAR(128),
  model_version    VARCHAR(64),
  input_snapshot   JSONB,
  output_payload   JSONB,
  latency_ms       INT,
  success          BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE model_outputs IS '各子模型 I/O 與耗時，便於追蹤與效能監控';
CREATE INDEX IF NOT EXISTS idx_model_outputs_t     ON model_outputs(conversation_t, model_type);
CREATE INDEX IF NOT EXISTS idx_model_outputs_time  ON model_outputs(created_at);
CREATE INDEX IF NOT EXISTS idx_model_outputs_payload_gin ON model_outputs USING GIN (output_payload);
