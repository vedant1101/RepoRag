from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue, PayloadSchemaType
from app.core.config import settings
import uuid

client = QdrantClient(
    url=settings.qdrant_url,
    api_key=settings.qdrant_api_key,
    timeout=300
)

COLLECTION_NAME = "repo_chunks"

def create_index():
    try:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="repo_url",
            field_schema=PayloadSchemaType.KEYWORD
        )
        print("Index created for repo_url")
    except Exception as e:
        print(f"Index already exists or error: {e}")

create_index()

def insert_chunks(chunks, repo_url: str):
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=chunk["embedding"],
            payload={
                "file_path": chunk["file_path"],
                "code": chunk["code"],
                "repo_url": repo_url
            }
        )
        for chunk in chunks
    ]
    batch_size = 100
    for i in range(0, len(points), batch_size):
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points[i:i + batch_size]
        )

def search_chunks(query_embedding, repo_url: str, limit=5):
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="repo_url",
                    match=MatchValue(value=repo_url)
                )
            ]
        ),
        limit=limit
    ).points
    return [
        {
            "score": r.score,
            "file_path": r.payload.get("file_path", "unknown"),
            "code": r.payload.get("code", "")
        }
        for r in results
    ]