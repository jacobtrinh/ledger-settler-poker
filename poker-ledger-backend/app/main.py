from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

origins = [
    "https://ledger-settler-poker.vercel.app",  # frontend (production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],   # Authorization, Content-Type, etc.
)

# Test endpoint for CORS (before including routers)
@app.get("/test-cors")
@app.post("/test-cors")
@app.options("/test-cors")
def test_cors():
    return {"status": "CORS is working", "method": "test"}

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Welcome to Poker Ledger API"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "environment": settings.ENVIRONMENT,
        "frontend_url": settings.FRONTEND_URL
    } 