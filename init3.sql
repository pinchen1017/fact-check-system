SET search_path TO echo, public;

DO $$
DECLARE
  v_t       uuid := 'f342239e-bdce-490c-bb9d-5ad74a9ee8a1'::uuid;
  v_user_id text := 'user';
  v_input   text := '柯文哲出獄了';
BEGIN
  -- 乾淨重來：先刪掉同 t 的舊資料
  DELETE FROM debate_turns     WHERE conversation_t = v_t;
  DELETE FROM analysis_summary WHERE conversation_t = v_t;
  DELETE FROM conversations    WHERE t             = v_t;

  -- conversations
  INSERT INTO conversations (t, channel, user_id, input_text, status)
  VALUES (v_t, 'web', v_user_id, v_input, 'done');

  -- analysis_summary（依 result.json 的重點填入）
  INSERT INTO analysis_summary (
    conversation_t,
    cofact_correctness, cofact_viewpoints,
    news_truth_label, credibility_percent,
    model_final_correctness, model_viewpoints,
    judge_final_verdict, judge_confidence,
    llm_correctness, llm_viewpoints, llm_refs,
    slm_correctness, extra
  )
  VALUES (
    v_t,
    NULL, NULL,
    'false',                                   -- 本題：「出獄」為錯誤說法
    70.00,
    'false',
    '[{"point":"澄清交保與出獄的法律差異","weight":0.8},
      {"point":"仍在審理與求刑背景","weight":0.7},
      {"point":"交保附電子監控/限制出境","weight":0.6}]',
    '辯論成功澄清了柯文哲是「交保」而非「出獄」。',
    91.00,
    '{"label":"false","score":0.90,"rationale":"交保非出獄"}',
    '[{"viewpoint":"交保不等於無罪，仍受限制","stance":"con"},
      {"viewpoint":"高額交保金與嚴格條件顯示風險高","stance":"con"},
      {"viewpoint":"支持者視為回歸，但仍存變數","stance":"pro"}]',
    -- 這份 JSON 的網址多半為空；示範給一筆占位
    '[{"title":"柯文哲獲准交保，非出獄","url":null}]',
    '{"label":"false","score":0.90}',
    jsonb_build_object(
      'topic','柯文哲交保事件',
      'overall_assessment','交保＝暫時解除羈押，非出獄；案件仍在審理中。',
      'jury_score',91
    )
  );

  -- 反方（con）：devil_turn.attack_points
  INSERT INTO debate_turns (conversation_t, side, turn_index, content, score, meta)
  SELECT v_t, 'con', ROW_NUMBER() OVER (), x.content, 0.80,
         jsonb_build_object('from','devil_turn.attack_points')
  FROM (VALUES
    ('柯文哲僅是交保，並非無罪獲釋，他仍是涉嫌貪污的被告，案件仍在審理中，清白未定。'),
    ('檢察官對他求處高達28年6個月的有期徒刑，顯示案情嚴重性不容忽視。'),
    ('法院裁定佩戴電子腳鐐、每日自拍監控等嚴苛交保條件，暗示高度逃亡/串證風險。'),
    ('「冤案」屬單方面說法，無法改變嚴峻指控事實。'),
    ('7000萬交保金本身顯示案件複雜且嚴重。')
  ) AS x(content);

  -- 正方（pro）：advocacy.key_points
  INSERT INTO debate_turns (conversation_t, side, turn_index, content, score, meta)
  SELECT v_t, 'pro', ROW_NUMBER() OVER (), y.content, 0.70,
         jsonb_build_object('from','advocacy.key_points')
  FROM (VALUES
    ('柯文哲於2025年9月8日以新台幣7000萬元獲准交保。'),
    ('被羈押約一年，涉及京華城案與政治獻金案。'),
    ('裁定交保並限制出境出海8個月，須接受電子監控。'),
    ('交保後已返回新竹老家並安排祭拜。'),
    ('台北地檢署對交保不滿，將依法提出抗告。')
  ) AS y(content);

  RAISE NOTICE 'Seed OK. t=%', v_t;
END $$;

-- 驗證（可選）
SELECT t, channel, user_id, input_text, status
FROM echo.conversations
WHERE t = 'f342239e-bdce-490c-bb9d-5ad74a9ee8a1'::uuid;

SELECT news_truth_label, credibility_percent, judge_final_verdict, judge_confidence
FROM echo.analysis_summary
WHERE conversation_t = 'f342239e-bdce-490c-bb9d-5ad74a9ee8a1'::uuid;

SELECT side, turn_index, content
FROM echo.debate_turns
WHERE conversation_t = 'f342239e-bdce-490c-bb9d-5ad74a9ee8a1'::uuid
ORDER BY side, turn_index;
