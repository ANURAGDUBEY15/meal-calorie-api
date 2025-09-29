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

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        # Hashes the password using the configured hashing algorithm
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(password: str, hash_: str) -> bool:
        # Verifies a plain password against the hashed version
        return pwd_context.verify(password, hash_)
    
    @staticmethod
    def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
        # Generates a JWT token with expiration and subject (typically user email)
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = {"sub": subject, "exp": expire}
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> str:
        # Decodes a JWT token and extracts the subject (email)
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload.get("sub")
        except jwt.ExpiredSignatureError:
            # Token is valid but expired
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        except jwt.PyJWTError:
            # Token is invalid in any other way
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Dependency that retrieves the currently authenticated user from the JWT token
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    email = AuthService.decode_token(token)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
