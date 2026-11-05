"""
Test script for CropSave backend deployed on Render.com
Run: python test_live_backend.py
"""
import requests
import sys

# Change this to your actual Render URL after deployment
BACKEND_URL = "https://cropsave-api.onrender.com"

def test_health():
    """Test /health endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("✓ PASS: /health - Backend is running")
                return True
        print(f"✗ FAIL: /health - Unexpected response: {response.text}")
        return False
    except Exception as e:
        print(f"✗ FAIL: /health - {e}")
        return False

def test_predict():
    """Test /predict endpoint with Multan coordinates"""
    try:
        payload = {
            "lat": 30.1575,
            "lon": 71.5249,
            "district": "Multan"
        }
        response = requests.post(f"{BACKEND_URL}/predict", json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if "risk_level" in data and "risk_score" in data:
                print(f"✓ PASS: /predict - Risk: {data['risk_level']} ({data['risk_score']}%)")
                return True
        print(f"✗ FAIL: /predict - Unexpected response: {response.text}")
        return False
    except Exception as e:
        print(f"✗ FAIL: /predict - {e}")
        return False

def test_history():
    """Test /history endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/history?district=Lahore", timeout=15)
        if response.status_code == 200:
            data = response.json()
            if "district" in data and "data" in data:
                print(f"✓ PASS: /history - Got {len(data['data'])} months of data for {data['district']}")
                return True
        print(f"✗ FAIL: /history - Unexpected response: {response.text}")
        return False
    except Exception as e:
        print(f"✗ FAIL: /history - {e}")
        return False

def test_advisory():
    """Test /advisory endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/advisory?risk=MEDIUM", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "advice" in data and len(data["advice"]) > 0:
                print(f"✓ PASS: /advisory - Got {len(data['advice'])} advice items")
                return True
        print(f"✗ FAIL: /advisory - Unexpected response: {response.text}")
        return False
    except Exception as e:
        print(f"✗ FAIL: /advisory - {e}")
        return False

def main():
    print("=" * 60)
    print("CropSave Backend Live Test")
    print(f"Testing: {BACKEND_URL}")
    print("=" * 60)
    print()

    results = []
    results.append(("Health Check", test_health()))
    results.append(("Predict Endpoint", test_predict()))
    results.append(("History Endpoint", test_history()))
    results.append(("Advisory Endpoint", test_advisory()))

    print()
    print("=" * 60)
    print("Test Summary:")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status}: {name}")

    print()
    print(f"Result: {passed}/{total} tests passed")
    print("=" * 60)

    if passed == total:
        print("\n🎉 All tests passed! Backend is ready for frontend integration.")
        sys.exit(0)
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
