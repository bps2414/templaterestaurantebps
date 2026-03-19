import os
import glob

base_dir = r"f:\VSCode\SaaS Restaurante\Templates\themes"
html_files = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".html"):
            html_files.append(os.path.join(root, file))

inject_str = """
  <meta name="color-scheme" content="light">
  <style>
    /* iOS input zoom fix */
    input, textarea, select { font-size: 16px !important; }
    /* Prevent horizontal scroll */
    html, body { overflow-x: hidden; width: 100%; }
    /* Safe area inset for cart button */
    #cart-button { bottom: max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom))) !important; }
  </style>
"""

count = 0
for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<meta name="color-scheme"' not in content:
            new_content = content.replace('<head>', '<head>' + inject_str)
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print(f"Updated {count} HTML files in themes.")
