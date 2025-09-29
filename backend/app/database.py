from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

# Create a SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,          # Set to True for SQL query logging (useful in dev)
    pool_pre_ping=True   # Ensures connections are alive before using them
)

# Session factory for database interactions
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base class for all ORM models
class Base(DeclarativeBase):
    pass

# Database session dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Ensures DB session is closed after request
