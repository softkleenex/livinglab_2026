import os

def run_checks():
    print("🔍 MDGA System Integrity Check Starting...")
    errors = 0

    # 1. 필수 파일 체크
    required_files = [
        "app/main.py",
        "requirements.txt",
        "docs/LIVING_LAB_PROPOSAL.md",
        "docs/KNOWLEDGE_BASE.txt",
        "README.md"
    ]
    for f in required_files:
        if os.path.exists(f):
            print(f"✅ Found: {f}")
        else:
            print(f"❌ Missing: {f}")
            errors += 1

    # 2. 데이터 디렉토리 및 DB 로직 체크
    data_dir = "app/data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"📁 Created missing data directory: {data_dir}")

    # 3. 환경 변수 체크
    if not os.path.exists(".env"):
        print("⚠️ Warning: .env file not found. AI features will require GEMINI_API_KEY.")
    else:
        print("✅ Found: .env configuration")

    # 4. 앱 진입점 무결성 검사
    with open("app/main.py", "r", encoding="utf-8") as f:
        content = f.read()
        essential_keywords = ["streamlit", "google.generativeai", "community_data", "users"]
        for kw in essential_keywords:
            if kw in content:
                print(f"✅ App Module Check: '{kw}' logic present")
            else:
                print(f"❌ App Module Check: '{kw}' logic MISSING")
                errors += 1

    print("\n--- Summary ---")
    if errors == 0:
        print("🚀 ALL SYSTEMS CLEAR. The Masterpiece is ready for the showcase.")
    else:
        print(f"⚠️ FOUND {errors} ISSUES. Please check the logs above.")

if __name__ == "__main__":
    run_checks()
