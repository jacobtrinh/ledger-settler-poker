from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.game_session import GameSession
from app.schemas.game_session import GameSessionCreate, GameSessionUpdate


class CRUDGameSession(CRUDBase[GameSession, GameSessionCreate, GameSessionUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: GameSessionCreate, owner_id: int
    ) -> GameSession:
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[GameSession]:
        return (
            db.query(self.model)
            .filter(GameSession.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


game_session = CRUDGameSession(GameSession) 