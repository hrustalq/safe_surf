from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid

from ...core.database import get_db
from ...models import Server
from ...main import get_admin_user
from ...services.health_checker import LoadBalancer

router = APIRouter()


# Pydantic models
class ServerCreate(BaseModel):
    name: str
    address: str
    port: int
    protocol: str
    config: Dict[str, Any]
    location: Optional[str] = None


class ServerUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    status: Optional[str] = None


class ServerResponse(BaseModel):
    id: str
    name: str
    address: str
    port: int
    protocol: str
    config: Dict[str, Any]
    status: str
    location: Optional[str] = None
    load_score: float
    health_score: float
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ServerResponse])
async def get_servers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    protocol: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all servers"""
    query = db.query(Server)
    
    # Apply filters
    if protocol:
        query = query.filter(Server.protocol == protocol)
    
    if status:
        query = query.filter(Server.status == status)
    
    if location:
        query = query.filter(Server.location.ilike(f"%{location}%"))
    
    # Apply pagination
    servers = query.offset(skip).limit(limit).all()
    
    return [
        ServerResponse(
            id=str(server.id),
            name=server.name,
            address=server.address,
            port=server.port,
            protocol=server.protocol,
            config=server.config,
            status=server.status,
            location=server.location,
            load_score=float(server.load_score),
            health_score=float(server.health_score),
            created_at=server.created_at.isoformat(),
            updated_at=server.updated_at.isoformat()
        )
        for server in servers
    ]


@router.post("/", response_model=ServerResponse)
async def create_server(
    server_data: ServerCreate,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new server (admin only)"""
    # Validate protocol
    valid_protocols = ['vmess', 'vless', 'shadowsocks', 'trojan', 'socks']
    if server_data.protocol not in valid_protocols:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid protocol. Must be one of: {', '.join(valid_protocols)}"
        )
    
    # Check if server with same name already exists
    existing = db.query(Server).filter(Server.name == server_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Server with this name already exists")
    
    server = Server(
        name=server_data.name,
        address=server_data.address,
        port=server_data.port,
        protocol=server_data.protocol,
        config=server_data.config,
        location=server_data.location
    )
    
    db.add(server)
    db.commit()
    db.refresh(server)
    
    return ServerResponse(
        id=str(server.id),
        name=server.name,
        address=server.address,
        port=server.port,
        protocol=server.protocol,
        config=server.config,
        status=server.status,
        location=server.location,
        load_score=float(server.load_score),
        health_score=float(server.health_score),
        created_at=server.created_at.isoformat(),
        updated_at=server.updated_at.isoformat()
    )


@router.get("/{server_id}", response_model=ServerResponse)
async def get_server(
    server_id: str,
    db: Session = Depends(get_db)
):
    """Get server by ID"""
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    return ServerResponse(
        id=str(server.id),
        name=server.name,
        address=server.address,
        port=server.port,
        protocol=server.protocol,
        config=server.config,
        status=server.status,
        location=server.location,
        load_score=float(server.load_score),
        health_score=float(server.health_score),
        created_at=server.created_at.isoformat(),
        updated_at=server.updated_at.isoformat()
    )


@router.put("/{server_id}", response_model=ServerResponse)
async def update_server(
    server_id: str,
    server_data: ServerUpdate,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update server (admin only)"""
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Update fields
    if server_data.name:
        # Check if name is already taken by another server
        existing = db.query(Server).filter(
            Server.name == server_data.name,
            Server.id != server_uuid
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Server name already exists")
        server.name = server_data.name
    
    if server_data.address:
        server.address = server_data.address
    if server_data.port:
        server.port = server_data.port
    if server_data.protocol:
        valid_protocols = ['vmess', 'vless', 'shadowsocks', 'trojan', 'socks']
        if server_data.protocol not in valid_protocols:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid protocol. Must be one of: {', '.join(valid_protocols)}"
            )
        server.protocol = server_data.protocol
    if server_data.config:
        server.config = server_data.config
    if server_data.location:
        server.location = server_data.location
    if server_data.status:
        valid_statuses = ['active', 'inactive', 'maintenance']
        if server_data.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        server.status = server_data.status
    
    db.commit()
    db.refresh(server)
    
    return ServerResponse(
        id=str(server.id),
        name=server.name,
        address=server.address,
        port=server.port,
        protocol=server.protocol,
        config=server.config,
        status=server.status,
        location=server.location,
        load_score=float(server.load_score),
        health_score=float(server.health_score),
        created_at=server.created_at.isoformat(),
        updated_at=server.updated_at.isoformat()
    )


@router.delete("/{server_id}")
async def delete_server(
    server_id: str,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete server (admin only)"""
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.delete(server)
    db.commit()
    
    return {"message": "Server deleted successfully"}


@router.get("/{server_id}/health")
async def get_server_health(
    server_id: str,
    db: Session = Depends(get_db)
):
    """Get server health information"""
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    from ...models import ServerHealthCheck
    
    # Get recent health checks
    recent_checks = db.query(ServerHealthCheck).filter(
        ServerHealthCheck.server_id == server_uuid
    ).order_by(ServerHealthCheck.checked_at.desc()).limit(10).all()
    
    return {
        "server_id": str(server.id),
        "server_name": server.name,
        "current_health_score": float(server.health_score),
        "current_load_score": float(server.load_score),
        "status": server.status,
        "is_healthy": server.is_healthy,
        "is_available": server.is_available,
        "recent_checks": [
            {
                "latency_ms": check.latency_ms,
                "success_rate": float(check.success_rate) if check.success_rate else None,
                "error_message": check.error_message,
                "checked_at": check.checked_at.isoformat()
            }
            for check in recent_checks
        ]
    }


@router.post("/{server_id}/test")
async def test_server(
    server_id: str,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Test server connectivity (admin only)"""
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    from ...services.health_checker import ServerHealthChecker
    
    # Perform immediate health check
    health_checker = ServerHealthChecker(db)
    result = await health_checker._check_server_health(server)
    
    return {
        "server_id": str(server.id),
        "test_result": result,
        "timestamp": result.get('checked_at', 'unknown')
    }


@router.get("/available/select")
async def select_server(
    protocol: Optional[str] = None,
    location: Optional[str] = None,
    user_tier: int = Query(0, ge=0),
    strategy: str = Query("weighted_random", regex="^(round_robin|weighted_random|least_connections|latency_based|health_based)$"),
    db: Session = Depends(get_db)
):
    """Select best available server based on criteria"""
    query = db.query(Server).filter(Server.status == 'active')
    
    if protocol:
        query = query.filter(Server.protocol == protocol)
    
    if location:
        query = query.filter(Server.location.ilike(f"%{location}%"))
    
    available_servers = query.all()
    
    if not available_servers:
        raise HTTPException(status_code=404, detail="No servers available matching criteria")
    
    # Use load balancer to select server
    load_balancer = LoadBalancer(strategy=strategy)
    selected_server = load_balancer.select_server(available_servers, user_tier)
    
    if not selected_server:
        raise HTTPException(status_code=404, detail="No healthy servers available")
    
    return {
        "server": ServerResponse(
            id=str(selected_server.id),
            name=selected_server.name,
            address=selected_server.address,
            port=selected_server.port,
            protocol=selected_server.protocol,
            config=selected_server.config,
            status=selected_server.status,
            location=selected_server.location,
            load_score=float(selected_server.load_score),
            health_score=float(selected_server.health_score),
            created_at=selected_server.created_at.isoformat(),
            updated_at=selected_server.updated_at.isoformat()
        ),
        "selection_strategy": strategy,
        "user_tier": user_tier,
        "available_count": len(available_servers)
    } 