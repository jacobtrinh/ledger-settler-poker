from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.player import Player
from app.schemas.settlement import Settlement


# Shared properties
class GameSessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    game_date: datetime
    is_settled: bool = False


# Properties to receive on creation
class GameSessionCreate(GameSessionBase):
    pass


# Properties to receive on update
class GameSessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    game_date: Optional[datetime] = None
    is_settled: Optional[bool] = None


# Properties shared by models stored in DB
class GameSessionInDBBase(GameSessionBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Properties to return to client
class GameSession(GameSessionInDBBase):
    players: List[Player] = []
    settlements: List[Settlement] = []


# Properties stored in DB
class GameSessionInDB(GameSessionInDBBase):
    pass 