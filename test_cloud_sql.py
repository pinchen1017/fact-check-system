import psycopg2

conn = psycopg2.connect(
    host="35.229.243.129",
    port=5432,
    user="postgres",
    password="@Aa123456",
    dbname="postgres"
)

cur = conn.cursor()
cur.execute("SELECT * FROM linebot_v2;")
print(cur.fetchall())
