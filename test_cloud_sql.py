import psycopg2

conn = psycopg2.connect(
    host="35.221.147.151",
    port=5432,
    user="postgres",
    password="@Aa123456",
    dbname="linebot_v2"
)

cur = conn.cursor()

# 執行查詢（只抓 0 筆資料但可以取得欄位資訊）
cur.execute("SELECT * FROM linebot_v2 LIMIT 0;")
colnames = [desc[0] for desc in cur.description]
print("欄位名稱：", colnames)

# 若你還想看資料也可以再執行 fetch
cur.execute("SELECT * FROM linebot_v2;")
print(cur.fetchall())