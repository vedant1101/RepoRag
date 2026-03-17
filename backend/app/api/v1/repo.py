from fastapi import APIRouter
from app.models.repo import RepoRequest
from app.ingestion.repo_cloner import clone_repo
from app.ingestion.scanner import scan_files
from app.services.chunker import chunk_code
from app.services.embedding_service import get_embedding
from app.services.vector_store import insert_chunks

router = APIRouter(prefix="/api/v1", tags=["repo"])

@router.post("/clone-repo")
def clone_repository(request: RepoRequest):
    repo_url = request.repoUrl
    repo_name = repo_url.split("/")[-1].replace(".git", "")
    repo_path = clone_repo(repo_url, repo_name)
    files = scan_files(repo_path)

    processed_files = []
    all_chunks = []

    for file in files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
        except:
            continue

        chunks = chunk_code(content, file)
        if not chunks:
            continue

        for chunk in chunks:
            embedding = get_embedding(chunk["code"])
            if embedding is None:
                continue
            all_chunks.append({
                "embedding": embedding,
                "code": chunk["code"],
                "file_path": file,
                "name": chunk["name"],
                "type": chunk["type"]
            })

        processed_files.append({
            "file": file,
            "total_chunks": len(chunks)
        })
        print(f"Processed {file} — {len(chunks)} chunks")

    insert_chunks(all_chunks, repo_url)

    return {
        "message": "Repository processed successfully",
        "totalFiles": len(files),
        "processedFiles": len(processed_files)
    }