import psycopg2

conn = psycopg2.connect(
    host="34.81.85.167",
    port=5432,
    user="postgres",
    password="113141613",
    dbname="linebot"
)

cur = conn.cursor()
cur.execute("SELECT * FROM linebot;")
print(cur.fetchall())
