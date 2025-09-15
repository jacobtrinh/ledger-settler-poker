from typing import Optional
from pydantic import BaseModel
from app.models.player import EntryMode


# Shared properties
class PlayerBase(BaseModel):
    name: str
    buy_in: float = 0.0
    cash_out: float = 0.0
    entry_mode: EntryMode = EntryMode.BUYIN_CASHOUT


# Properties to receive on creation
class PlayerCreate(PlayerBase):
    pass


# Properties to receive on update
class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    buy_in: Optional[float] = None
    cash_out: Optional[float] = None
    entry_mode: Optional[EntryMode] = None


# Properties shared by models stored in DB
class PlayerInDBBase(PlayerBase):
    id: int
    game_session_id: int
    
    class Config:
        from_attributes = True


# Properties to return to client
class Player(PlayerInDBBase):
    net_result: float
    
    @classmethod
    def from_orm(cls, obj):
        # Manually add the computed property
        obj_dict = obj.__dict__.copy()
        obj_dict['net_result'] = obj.net_result
        return cls(**obj_dict)


# Properties stored in DB
class PlayerInDB(PlayerInDBBase):
    pass 