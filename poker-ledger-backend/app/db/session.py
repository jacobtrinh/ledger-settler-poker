from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Support SQLite for development
if settings.get_database_url.startswith("sqlite"):
    engine = create_engine(
        settings.get_database_url, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.get_database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 