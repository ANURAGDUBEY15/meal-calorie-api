from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

# Create a SQLAlchemy engine with connection pooling
class Database:
    def __init__(self, db_url):
        self._engine = create_engine(
            db_url,
            echo=False,
            pool_pre_ping=True
        )
        self._SessionLocal = sessionmaker(bind=self._engine, autocommit=False, autoflush=False)

    @property
    def engine(self):
        return self._engine

    @property
    def SessionLocal(self):
        return self._SessionLocal

class Base(DeclarativeBase):
    pass

db = Database(settings.DATABASE_URL)

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
