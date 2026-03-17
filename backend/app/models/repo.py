from pydantic import BaseModel

class RepoRequest(BaseModel):
    repoUrl: str