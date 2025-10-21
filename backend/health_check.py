# 健康檢查腳本
import requests
import time

def check_backend_health():
    """檢查後端服務健康狀態"""
    base_url = "https://fact-check-backend-vqvl.onrender.com"
    
    endpoints = [
        {"name": "根路徑", "url": f"{base_url}/", "method": "GET"},
        {"name": "健康檢查", "url": f"{base_url}/api/health", "method": "GET"},
        {"name": "資料庫測試", "url": f"{base_url}/api/db-test", "method": "GET"},
        {"name": "Session 端點", "url": f"{base_url}/api-proxy/apps/judge/users/user/sessions/test-session-123", "method": "GET"},
        {"name": "多代理分析", "url": f"{base_url}/api/multi-agent-analysis", "method": "POST"}
    ]
    
    print("🔍 檢查後端服務健康狀態...")
    print(f"後端 URL: {base_url}")
    print("-" * 50)
    
    for endpoint in endpoints:
        try:
            print(f"📡 測試 {endpoint['name']}...")
            print(f"URL: {endpoint['url']}")
            
            if endpoint['method'] == 'GET':
                response = requests.get(endpoint['url'], timeout=10)
            else:
                response = requests.post(endpoint['url'], json={}, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ {endpoint['name']} 成功: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        data = response.json()
                        print(f"   響應: {data}")
                    except:
                        print(f"   響應: {response.text[:100]}...")
                else:
                    print(f"   響應: {response.text[:100]}...")
            else:
                print(f"❌ {endpoint['name']} 失敗: {response.status_code}")
                print(f"   錯誤: {response.text[:200]}...")
                
        except requests.exceptions.Timeout:
            print(f"⏰ {endpoint['name']} 超時")
        except requests.exceptions.ConnectionError:
            print(f"🔌 {endpoint['name']} 連接錯誤")
        except Exception as e:
            print(f"❌ {endpoint['name']} 錯誤: {str(e)}")
        
        print("-" * 30)
        time.sleep(1)  # 避免請求過於頻繁

if __name__ == "__main__":
    check_backend_health()
