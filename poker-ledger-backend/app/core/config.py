from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import validator
import secrets


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Poker Ledger API"
    
    # Database - Support both PostgreSQL and Supabase
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    # Use Supabase connection string if available
    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # For local development, use SQLite
        return "sqlite:///./poker_ledger.db"
    
    # JWT
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @property
    def get_backend_cors_origins(self) -> List[str]:
        """Get all allowed CORS origins including Vercel preview URLs"""
        origins = [self.FRONTEND_URL]
        
        # Add any additional origins
        if self.BACKEND_CORS_ORIGINS:
            origins.extend(self.BACKEND_CORS_ORIGINS)
        
        # In production, add Vercel URLs
        if self.ENVIRONMENT == "production":
            origins.extend([
                "https://ledger-settler-poker.vercel.app",
                "https://ledger-settler-poker.vercel.app/",
            ])
        
        # Remove duplicates and return
        return list(set(origins))
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()