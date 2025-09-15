from fastapi import FastAPI, Response, Request
from fastapi.responses import JSONResponse

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Remove CORS middleware - we'll handle it manually

# Add middleware to handle CORS for all requests
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    
    # Always add CORS headers
    response.headers["Access-Control-Allow-Origin"] = origin or "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return response

# Handle OPTIONS requests globally
@app.options("/{path:path}")
async def handle_options(request: Request):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

# Test endpoint for CORS (before including routers)
@app.get("/test-cors")
@app.post("/test-cors")
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