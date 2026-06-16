import requests
import re
from datetime import datetime

REPOS = [
    "vgartg/jammer",
    "vgartg/ACI-Bot",
    "vgartg/Random-Data-Generator",
    "vgartg/Tic-Tac-Toe",
    "vgartg/Go-Auction",
    "vgartg/Elevator-Simulator",
    "vgartg/TG-Bot-with-DeepSeek-API-Integration",
    "vgartg/BlockCraft-Learner-Game",
    "vgartg/Web-Parsing-Bot",
    "Den0110/splyshechka",
    "vgartg/Claude-Communication-Bot",
    "vgartg/YART-Tent",
    "vgartg/Panther-and-Buninsky"
]

def get_stars(repo):
    url = f"https://api.github.com/repos/{repo}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return str(r.json()["stargazers_count"])
        else:
            return None
    except Exception as e:
        print(f"❌ Error in {repo}: {e}")
        return None

def update_readme():
    filename = "README.md"
    try:
        with open(filename, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        return

    new_lines = []
    for line in lines:
        if line.strip().startswith("|") and "github.com" in line:
            found = False
            for repo in REPOS:
                if f"github.com/{repo}" in line:
                    stars = get_stars(repo)
                    if stars is not None:
                        parts = line.split("|")
                        if len(parts) >= 2:
                            parts[-1] = f" {stars} "
                            line = "|".join(parts)
                            found = True
                            print(f"✅ Updatedd {repo} -> {stars} stars")
                    else:
                        print(f"⏩ Fail")
                    break
        new_lines.append(line)

    with open(filename, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"✅ File {filename} Updatedd {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    update_readme()
