import os
from dotenv import load_dotenv

# Load environment variables from .env file into os.environ
load_dotenv()

class Settings:
    USDA_API_KEY: str = os.getenv("USDA_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "changeme")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", 15))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", 300))

# Create a global settings instance
settings = Settings()
