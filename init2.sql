-- 清空舊的 echo schema（若有）
DROP SCHEMA IF EXISTS echo CASCADE;

-- 建立 schema 與常用 ENUM 型別
CREATE SCHEMA echo;
CREATE TYPE echo.channel_enum AS ENUM ('line','web');
CREATE TYPE echo.status_enum  AS ENUM ('pending','running','done','failed');
CREATE TYPE echo.truth_enum   AS ENUM ('true','false','mixed','unverified','uncertain'); -- 給模型總結用，多了 'uncertain'
CREATE TYPE echo.side_enum    AS ENUM ('pro','con');

-- 觸發器：自動更新 updated_at
CREATE OR REPLACE FUNCTION echo.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

SET search_path TO echo, public;

-- 1) 一次對話主表（輸入端=LINE 或 Web）
CREATE TABLE conversations (
  id          BIGSERIAL PRIMARY KEY,
  t           UUID UNIQUE NOT NULL,                 -- 對外憑證（網址 ?t=...）
  channel     echo.channel_enum NOT NULL,           -- line | web
  user_id     TEXT,                                 -- 建議存 LINE userId（Web 也可綁同一值）
  input_text  TEXT NOT NULL,                        -- 使用者輸入
  status      echo.status_enum NOT NULL DEFAULT 'pending', -- 流程狀態
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION echo.set_updated_at();

CREATE INDEX idx_conv_status     ON conversations(status);
CREATE INDEX idx_conv_created_at ON conversations(created_at);
CREATE INDEX idx_conv_user       ON conversations(user_id, channel);

COMMENT ON TABLE conversations IS '一次分析（LINE/Web）＝一筆；對外以 t 查詢';

-- 2) 分析最終彙總（與 conversations 1:1）
CREATE TABLE analysis_summary (
  id                      BIGSERIAL PRIMARY KEY,
  conversation_t          UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,

  -- cofact（JSON 結構有彈性，故用 JSONB）
  cofact_correctness      JSONB,              -- {label, score, ...}
  cofact_viewpoints       JSONB,              -- [{viewpoint, stance, ...}, ...]

  -- 新聞正確性 & 可信度（結構化欄位）
  news_truth_label        echo.truth_enum,    -- true/false/mixed/unverified/uncertain
  credibility_percent     NUMERIC(5,2) CHECK (credibility_percent BETWEEN 0 AND 100),

  -- 模型最終判斷（總結層級）
  model_final_correctness echo.truth_enum,
  model_viewpoints        JSONB,              -- [{point, side?, weight?, rationale?}...]

  -- 法官
  judge_final_verdict     TEXT,
  judge_confidence        NUMERIC(5,2) CHECK (judge_confidence BETWEEN 0 AND 100),

  -- LLM
  llm_correctness         JSONB,              -- {label, score, rationale?}
  llm_viewpoints          JSONB,              -- JSON 陣列
  llm_refs                JSONB,              -- JSON 陣列 [{url,title,...}]

  -- SLM
  slm_correctness         JSONB,              -- {label, score, detail?}

  extra                   JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_t)
);
CREATE INDEX idx_sum_truth ON analysis_summary(news_truth_label);
CREATE INDEX idx_sum_cred  ON analysis_summary(credibility_percent);
-- 需要以 JSON 查詢時可加 GIN
-- CREATE INDEX idx_sum_cofact_vps_gin ON analysis_summary USING GIN (cofact_viewpoints);

COMMENT ON TABLE analysis_summary IS '一次對話的最終彙總（網頁詳情主要讀這張）';

-- 3) 辯論回合（正/反各 12 回；與 conversations 1:N）
CREATE TABLE debate_turns (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  side             echo.side_enum NOT NULL,         -- 'pro' / 'con'
  turn_index       SMALLINT NOT NULL CHECK (turn_index BETWEEN 1 AND 12),
  content          TEXT,
  score            NUMERIC(5,2),                    -- 可做 0~100 或 0~1（自定）
  meta             JSONB,                           -- 擴充欄位
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_t, side, turn_index)
);
CREATE INDEX idx_debate_key ON debate_turns(conversation_t, side, turn_index);

-- （可選）來源連結治理
CREATE TABLE evidence_links (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  title            TEXT,
  publisher        TEXT,
  snippet          TEXT,
  confidence       NUMERIC(5,2),
  added_by         TEXT CHECK (added_by IN ('llm','slm','human')),
  dedup_key        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_t, url)
);

-- （可選）流程稽核事件
CREATE TABLE audit_events (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID REFERENCES conversations(t) ON DELETE CASCADE,
  event_type       TEXT NOT NULL,                   -- ingest.accepted/bg.start/cofact.done/judge.done/done/error
  detail           JSONB,
  actor            TEXT,                            -- system/line/web/cron
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit ON audit_events(conversation_t, event_type, created_at);

-- （可選）模型原始 I/O 與耗時
CREATE TABLE model_outputs (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES conversations(t) ON DELETE CASCADE,
  model_type       TEXT NOT NULL CHECK (model_type IN ('cofact','judge','llm','slm','classifier','retriever','other')),
  model_name       TEXT,
  model_version    TEXT,
  input_snapshot   JSONB,
  output_payload   JSONB,
  latency_ms       INT,
  success          BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_model_t ON model_outputs(conversation_t, model_type);
