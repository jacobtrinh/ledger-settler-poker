from pydantic import BaseModel


# Shared properties
class SettlementBase(BaseModel):
    from_player: str
    to_player: str
    amount: float


# Properties to receive on creation
class SettlementCreate(SettlementBase):
    pass


# Properties shared by models stored in DB
class SettlementInDBBase(SettlementBase):
    id: int
    game_session_id: int
    
    class Config:
        from_attributes = True


# Properties to return to client
class Settlement(SettlementInDBBase):
    pass


# Properties stored in DB
class SettlementInDB(SettlementInDBBase):
    pass 