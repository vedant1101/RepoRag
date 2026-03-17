from app.ingestion.repo_cloner import clone_repo
from app.ingestion.file_scanner import scan_files

repo = clone_repo(
    "https://github.com/expressjs/express",
    "express"
)

files = scan_files(repo)

print("Total files:", len(files))

print("Sample files:")
for f in files[:5]:
    print(f)