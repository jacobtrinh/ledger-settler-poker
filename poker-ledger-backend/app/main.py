from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.api_v1.api import api_router
from app.core.config import settings


class CORSMiddlewareFixed(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
       
        # Add CORS headers to all responses
        origin = request.headers.get("origin")
        if origin:
            # Check if origin is allowed
            allowed_origins = settings.get_backend_cors_origins
            if origin in allowed_origins or origin + "/" in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
            elif settings.ENVIRONMENT == "production" and "ledger-settler-poker" in origin:
                # Allow any subdomain in production
                response.headers["Access-Control-Allow-Origin"] = origin
       
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
       
        return response


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Add custom CORS middleware
app.add_middleware(CORSMiddlewareFixed)

# Also add the standard CORS middleware as fallback
origins = settings.get_backend_cors_origins
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
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "cors_origins": origins
    } 