#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
插入測試 session 資料
"""

import psycopg2
import datetime

def insert_test_sessions():
    """插入指定的測試 session 資料"""
    conn = None
    cur = None
    try:
        # 連接資料庫
        conn = psycopg2.connect(
            host="35.221.147.151",
            port=5432,
            user="postgres",
            password="@Aa123456",
            dbname="linebot_v2"
        )
        cur = conn.cursor()

        # 要插入的資料（可自行增加多筆）
        test_sessions = [
            ("Ub57p8h5pm9db7u62uh8pj", "10384dbb-2f4b-435c-96ea-ce4dcfe08660"),
            # ("someUserId2", "some-session-uuid-2"),
        ]

        print("🔄 開始插入測試 session 資料...")

        # 依實際表結構 (server/index.js) 使用欄位: id, session_id, timestamp
        insert_sql = """
            INSERT INTO linebot_v2 (id, session_id, timestamp)
            VALUES (%s, %s, %s)
        """

        now = datetime.datetime.now()
        for user_id, session_id in test_sessions:
            cur.execute(insert_sql, (user_id, session_id, now))
            print(f"✅ 已插入: id={user_id}, session_id={session_id}")

        conn.commit()
        print("✅ 所有記錄已成功插入資料庫")

        # 查詢最新記錄（依實際表結構調整欄位與排序欄位）
        cur.execute("""
            SELECT seq, id, session_id, timestamp
            FROM linebot_v2
            ORDER BY seq DESC
            LIMIT 5
        """)
        latest_records = cur.fetchall()

        print("\n📊 最新的 5 筆記錄:")
        for seq, user_id, session_id, created_at in latest_records:
            print(f"   序號: {seq}, ID: {user_id}, Session ID: {session_id}, 時間: {created_at}")

        return True

    except Exception as e:
        print(f"❌ 插入資料失敗: {e}")
        return False

    finally:
        if cur is not None:
            cur.close()
        if conn is not None:
            conn.close()

def main():
    print("=== 插入測試 Session 資料 ===")
    if insert_test_sessions():
        print("\n🎉 所有測試資料插入完成！")
    else:
        print("\n❌ 資料插入失敗")

if __name__ == "__main__":
    main()
