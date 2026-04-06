import re
import os
import json

# 1. Update options.js
with open('src/lib/options.js', 'r', encoding='utf-8') as f:
    opt_content = f.read()

# Remove from OPTIONS
opt_content = re.sub(r'\s*// === 7\. 背景 & 雰囲気 ★新カテゴリ ===\s*backgroundMode: \[.+?\],\s*atmosphere: \[.+?\],\s*weatherTime: \[.+?\],', '', opt_content, flags=re.DOTALL)
# Remove from DEFAULT_FORM_DATA
opt_content = re.sub(r'\s*backgroundMode: \'.+?\',\s*atmosphere: \'.+?\',\s*weatherTime: \'.+?\',', '', opt_content)
# Remove from SECTIONS
opt_content = re.sub(r'\s*\{\s*id: \'background\',\s*label: \'7\.[^\}]+\s*\}\s*\},', '', opt_content, flags=re.DOTALL)
# Remove from PRESETS
opt_content = re.sub(r', atmosphere: \'[^\']+\'', '', opt_content)

with open('src/lib/options.js', 'w', encoding='utf-8') as f:
    f.write(opt_content)

# 2. Update Versions
with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)

old_version = pkg['version']
parts = old_version.split('.')
parts[2] = str(int(parts[2]) + 1)
new_version = '.'.join(parts)
pkg['version'] = new_version

with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2, ensure_ascii=False)

files_to_update = ['src/App.jsx', 'index.html', 'README.md']
for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'App.jsx' in file_path:
            content = re.sub(rf'"{old_version}"', f'"{new_version}"', content)
        elif 'index.html' in file_path:
            content = re.sub(old_version, new_version, content)
        elif 'README.md' in file_path:
            content = re.sub(old_version, new_version, content)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

with open('release_new_version.txt', 'w', encoding='utf-8') as f:
    f.write(new_version)

print(f"{new_version}")
