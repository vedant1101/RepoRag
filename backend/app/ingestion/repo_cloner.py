import os
import shutil
import subprocess
from pathlib import Path

def clone_repo(repo_url: str, repo_name: str):
    if os.getenv("RAILWAY_ENVIRONMENT"):
        base_dir = "/tmp/repos"
    else:
        base_dir = Path(__file__).resolve().parents[2] / "repos"

    repo_path = os.path.join(str(base_dir), repo_name)
    os.makedirs(str(base_dir), exist_ok=True)

    if os.path.exists(repo_path):
        print("Repo already exists, skipping clone...")
        return repo_path

    git_binary = shutil.which("git") or "/usr/bin/git"
    print(f"Using git: {git_binary}")
    print(f"Cloning {repo_url}...")

    subprocess.run(
        [git_binary, "clone", "--depth=1", "--single-branch", repo_url, repo_path],
        check=True,
        env={**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    )

    print("Clone complete!")
    return repo_path