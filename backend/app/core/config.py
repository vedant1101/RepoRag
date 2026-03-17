from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    qdrant_url: str
    qdrant_api_key: str
    groq_api_key: str
    hf_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()