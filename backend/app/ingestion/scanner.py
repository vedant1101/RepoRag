import os
from pathlib import Path

ALLOWED_EXTENSIONS = [
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".py",
    ".go",
    ".rs",
    ".java",
    ".c",
    ".cpp",
    ".md"
]

IGNORED_FOLDERS = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    "__pycache__",
    "venv",
    ".venv"
]

MAX_FILE_SIZE = 200000  # 200 KB

def scan_files(directory):
    results = []
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in IGNORED_FOLDERS and not d.startswith(".")]
        for file in files:
            if file.startswith("."):
                continue
            full_path = os.path.join(root, file)
            ext = Path(file).suffix
            if ext not in ALLOWED_EXTENSIONS:
                continue
            if os.path.getsize(full_path) > MAX_FILE_SIZE:
                continue
            results.append(full_path)
    return results