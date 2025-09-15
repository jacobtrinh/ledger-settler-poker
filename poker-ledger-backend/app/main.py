from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Get all CORS origins from settings
origins = settings.get_backend_cors_origins

# For debugging in production
print(f"CORS Origins: {origins}")
print(f"Environment: {settings.ENVIRONMENT}")
print(f"Frontend URL from env: {settings.FRONTEND_URL}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Welcome to Poker Ledger API"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "environment": settings.ENVIRONMENT,
        "cors_origins": origins  # Include for debugging
    } 