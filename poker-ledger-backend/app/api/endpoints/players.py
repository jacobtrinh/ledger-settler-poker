from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.put("/players/{player_id}", response_model=schemas.Player)
def update_player(
    *,
    db: Session = Depends(deps.get_db),
    player_id: int,
    player_in: schemas.PlayerUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a player.
    """
    # Get player and check permissions
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if player.game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Update player
    update_data = player_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(player, field, value)
    
    db.add(player)
    db.commit()
    db.refresh(player)
    return schemas.Player.from_orm(player)


@router.delete("/players/{player_id}")
def delete_player(
    *,
    db: Session = Depends(deps.get_db),
    player_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a player.
    """
    # Get player and check permissions
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if player.game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    db.delete(player)
    db.commit()
    return {"message": "Player deleted successfully"} 


@router.get("/unique-names", response_model=List[str])
def get_unique_player_names(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all unique player names from user's game sessions.
    """
    # Get all players from all of the user's game sessions
    player_names = db.query(models.Player.name).distinct()\
        .join(models.GameSession)\
        .filter(models.GameSession.owner_id == current_user.id)\
        .all()
    
    return [name[0] for name in player_names] 