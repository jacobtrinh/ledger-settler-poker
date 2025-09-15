from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.settlement_service import calculate_settlements_for_session

router = APIRouter()


@router.get("/", response_model=List[schemas.GameSession])
def read_game_sessions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve game sessions for the current user.
    """
    game_sessions = crud.game_session.get_multi_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return game_sessions


@router.post("/", response_model=schemas.GameSession)
def create_game_session(
    *,
    db: Session = Depends(deps.get_db),
    game_session_in: schemas.GameSessionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new game session.
    """
    game_session = crud.game_session.create_with_owner(
        db=db, obj_in=game_session_in, owner_id=current_user.id
    )
    return game_session


@router.get("/{id}", response_model=schemas.GameSession)
def read_game_session(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get game session by ID.
    """
    game_session = crud.game_session.get(db=db, id=id)
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return game_session


@router.put("/{id}", response_model=schemas.GameSession)
def update_game_session(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    game_session_in: schemas.GameSessionUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a game session.
    """
    game_session = crud.game_session.get(db=db, id=id)
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    game_session = crud.game_session.update(
        db=db, db_obj=game_session, obj_in=game_session_in
    )
    return game_session


@router.delete("/{id}", response_model=schemas.GameSession)
def delete_game_session(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a game session.
    """
    game_session = crud.game_session.get(db=db, id=id)
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    game_session = crud.game_session.remove(db=db, id=id)
    return game_session


@router.post("/{game_session_id}/calculate-settlements", response_model=List[schemas.Settlement])
def calculate_settlements(
    *,
    db: Session = Depends(deps.get_db),
    game_session_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Calculate settlements for a game session.
    """
    # Get game session
    game_session = crud.game_session.get(db=db, id=game_session_id)
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Calculate settlements
    settlements = calculate_settlements_for_session(
        db=db, game_session_id=game_session_id
    )
    
    return settlements


@router.post("/{game_session_id}/players", response_model=schemas.Player)
def create_player(
    *,
    db: Session = Depends(deps.get_db),
    game_session_id: int,
    player_in: schemas.PlayerCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new player in a game session.
    """
    # Check if game session exists and user has permission
    game_session = db.query(models.GameSession).filter(
        models.GameSession.id == game_session_id
    ).first()
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    if game_session.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    # Create player
    player = models.Player(
        **player_in.dict(),
        game_session_id=game_session_id
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return schemas.Player.from_orm(player) 