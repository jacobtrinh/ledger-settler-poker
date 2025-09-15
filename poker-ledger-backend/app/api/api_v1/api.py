from fastapi import APIRouter

from app.api.endpoints import auth, game_sessions, players

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(game_sessions.router, prefix="/game-sessions", tags=["game-sessions"])
api_router.include_router(players.router, prefix="/players", tags=["players"]) 