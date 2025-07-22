from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict

from ...core.database import get_db
from ...main import get_admin_user
from ...services.health_checker import ServerHealthChecker
from ...models import Server, ServerHealthCheck

router = APIRouter()


@router.get("/check/all")
async def check_all_servers_health(
    background_tasks: BackgroundTasks,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Trigger health check for all servers (admin only)"""
    health_checker = ServerHealthChecker(db)
    
    # Run health check in background
    background_tasks.add_task(health_checker.check_all_servers)
    
    return {
        "message": "Health check initiated for all servers",
        "status": "running"
    }


@router.get("/check/server/{server_id}")
async def check_server_health(
    server_id: str,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Check health of specific server (admin only)"""
    import uuid
    
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        return {"error": "Invalid server ID format"}
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        return {"error": "Server not found"}
    
    health_checker = ServerHealthChecker(db)
    result = await health_checker._check_server_health(server)
    
    # Update server health score
    server.health_score = result['health_score']
    
    # Create health check record
    health_check = ServerHealthCheck(
        server_id=server.id,
        latency_ms=result.get('latency_ms'),
        success_rate=result['health_score'],
        error_message=result.get('error'),
    )
    db.add(health_check)
    db.commit()
    
    return {
        "server_id": str(server.id),
        "server_name": server.name,
        "check_result": result,
        "updated_health_score": float(server.health_score)
    }


@router.get("/status")
async def get_health_status(
    db: Session = Depends(get_db)
):
    """Get overall health status of the system"""
    # Server health summary
    servers = db.query(Server).filter(Server.status == 'active').all()
    total_servers = len(servers)
    healthy_servers = len([s for s in servers if s.health_score >= 50])
    
    # Database connectivity
    db_healthy = True
    try:
        db.execute("SELECT 1")
    except Exception:
        db_healthy = False
    
    # Calculate overall system health
    if total_servers == 0:
        system_health = "no_servers"
    elif healthy_servers == 0:
        system_health = "critical"
    elif healthy_servers / total_servers < 0.5:
        system_health = "degraded"
    else:
        system_health = "healthy"
    
    return {
        "system_health": system_health,
        "database": {
            "status": "healthy" if db_healthy else "unhealthy"
        },
        "servers": {
            "total": total_servers,
            "healthy": healthy_servers,
            "unhealthy": total_servers - healthy_servers,
            "health_percentage": round((healthy_servers / total_servers * 100) if total_servers > 0 else 0, 2)
        },
        "services": {
            "api": "healthy",  # If we're responding, API is healthy
            "v2ray": "unknown"  # Would need additional check
        }
    }


@router.get("/history/{server_id}")
async def get_server_health_history(
    server_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get health check history for a specific server"""
    import uuid
    
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        return {"error": "Invalid server ID format"}
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        return {"error": "Server not found"}
    
    health_checks = db.query(ServerHealthCheck).filter(
        ServerHealthCheck.server_id == server_uuid
    ).order_by(ServerHealthCheck.checked_at.desc()).limit(limit).all()
    
    return {
        "server_id": str(server.id),
        "server_name": server.name,
        "current_health_score": float(server.health_score),
        "history": [
            {
                "id": check.id,
                "latency_ms": check.latency_ms,
                "success_rate": float(check.success_rate) if check.success_rate else None,
                "error_message": check.error_message,
                "is_successful": check.is_successful,
                "checked_at": check.checked_at.isoformat()
            }
            for check in health_checks
        ]
    }


@router.get("/metrics")
async def get_health_metrics(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get health metrics in Prometheus format (admin only)"""
    from prometheus_client import generate_latest, CollectorRegistry, Gauge
    
    # Create a custom registry for this request
    registry = CollectorRegistry()
    
    # Define metrics
    server_health_metric = Gauge(
        'v2ray_server_health_score',
        'Server health score',
        ['server_id', 'server_name', 'protocol', 'location'],
        registry=registry
    )
    
    server_load_metric = Gauge(
        'v2ray_server_load_score',
        'Server load score',
        ['server_id', 'server_name'],
        registry=registry
    )
    
    # Populate metrics
    servers = db.query(Server).all()
    for server in servers:
        server_health_metric.labels(
            server_id=str(server.id),
            server_name=server.name,
            protocol=server.protocol,
            location=server.location or 'unknown'
        ).set(float(server.health_score))
        
        server_load_metric.labels(
            server_id=str(server.id),
            server_name=server.name
        ).set(float(server.load_score))
    
    # Generate Prometheus format
    return generate_latest(registry).decode('utf-8')


@router.post("/maintenance/{server_id}")
async def set_server_maintenance(
    server_id: str,
    maintenance: bool,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Set server maintenance mode (admin only)"""
    import uuid
    
    try:
        server_uuid = uuid.UUID(server_id)
    except ValueError:
        return {"error": "Invalid server ID format"}
    
    server = db.query(Server).filter(Server.id == server_uuid).first()
    if not server:
        return {"error": "Server not found"}
    
    if maintenance:
        server.status = 'maintenance'
        message = f"Server {server.name} set to maintenance mode"
    else:
        server.status = 'active'
        message = f"Server {server.name} removed from maintenance mode"
    
    db.commit()
    
    return {
        "message": message,
        "server_id": str(server.id),
        "server_name": server.name,
        "status": server.status
    } 