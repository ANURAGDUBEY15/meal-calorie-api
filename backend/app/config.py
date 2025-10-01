import os
from dotenv import load_dotenv

# Load environment variables from .env file into os.environ
load_dotenv()

class Settings:
    def __init__(self):
        self._usda_api_key = os.getenv("USDA_API_KEY", "")
        self._database_url = os.getenv("DATABASE_URL", "")
        self._jwt_secret = os.getenv("JWT_SECRET", "changeme")
        self._jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self._access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
        self._rate_limit_per_minute = int(os.getenv("RATE_LIMIT_PER_MINUTE", 15))
        self._cache_ttl_seconds = int(os.getenv("CACHE_TTL_SECONDS", 300))

    @property
    def USDA_API_KEY(self):
        return self._usda_api_key

    @property
    def DATABASE_URL(self):
        return self._database_url

    @property
    def JWT_SECRET(self):
        return self._jwt_secret

    @property
    def JWT_ALGORITHM(self):
        return self._jwt_algorithm

    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self):
        return self._access_token_expire_minutes

    @property
    def RATE_LIMIT_PER_MINUTE(self):
        return self._rate_limit_per_minute

    @property
    def CACHE_TTL_SECONDS(self):
        return self._cache_ttl_seconds

settings = Settings()
