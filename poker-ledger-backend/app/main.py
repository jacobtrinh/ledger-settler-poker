from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Explicitly allowed origins
origins = [
    "https://ledger-settler-poker-app.vercel.app",  # your frontend on Vercel
    "http://localhost:3000",  # for local dev
]

# If you want to make this dynamic, you can still extend from settings
if settings.BACKEND_CORS_ORIGINS:
    origins.extend(settings.BACKEND_CORS_ORIGINS)

# CORS middleware must come before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # exact matches only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include your API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# health and root endpoints
@app.get("/")
def root():
    return {"message": "Welcome to Poker Ledger API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
