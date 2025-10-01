from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import User

# Password hashing context using Argon2 (recommended algorithm)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Defines the OAuth2 password flow with token endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class IAuthService:
    def hash_password(self, password: str) -> str: ...
    def verify_password(self, password: str, hash_: str) -> bool: ...
    def create_access_token(self, subject: str, expires_minutes: int | None = None) -> str: ...
    def decode_token(self, token: str) -> str: ...

class AuthService(IAuthService):
    def __init__(self):
        self._pwd_context = pwd_context
        self._jwt_secret = settings.JWT_SECRET
        self._jwt_algorithm = settings.JWT_ALGORITHM
        self._access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def hash_password(self, password: str) -> str:
        return self._pwd_context.hash(password)

    def verify_password(self, password: str, hash_: str) -> bool:
        return self._pwd_context.verify(password, hash_)

    def create_access_token(self, subject: str, expires_minutes: int | None = None) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=expires_minutes or self._access_token_expire_minutes
        )
        payload = {"sub": subject, "exp": expire}
        return jwt.encode(payload, self._jwt_secret, algorithm=self._jwt_algorithm)

    def decode_token(self, token: str) -> str:
        try:
            payload = jwt.decode(token, self._jwt_secret, algorithms=[self._jwt_algorithm])
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Dependency that retrieves the currently authenticated user from the JWT token
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    auth_service = AuthService()
    email = auth_service.decode_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
