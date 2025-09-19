BEGIN;

-- 1) 乾淨重來：把 echo schema 全刪（若不存在會略過）
DROP SCHEMA IF EXISTS echo CASCADE;

-- 2) 新建 echo schema（擁有者給目前登入使用者）
CREATE SCHEMA echo AUTHORIZATION CURRENT_USER;

-- 3) 公用函式：更新 updated_at 觸發器
CREATE OR REPLACE FUNCTION echo.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) conversations：一次對話主表
CREATE TABLE echo.conversations (
  id          BIGSERIAL PRIMARY KEY,
  t           UUID UNIQUE NOT NULL,                           -- 對外憑證
  channel     VARCHAR(16) NOT NULL CHECK (channel IN ('line','web')),
  user_id     VARCHAR(128),
  input_text  TEXT NOT NULL,
  status      VARCHAR(16) NOT NULL CHECK (status IN ('pending','running','done','failed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_conversations_updated
BEFORE UPDATE ON echo.conversations
FOR EACH ROW EXECUTE FUNCTION echo.set_updated_at();

CREATE INDEX idx_conversations_status     ON echo.conversations(status);
CREATE INDEX idx_conversations_created_at ON echo.conversations(created_at);
CREATE INDEX idx_conversations_user       ON echo.conversations(user_id, channel);

-- 5) analysis_summary：最終彙總（1:1 by t）
CREATE TABLE echo.analysis_summary (
  id                       BIGSERIAL PRIMARY KEY,
  conversation_t           UUID NOT NULL REFERENCES echo.conversations(t) ON DELETE CASCADE,

  -- cofact 正確觀點分析 + 新聞正確性
  cofact_viewpoints        JSONB,
  news_truth_label         VARCHAR(16) CHECK (news_truth_label IN ('true','false','mixed','unverified')),

  -- 模型最終判斷 + 可信度 + 觀點分析（整體總結）
  model_final_correctness  VARCHAR(16),     -- true|false|mixed|unverified|uncertain
  credibility_percent      NUMERIC(5,2),    -- 0~100
  model_viewpoints         JSONB,

  -- 法官最終判決與信心度
  judge_final_verdict      TEXT,
  judge_confidence         NUMERIC(5,2),    -- 0~100

  -- LLM：正確性/觀點/參考網址
  llm_correctness          JSONB,
  llm_viewpoints           JSONB,
  llm_refs                 JSONB,           -- [{url,title,publisher?,snippet?}...]

  -- SLM：正確性
  slm_correctness          JSONB,

  extra                    JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_analysis_summary_t  ON echo.analysis_summary(conversation_t);
CREATE INDEX        idx_analysis_truth     ON echo.analysis_summary(news_truth_label);
CREATE INDEX        idx_analysis_cred      ON echo.analysis_summary(credibility_percent);
CREATE INDEX        idx_analysis_extra_gin ON echo.analysis_summary USING GIN (extra);

-- 6) debate_turns：正/反 12 回合（1:N by t）
CREATE TABLE echo.debate_turns (
  id               BIGSERIAL PRIMARY KEY,
  conversation_t   UUID NOT NULL REFERENCES echo.conversations(t) ON DELETE CASCADE,
  side             VARCHAR(8) NOT NULL CHECK (side IN ('pro','con')),
  turn_index       INT NOT NULL CHECK (turn_index BETWEEN 1 AND 12),
  content          TEXT,
  score            NUMERIC(5,2),
  meta             JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (conversation_t, side, turn_index)
);

CREATE INDEX idx_debate_key ON echo.debate_turns(conversation_t, side, turn_index);

COMMIT;
