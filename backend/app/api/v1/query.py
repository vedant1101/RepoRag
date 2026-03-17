from fastapi import APIRouter, HTTPException
from app.models.query import QueryRequest
from app.services.embedding_service import get_embedding
from app.services.vector_store import search_chunks
from app.services.llm_service import ask_llm

router = APIRouter(prefix="/api/v1", tags=["query"])

@router.post("/query-repo")
def query_repository(data: QueryRequest):
    question = data.question
    repo_url = data.repoUrl

    if not question:
        raise HTTPException(status_code=400, detail="question is required")
    if not repo_url:
        raise HTTPException(status_code=400, detail="repoUrl is required")

    try:
        print("🔍 Embedding question...")
        question_embedding = get_embedding(question)
        if not question_embedding:
            raise HTTPException(status_code=500, detail="Failed to embed question")

        print("🔎 Searching Qdrant...")
        search_results = search_chunks(question_embedding, repo_url)
        if not search_results:
            raise HTTPException(status_code=404, detail="No relevant chunks found")

        rows = []
        for match in search_results:
            rows.append({
                "id": match.get("file_path", "unknown"),
                "file_path": match["file_path"],
                "code": match["code"]
            })

        seen = set()
        unique_rows = []
        for row in rows:
            if row["file_path"] in seen:
                continue
            seen.add(row["file_path"])
            unique_rows.append(row)

        context = "\n\n---\n\n".join(
            f"// File: {row['file_path']}\n{row['code']}"
            for row in unique_rows
        )

        print("🤖 Sending to Groq...")
        answer = ask_llm(question, context)

        return {
            "question": question,
            "answer": answer,
            "sourcesUsed": [
                {
                    "id": r["id"],
                    "filePath": r["file_path"],
                    "codePreview": r["code"][:150]
                }
                for r in unique_rows
            ]
        }

    except HTTPException:
        raise
    except Exception as error:
        print("queryRepository error:", error)
        raise HTTPException(status_code=500, detail="Failed to query repository")