#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自動刪除 seq < 25 的舊 session 資料
"""

import psycopg2
import datetime

def delete_old_sessions():
    """自動刪除 seq < 25 的舊 session 資料"""
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

        print("開始刪除 seq < 25 的舊 session 資料...")

        # 先查詢要刪除的記錄數量
        cur.execute("SELECT COUNT(*) FROM linebot_v2 WHERE seq < 25")
        count_to_delete = cur.fetchone()[0]
        print(f"將刪除 {count_to_delete} 筆記錄 (seq < 25)")

        if count_to_delete == 0:
            print("沒有需要刪除的記錄")
            return True

        # 顯示要刪除的記錄
        cur.execute("""
            SELECT seq, id, session_id, timestamp
            FROM linebot_v2
            WHERE seq < 25
            ORDER BY seq
        """)
        records_to_delete = cur.fetchall()
        
        print("\n將刪除的記錄:")
        for seq, user_id, session_id, created_at in records_to_delete:
            print(f"   序號: {seq}, ID: {user_id}, Session ID: {session_id}, 時間: {created_at}")

        # 自動確認刪除
        print(f"\n自動確認刪除這 {count_to_delete} 筆記錄...")

        # 執行刪除
        delete_sql = "DELETE FROM linebot_v2 WHERE seq < 25"
        cur.execute(delete_sql)
        deleted_count = cur.rowcount

        conn.commit()
        print(f"已成功刪除 {deleted_count} 筆記錄")

        # 查詢剩餘記錄
        cur.execute("""
            SELECT COUNT(*) FROM linebot_v2
        """)
        remaining_count = cur.fetchone()[0]
        print(f"資料庫中剩餘 {remaining_count} 筆記錄")

        # 顯示最新的 5 筆記錄
        cur.execute("""
            SELECT seq, id, session_id, timestamp
            FROM linebot_v2
            ORDER BY seq DESC
            LIMIT 5
        """)
        latest_records = cur.fetchall()

        print("\n最新的 5 筆記錄:")
        for seq, user_id, session_id, created_at in latest_records:
            print(f"   序號: {seq}, ID: {user_id}, Session ID: {session_id}, 時間: {created_at}")

        return True

    except Exception as e:
        print(f"刪除資料失敗: {e}")
        if conn:
            conn.rollback()
        return False

    finally:
        if cur is not None:
            cur.close()
        if conn is not None:
            conn.close()

def main():
    print("=== 自動刪除舊 Session 資料 (seq < 25) ===")
    if delete_old_sessions():
        print("\n舊資料刪除完成！")
    else:
        print("\n資料刪除失敗")

if __name__ == "__main__":
    main()
