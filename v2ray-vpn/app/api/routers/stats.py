from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Dict, List
from datetime import datetime, timedelta, date

from ...core.database import get_db
from ...models import User, UserTraffic, ConnectionLog, Server, SystemEvent
from ...main import get_admin_user, get_current_user

router = APIRouter()


@router.get("/system")
async def get_system_stats(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get overall system statistics (admin only)"""
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == 'active').count()
    
    # User tier distribution
    tier_stats = db.query(
        User.tier, func.count(User.id).label('count')
    ).group_by(User.tier).all()
    
    # Server statistics
    total_servers = db.query(Server).count()
    active_servers = db.query(Server).filter(Server.status == 'active').count()
    
    # Protocol distribution
    protocol_stats = db.query(
        Server.protocol, func.count(Server.id).label('count')
    ).group_by(Server.protocol).all()
    
    # Recent activity
    today = date.today()
    recent_connections = db.query(ConnectionLog).filter(
        func.date(ConnectionLog.started_at) == today
    ).count()
    
    # System events (errors/warnings in last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_events = db.query(SystemEvent).filter(
        SystemEvent.created_at >= yesterday,
        SystemEvent.severity.in_(['error', 'critical', 'warning'])
    ).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "tier_distribution": {str(tier): count for tier, count in tier_stats}
        },
        "servers": {
            "total": total_servers,
            "active": active_servers,
            "protocol_distribution": {protocol: count for protocol, count in protocol_stats}
        },
        "activity": {
            "connections_today": recent_connections,
            "recent_issues": recent_events
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/traffic")
async def get_traffic_stats(
    period: str = Query("day", regex="^(hour|day|week|month)$"),
    user_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get traffic statistics"""
    # Non-admin users can only see their own traffic
    if user_id and str(current_user.id) != user_id and current_user.tier < 999:
        user_id = str(current_user.id)  # Force to current user
    elif not user_id and current_user.tier < 999:
        user_id = str(current_user.id)  # Default to current user for non-admins
    
    # Calculate time range based on period
    now = datetime.utcnow()
    if period == "hour":
        start_time = now - timedelta(hours=1)
    elif period == "day":
        start_time = now - timedelta(days=1)
    elif period == "week":
        start_time = now - timedelta(weeks=1)
    else:  # month
        start_time = now - timedelta(days=30)
    
    query = db.query(ConnectionLog).filter(
        ConnectionLog.started_at >= start_time
    )
    
    # Filter by user if specified
    if user_id:
        import uuid
        try:
            user_uuid = uuid.UUID(user_id)
            query = query.filter(ConnectionLog.user_id == user_uuid)
        except ValueError:
            pass  # Invalid UUID, ignore filter
    
    connections = query.all()
    
    # Calculate statistics
    total_upload = sum(conn.bytes_upload or 0 for conn in connections)
    total_download = sum(conn.bytes_download or 0 for conn in connections)
    total_connections = len(connections)
    active_connections = len([c for c in connections if c.is_active])
    
    # Protocol breakdown
    protocol_stats = {}
    for conn in connections:
        if conn.server and conn.server.protocol:
            protocol = conn.server.protocol
            if protocol not in protocol_stats:
                protocol_stats[protocol] = {"upload": 0, "download": 0, "connections": 0}
            protocol_stats[protocol]["upload"] += conn.bytes_upload or 0
            protocol_stats[protocol]["download"] += conn.bytes_download or 0
            protocol_stats[protocol]["connections"] += 1
    
    return {
        "period": period,
        "start_time": start_time.isoformat(),
        "end_time": now.isoformat(),
        "total_upload_bytes": total_upload,
        "total_download_bytes": total_download,
        "total_bytes": total_upload + total_download,
        "total_connections": total_connections,
        "active_connections": active_connections,
        "protocol_breakdown": protocol_stats,
        "user_id": user_id
    }


@router.get("/connections")
async def get_connection_stats(
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get connection statistics and recent connections"""
    # Non-admin users can only see their own connections
    if user_id and str(current_user.id) != user_id and current_user.tier < 999:
        user_id = str(current_user.id)
    elif not user_id and current_user.tier < 999:
        user_id = str(current_user.id)
    
    query = db.query(ConnectionLog).order_by(ConnectionLog.started_at.desc())
    
    # Apply filters
    if user_id:
        import uuid
        try:
            user_uuid = uuid.UUID(user_id)
            query = query.filter(ConnectionLog.user_id == user_uuid)
        except ValueError:
            pass
    
    if status:
        query = query.filter(ConnectionLog.status == status)
    
    connections = query.limit(limit).all()
    
    # Calculate summary statistics
    total_active = db.query(ConnectionLog).filter(ConnectionLog.status == 'active').count()
    total_today = db.query(ConnectionLog).filter(
        func.date(ConnectionLog.started_at) == date.today()
    ).count()
    
    return {
        "summary": {
            "total_active": total_active,
            "total_today": total_today,
            "showing": len(connections)
        },
        "connections": [
            {
                "id": conn.id,
                "user_id": str(conn.user_id) if conn.user_id else None,
                "server_id": str(conn.server_id) if conn.server_id else None,
                "server_name": conn.server.name if conn.server else None,
                "protocol": conn.server.protocol if conn.server else None,
                "source_ip": str(conn.source_ip) if conn.source_ip else None,
                "destination": conn.destination,
                "bytes_upload": conn.bytes_upload,
                "bytes_download": conn.bytes_download,
                "total_bytes": conn.total_bytes,
                "started_at": conn.started_at.isoformat() if conn.started_at else None,
                "ended_at": conn.ended_at.isoformat() if conn.ended_at else None,
                "duration_seconds": conn.duration_seconds,
                "status": conn.status,
                "is_active": conn.is_active
            }
            for conn in connections
        ]
    }


@router.get("/user/{user_id}/quota")
async def get_user_quota_stats(
    user_id: str,
    period: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user quota and usage statistics"""
    # Users can only see their own quota unless they're admin
    if str(current_user.id) != user_id and current_user.tier < 999:
        user_id = str(current_user.id)
    
    import uuid
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        return {"error": "Invalid user ID format"}
    
    # Get user
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        return {"error": "User not found"}
    
    # Default to current month if no period specified
    if period is None:
        today = date.today()
        period_date = today.replace(day=1)
    else:
        # Parse period (format: YYYY-MM)
        try:
            year, month = map(int, period.split('-'))
            period_date = date(year, month, 1)
        except ValueError:
            return {"error": "Invalid period format. Use YYYY-MM"}
    
    traffic = db.query(UserTraffic).filter(
        UserTraffic.user_id == user_uuid,
        UserTraffic.period == period_date
    ).first()
    
    if not traffic:
        quota_map = {
            0: 10 * 1024**3,  # 10GB for free tier
            1: 50 * 1024**3,  # 50GB for basic tier
            2: 200 * 1024**3, # 200GB for premium tier
            3: 0,             # Unlimited for VIP tier
        }
        default_quota = quota_map.get(user.tier, 10 * 1024**3)
        
        return {
            "user_id": str(user_uuid),
            "period": period_date.strftime('%Y-%m'),
            "upload_bytes": 0,
            "download_bytes": 0,
            "total_bytes": 0,
            "quota_bytes": default_quota,
            "remaining_quota": default_quota if default_quota > 0 else None,
            "quota_exceeded": False,
            "usage_percentage": 0.0
        }
    
    usage_percentage = 0.0
    if traffic.quota_bytes > 0:
        usage_percentage = (traffic.total_bytes / traffic.quota_bytes) * 100
    
    return {
        "user_id": str(user_uuid),
        "period": period_date.strftime('%Y-%m'),
        "upload_bytes": traffic.upload_bytes,
        "download_bytes": traffic.download_bytes,
        "total_bytes": traffic.total_bytes,
        "quota_bytes": traffic.quota_bytes,
        "remaining_quota": traffic.remaining_quota,
        "quota_exceeded": traffic.quota_exceeded,
        "usage_percentage": round(usage_percentage, 2)
    }


@router.get("/servers/health")
async def get_servers_health_stats(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get server health statistics (admin only)"""
    servers = db.query(Server).all()
    
    # Calculate health categories
    healthy = len([s for s in servers if s.health_score >= 80])
    degraded = len([s for s in servers if 50 <= s.health_score < 80])
    unhealthy = len([s for s in servers if s.health_score < 50])
    
    # Protocol health breakdown
    protocol_health = {}
    for server in servers:
        protocol = server.protocol
        if protocol not in protocol_health:
            protocol_health[protocol] = {
                "healthy": 0,
                "degraded": 0,
                "unhealthy": 0,
                "average_health": 0
            }
        
        if server.health_score >= 80:
            protocol_health[protocol]["healthy"] += 1
        elif server.health_score >= 50:
            protocol_health[protocol]["degraded"] += 1
        else:
            protocol_health[protocol]["unhealthy"] += 1
    
    # Calculate averages
    for protocol in protocol_health:
        protocol_servers = [s for s in servers if s.protocol == protocol]
        if protocol_servers:
            avg_health = sum(float(s.health_score) for s in protocol_servers) / len(protocol_servers)
            protocol_health[protocol]["average_health"] = round(avg_health, 2)
    
    return {
        "total_servers": len(servers),
        "health_distribution": {
            "healthy": healthy,
            "degraded": degraded,
            "unhealthy": unhealthy
        },
        "protocol_health": protocol_health,
        "servers": [
            {
                "id": str(server.id),
                "name": server.name,
                "protocol": server.protocol,
                "location": server.location,
                "health_score": float(server.health_score),
                "load_score": float(server.load_score),
                "status": server.status,
                "is_available": server.is_available
            }
            for server in servers
        ]
    }


@router.get("/events")
async def get_system_events(
    limit: int = Query(100, ge=1, le=1000),
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system events (admin only)"""
    query = db.query(SystemEvent).order_by(SystemEvent.created_at.desc())
    
    # Apply filters
    if severity:
        query = query.filter(SystemEvent.severity == severity)
    
    if event_type:
        query = query.filter(SystemEvent.event_type == event_type)
    
    events = query.limit(limit).all()
    
    # Count events by severity
    severity_counts = db.query(
        SystemEvent.severity, func.count(SystemEvent.id).label('count')
    ).group_by(SystemEvent.severity).all()
    
    return {
        "total_events": len(events),
        "severity_distribution": {severity: count for severity, count in severity_counts},
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "severity": event.severity,
                "message": event.message,
                "metadata": event.metadata,
                "created_at": event.created_at.isoformat(),
                "is_critical": event.is_critical,
                "is_error": event.is_error
            }
            for event in events
        ]
    } 