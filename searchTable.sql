-- A. 我現在連到哪個資料庫 & search_path？
SELECT current_database() AS db,
       current_user      AS usr,
       current_schema()  AS cur_schema,
       current_schemas(true) AS search_path;

-- B. 這個資料庫是否存在 echo schema？
SELECT nspname AS schema_name
FROM pg_namespace
WHERE nspname = 'echo';

-- C. 這個資料庫中 echo/public 兩個 schema 的表有哪些？
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('echo','public')
ORDER BY table_schema, table_name;
