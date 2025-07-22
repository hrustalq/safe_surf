from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta

from ...core.database import get_db
from ...core.security import verify_password, get_password_hash, create_access_token
from ...models import User
from ...services.user_service import UserService

router = APIRouter()
security = HTTPBearer()


# Pydantic models for requests/responses
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    tier: Optional[int] = 0


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_info: dict


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


@router.post("/register", response_model=dict)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        user_service = UserService(db)
        user, credentials = user_service.create_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            tier=user_data.tier
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 1800,  # 30 minutes
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "tier": user.tier,
                "status": user.status
            },
            "credentials": credentials
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.username)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if user.status != 'active':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        user_info={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            "status": user.status,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    )


@router.post("/logout")
async def logout():
    """Logout user (client should discard token)"""
    return {"message": "Logged out successfully"}


@router.post("/refresh")
async def refresh_token(db: Session = Depends(get_db)):
    """Refresh access token"""
    # In a more sophisticated implementation, you would use refresh tokens
    # For now, this is a placeholder
    return {"message": "Token refresh not implemented yet"}


@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Request password reset"""
    user = db.query(User).filter(User.email == reset_data.email).first()
    
    if not user:
        # Return success even if user doesn't exist for security
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token (simplified - in production, use secure token)
    import secrets
    from datetime import datetime, timedelta
    
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_expires = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    
    # TODO: Send email with reset link
    # For now, return the token (remove this in production!)
    return {
        "message": "Password reset requested",
        "reset_token": reset_token  # Remove this in production!
    }


@router.post("/reset-password/confirm")
async def confirm_password_reset(
    reset_data: PasswordResetConfirm, 
    db: Session = Depends(get_db)
):
    """Confirm password reset with token"""
    from datetime import datetime
    
    user = db.query(User).filter(
        User.reset_token == reset_data.token,
        User.reset_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.password_hash = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_expires = None
    
    db.commit()
    
    return {"message": "Password reset successfully"}


@router.get("/me")
async def get_current_user_info(db: Session = Depends(get_db)):
    """Get current user information (requires authentication)"""
    # This would need the authentication dependency
    # Placeholder for now
    return {"message": "Current user info endpoint"}


# Add middleware for logging authentication attempts
@router.middleware("http")
async def log_auth_attempts(request, call_next):
    """Log authentication attempts for security monitoring"""
    import logging
    logger = logging.getLogger(__name__)
    
    response = await call_next(request)
    
    # Log failed authentication attempts
    if request.url.path.endswith("/login") and response.status_code == 401:
        client_ip = request.client.host
        logger.warning(f"Failed login attempt from {client_ip}")
    
    return response 