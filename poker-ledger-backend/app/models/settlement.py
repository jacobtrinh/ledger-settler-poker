from sqlalchemy import String, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base_class import Base


class Settlement(Base):
    __tablename__ = "settlements"
    
    from_player: Mapped[str] = mapped_column(String, nullable=False)
    to_player: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    game_session_id: Mapped[int] = mapped_column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    
    # Relationships
    game_session: Mapped["GameSession"] = relationship("GameSession", back_populates="settlements") 