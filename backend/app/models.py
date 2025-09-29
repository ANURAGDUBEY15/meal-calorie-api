from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable = False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    #table level constraint also applied
    __table_args__ = (
        UniqueConstraint('email', name = 'uq_users_email'),
    )
