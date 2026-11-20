from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
from app.database.supabase import get_supabase_client
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campusly")

app = FastAPI(
    title=settings.APP_NAME,
    description="Campusly Backend REST API — College-Exclusive Social Networking Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Netlify frontend and local Vite client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 REST API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode.")
    get_supabase_client()

@app.get("/", tags=["System"])
def root():
    """System status and API metadata."""
    return {
        "service": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "college_domain_restriction": settings.COLLEGE_EMAIL_DOMAIN or "Disabled (Open)",
    }

@app.get("/health", tags=["System"])
def health_check():
    """Health probe for Vercel / container orchestrators."""
    return {"status": "healthy", "timestamp": "ok"}

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal campus server error occurred. Please try again later."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
