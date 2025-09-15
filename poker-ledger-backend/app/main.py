from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set all CORS enabled origins
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    settings.FRONTEND_URL,
]

# Add any additional origins from settings
if settings.BACKEND_CORS_ORIGINS:
    origins.extend(settings.BACKEND_CORS_ORIGINS)

# In production, add specific Vercel URLs
if settings.ENVIRONMENT == "production":
    # Add both with and without trailing slash to be safe
    origins.extend([
        "https://ledger-settler-poker.vercel.app",
        "https://ledger-settler-poker.vercel.app/",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Welcome to Poker Ledger API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT} 