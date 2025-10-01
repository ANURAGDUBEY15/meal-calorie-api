from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import RegisterIn, LoginIn, TokenOut
from ..security import AuthService, IAuthService

def get_auth_service() -> IAuthService:
    return AuthService()

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=201)
def register(
    payload: RegisterIn,
    db: Session = Depends(get_db),
    auth_service: IAuthService = Depends(get_auth_service)
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email.lower(),
        password_hash=auth_service.hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}

@router.post("/login", response_model=TokenOut)
def login(
    payload: LoginIn,
    db: Session = Depends(get_db),
    auth_service: IAuthService = Depends(get_auth_service)
):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not auth_service.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create JWT access token for authenticated user
    token = auth_service.create_access_token(subject=user.email)

    # Return the access token
    return TokenOut(access_token=token)
