import os
import glob

replacements = {
    "기업 (스마트팜/제조)": "기업 (농기계/스마트팜)",
    "제조업 및 물류": "스마트팜 및 물류",
    "공장 2동 증축": "스마트팜 2동 증축",
    "공장 가동률": "스마트팜 가동률",
    "제조/배터리": "농기계/배터리",
    "성서산업단지 관리공단": "대구 스마트팜 관리센터",
    "성서산단": "스마트팜단지",
    "미래차 밧데리": "스마트 농기계 배터리",
    "MANUFACTURING & LOGISTICS (달서구 성서산단)": "SMARTFARM & LOGISTICS (달서구 스마트팜단지)",
    "공장": "온실",
    "제조업": "농산업",
    "제조사": "농기계사"
}

files = glob.glob("backend/scripts/db/*.py")
for f_path in files:
    with open(f_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if content != new_content:
        with open(f_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {f_path}")

