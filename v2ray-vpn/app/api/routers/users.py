from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid

from ...core.database import get_db
from ...models import User
from ...services.user_service import UserService
from ...main import get_current_user, get_admin_user

router = APIRouter()


# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    tier: Optional[int] = 0


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    tier: Optional[int] = None
    status: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    tier: int
    status: str
    created_at: str
    last_login: Optional[str] = None
    
    class Config:
        from_attributes = True


class TrafficQuotaUpdate(BaseModel):
    quota_bytes: int
    period: Optional[str] = "monthly"


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    tier: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    query = db.query(User)
    
    # Apply filters
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    if tier is not None:
        query = query.filter(User.tier == tier)
    
    if status:
        query = query.filter(User.status == status)
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            tier=user.tier,
            status=user.status,
            created_at=user.created_at.isoformat(),
            last_login=user.last_login.isoformat() if user.last_login else None
        )
        for user in users
    ]


@router.post("/", response_model=dict)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    try:
        user_service = UserService(db)
        user, credentials = user_service.create_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            tier=user_data.tier
        )
        
        return {
            "message": "User created successfully",
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


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    # Users can only access their own data unless they're admin
    if str(current_user.id) != user_id and current_user.tier < 999:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        tier=user.tier,
        status=user.status,
        created_at=user.created_at.isoformat(),
        last_login=user.last_login.isoformat() if user.last_login else None
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user (admin only)"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.email:
        user.email = user_data.email
    if user_data.username:
        user.username = user_data.username
    if user_data.tier is not None:
        user.tier = user_data.tier
    if user_data.status:
        user.status = user_data.status
    
    db.commit()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        tier=user.tier,
        status=user.status,
        created_at=user.created_at.isoformat(),
        last_login=user.last_login.isoformat() if user.last_login else None
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting admin users
    if user.tier >= 999:
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.get("/{user_id}/credentials")
async def get_user_credentials(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user VPN credentials"""
    # Users can only access their own credentials unless they're admin
    if str(current_user.id) != user_id and current_user.tier < 999:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    try:
        user_service = UserService(db)
        credentials = user_service.get_user_credentials(user_uuid)
        return credentials
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{user_id}/credentials/regenerate")
async def regenerate_credentials(
    user_id: str,
    protocols: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate user VPN credentials"""
    # Users can regenerate their own credentials, admins can regenerate any
    if str(current_user.id) != user_id and current_user.tier < 999:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    try:
        user_service = UserService(db)
        credentials = user_service.regenerate_credentials(user_uuid, protocols)
        return {
            "message": "Credentials regenerated successfully",
            "credentials": credentials
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{user_id}/traffic")
async def get_user_traffic(
    user_id: str,
    period: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user traffic statistics"""
    # Users can only access their own traffic unless they're admin
    if str(current_user.id) != user_id and current_user.tier < 999:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    try:
        user_service = UserService(db)
        traffic = user_service.get_user_traffic(user_uuid, period)
        return traffic
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}/quota")
async def update_user_quota(
    user_id: str,
    quota_data: TrafficQuotaUpdate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user traffic quota (admin only)"""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    try:
        user_service = UserService(db)
        success = user_service.update_user_quota(
            user_uuid, 
            quota_data.quota_bytes, 
            quota_data.period
        )
        
        if success:
            return {"message": "User quota updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update quota")
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}/connections")
async def get_user_connections(
    user_id: str,
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user connection history"""
    # Users can only access their own connections unless they're admin
    if str(current_user.id) != user_id and current_user.tier < 999:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    from ...models import ConnectionLog
    
    connections = db.query(ConnectionLog).filter(
        ConnectionLog.user_id == user_uuid
    ).order_by(ConnectionLog.started_at.desc()).limit(limit).all()
    
    return [
        {
            "id": conn.id,
            "server_id": str(conn.server_id) if conn.server_id else None,
            "source_ip": str(conn.source_ip) if conn.source_ip else None,
            "destination": conn.destination,
            "bytes_upload": conn.bytes_upload,
            "bytes_download": conn.bytes_download,
            "total_bytes": conn.total_bytes,
            "started_at": conn.started_at.isoformat() if conn.started_at else None,
            "ended_at": conn.ended_at.isoformat() if conn.ended_at else None,
            "duration_seconds": conn.duration_seconds,
            "status": conn.status
        }
        for conn in connections
    ] 