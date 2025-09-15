from sqlalchemy import String, Integer, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base_class import Base
import enum


class EntryMode(str, enum.Enum):
    BUYIN_CASHOUT = "buyin-cashout"
    PNL = "pnl"


class Player(Base):
    __tablename__ = "players"
    
    name: Mapped[str] = mapped_column(String, nullable=False)
    buy_in: Mapped[float] = mapped_column(Float, default=0.0)
    cash_out: Mapped[float] = mapped_column(Float, default=0.0)
    entry_mode: Mapped[EntryMode] = mapped_column(Enum(EntryMode), default=EntryMode.BUYIN_CASHOUT)
    game_session_id: Mapped[int] = mapped_column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    
    # Relationships
    game_session: Mapped["GameSession"] = relationship("GameSession", back_populates="players")
    
    @property
    def net_result(self) -> float:
        return self.cash_out - self.buy_in 