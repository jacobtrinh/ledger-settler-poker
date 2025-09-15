from sqlalchemy import String, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List
from app.db.base_class import Base


class User(Base):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    game_sessions: Mapped[List["GameSession"]] = relationship("GameSession", back_populates="owner", cascade="all, delete-orphan") 