import psycopg2

conn = psycopg2.connect(
    host="35.221.147.151",
    port=5432,
    user="postgres",
    password="@Aa123456",
    dbname="linebot_v2"
)

cur = conn.cursor()
cur.execute("SELECT * FROM linebot_v2;")
print(cur.fetchall())
