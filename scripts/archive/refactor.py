import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    # Python/JS Variable/Class naming
    content = re.sub(r'\bStore\b', 'Farm', content)
    content = re.sub(r'\bStores\b', 'Farms', content)
    content = re.sub(r'\bstore\b', 'farm', content)
    content = re.sub(r'\bstores\b', 'farms', content)
    
    # Capitalized/CamelCase cases
    content = re.sub(r'\bSTORE\b', 'FARM', content)
    content = re.sub(r'\bSTORES\b', 'FARMS', content)

    # Some specific Korean terms leftover
    content = re.sub(r'로컬 농가', '로컬 농가', content)
    content = re.sub(r'농가', '농가', content)
    
    # Hierarchy levels rename in backend engine and API
    content = re.sub(r'"City"', '"City"', content)
    content = re.sub(r'"District"', '"District"', content)
    content = re.sub(r'"Village"', '"Village"', content)
    
    # In frontend
    content = re.sub(r'locCity', 'locCity', content)
    content = re.sub(r'locDistrict', 'locDistrict', content)
    content = re.sub(r'locVillage', 'locVillage', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('.'):
        if '.git' in root or 'node_modules' in root or 'venv' in root or '__pycache__' in root or 'dist' in root or 'dev-dist' in root:
            continue
        for file in files:
            if file.endswith(('.py', '.jsx', '.js', '.md', '.sh', '.json', '.html')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
