from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import RegisterIn, LoginIn, TokenOut
from ..security import AuthService


# Create an API router for authentication-related endpoints
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Check if the email already exists.
    - Hash the password.
    - Save the new user to the database.
    """
    # Check if user with the given email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user instance with hashed password
    user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email.lower(),
        password_hash=AuthService.hash_password(payload.password)
    )
    # Add user to the database and commit the transaction
    db.add(user)
    db.commit()
    db.refresh(user)  # Refresh to get the new user's data (like ID)
    return {"id": user.id, "email": user.email}


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    """
    Authenticate a user and generate an access token.
    - Validate email and password.
    - Return a JWT token if credentials are valid.
    """
    # Find user by email
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    # Verify user exists and password is correct
    if not user or not AuthService.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create JWT access token for authenticated user
    token = AuthService.create_access_token(subject=user.email)

    # Return the access token
    return TokenOut(access_token=token)
