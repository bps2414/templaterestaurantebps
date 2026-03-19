import os

templates_dir = r"f:\VSCode\SaaS Restaurante\Templates\themes"

for root, dirs, files in os.walk(templates_dir):
    for name in files:
        if name == "input.css":
            file_path = os.path.join(root, name)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            if "color-scheme: light" not in content:
                content = content.replace(":root {", ":root {\n    color-scheme: light;")
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {file_path}")
