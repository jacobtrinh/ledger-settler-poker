from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List
from datetime import datetime
from app.db.base_class import Base


class GameSession(Base):
    __tablename__ = "game_sessions"
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    game_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    is_settled: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="game_sessions")
    players: Mapped[List["Player"]] = relationship("Player", back_populates="game_session", cascade="all, delete-orphan")
    settlements: Mapped[List["Settlement"]] = relationship("Settlement", back_populates="game_session", cascade="all, delete-orphan") 