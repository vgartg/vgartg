import requests
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
            print(f"Failed to get {repo}: status {r.status_code}")
            return None
    except Exception as e:
        print(f"Error requesting {repo}: {e}")
        return None

def update_readme():
    filename = "README.md"
    try:
        with open(filename, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"File {filename} not found")
        return

    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and "github.com" in stripped:
            parts = [p.strip() for p in line.split("|") if p.strip() != ""]
            if len(parts) >= 4:
                repo_link = None
                for repo in REPOS:
                    if f"github.com/{repo}" in line:
                        repo_link = repo
                        break
                if repo_link:
                    stars = get_stars(repo_link)
                    if stars is not None:
                        parts[3] = stars
                        print(f"Updated {repo_link} -> {stars} stars")
                    else:
                        print(f"Skipping {repo_link} (no data)")
                new_line = f"| {parts[0]} | {parts[1]} | {parts[2]} | {parts[3]} |\n"
                new_lines.append(new_line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    with open(filename, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"File {filename} updated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    update_readme()
