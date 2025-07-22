from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn
import logging

from .core.config import settings
from .core.database import get_db, check_connection, create_tables
from .core.security import verify_token
from .models import User
from .api.routers import auth, users, servers, config, stats, health

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug,
    description="""
    V2Ray VPN Service API - Complete VPN management system
    
    Features:
    - User management with multi-protocol support
    - Dynamic V2Ray configuration generation
    - Server health monitoring and load balancing
    - Real-time statistics and traffic monitoring
    - Comprehensive admin controls
    
    Supported Protocols:
    - VMess with WebSocket + TLS
    - VLESS with gRPC + Reality  
    - Shadowsocks with AEAD encryption
    - SOCKS5 with authentication
    - HTTP proxy with authentication
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security
security = HTTPBearer()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if user.status != 'active':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active"
        )
    
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current user and verify admin privileges"""
    if current_user.tier < 999:  # Admin tier
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """API health check"""
    return {
        "service": "V2Ray VPN Service",
        "version": settings.api_version,
        "status": "healthy",
        "message": "API is running successfully"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check including database connectivity"""
    db_healthy = await check_connection()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": "connected" if db_healthy else "disconnected",
        "version": settings.api_version,
        "debug": settings.debug
    }


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(servers.router, prefix="/api/v1/servers", tags=["Servers"])
app.include_router(config.router, prefix="/api/v1/config", tags=["Configuration"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistics"])
app.include_router(health.router, prefix="/api/v1/health", tags=["Health Monitoring"])


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Starting V2Ray VPN Service API")
    
    # Check database connection
    if not await check_connection():
        logger.error("Database connection failed!")
        raise Exception("Cannot start without database connection")
    
    # Create tables if they don't exist
    await create_tables()
    
    logger.info("V2Ray VPN Service API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Shutting down V2Ray VPN Service API")


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return {
        "error": True,
        "status_code": exc.status_code,
        "message": exc.detail,
        "path": str(request.url)
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": True,
        "status_code": 500,
        "message": "Internal server error",
        "path": str(request.url)
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    ) 