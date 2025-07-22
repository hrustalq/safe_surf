from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
import json

from ...core.database import get_db
from ...main import get_admin_user
from ...v2ray.config_manager import V2RayConfigManager
from ...models import V2RayConfig

router = APIRouter()


# Pydantic models
class ConfigValidationResponse(BaseModel):
    valid: bool
    errors: List[str]


class ConfigResponse(BaseModel):
    id: str
    config_hash: str
    status: str
    created_at: str
    applied_at: str = None
    config_preview: Dict[str, Any]
    
    class Config:
        from_attributes = True


@router.get("/current")
async def get_current_config(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get current active V2Ray configuration"""
    active_config = db.query(V2RayConfig).filter(
        V2RayConfig.status == 'active'
    ).order_by(V2RayConfig.applied_at.desc()).first()
    
    if not active_config:
        raise HTTPException(status_code=404, detail="No active configuration found")
    
    return {
        "id": str(active_config.id),
        "config_hash": active_config.config_hash,
        "status": active_config.status,
        "created_at": active_config.created_at.isoformat(),
        "applied_at": active_config.applied_at.isoformat() if active_config.applied_at else None,
        "config": active_config.config_data
    }


@router.get("/generate")
async def generate_config(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Generate new V2Ray configuration without applying"""
    config_manager = V2RayConfigManager(db)
    
    try:
        config = config_manager.generate_config()
        
        # Calculate preview info
        inbound_count = len(config.get('inbounds', []))
        outbound_count = len(config.get('outbounds', []))
        user_count = sum(
            len(inbound.get('settings', {}).get('clients', [])) 
            for inbound in config.get('inbounds', []) 
            if 'clients' in inbound.get('settings', {})
        )
        
        return {
            "config": config,
            "preview": {
                "inbound_count": inbound_count,
                "outbound_count": outbound_count,
                "user_count": user_count,
                "protocols": list(set(
                    inbound.get('protocol') 
                    for inbound in config.get('inbounds', [])
                    if inbound.get('protocol')
                ))
            },
            "timestamp": "now"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate config: {str(e)}")


@router.post("/apply")
async def apply_config(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Apply generated V2Ray configuration"""
    config_manager = V2RayConfigManager(db)
    
    try:
        success = config_manager.apply_config()
        
        if success:
            return {"message": "Configuration applied successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to apply configuration")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration apply error: {str(e)}")


@router.post("/validate")
async def validate_config(
    config_data: Dict[str, Any],
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Validate V2Ray configuration"""
    config_manager = V2RayConfigManager(db)
    
    try:
        is_valid = config_manager._validate_config(config_data)
        errors = []
        
        if not is_valid:
            errors.append("Configuration validation failed")
        
        return ConfigValidationResponse(
            valid=is_valid,
            errors=errors
        )
        
    except Exception as e:
        return ConfigValidationResponse(
            valid=False,
            errors=[f"Validation error: {str(e)}"]
        )


@router.get("/history")
async def get_config_history(
    limit: int = 10,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get configuration history"""
    configs = db.query(V2RayConfig).order_by(
        V2RayConfig.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": str(config.id),
            "config_hash": config.config_hash,
            "status": config.status,
            "created_at": config.created_at.isoformat(),
            "applied_at": config.applied_at.isoformat() if config.applied_at else None,
            "preview": {
                "inbound_count": len(config.config_data.get('inbounds', [])),
                "outbound_count": len(config.config_data.get('outbounds', [])),
                "protocols": list(set(
                    inbound.get('protocol') 
                    for inbound in config.config_data.get('inbounds', [])
                    if inbound.get('protocol')
                ))
            }
        }
        for config in configs
    ]


@router.get("/{config_id}")
async def get_config(
    config_id: str,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get specific configuration by ID"""
    import uuid
    
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid configuration ID format")
    
    config = db.query(V2RayConfig).filter(V2RayConfig.id == config_uuid).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return {
        "id": str(config.id),
        "config_hash": config.config_hash,
        "status": config.status,
        "created_at": config.created_at.isoformat(),
        "applied_at": config.applied_at.isoformat() if config.applied_at else None,
        "config": config.config_data
    }


@router.post("/reload")
async def reload_v2ray(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Reload V2Ray service without config changes"""
    import subprocess
    from ...core.config import settings
    
    try:
        result = subprocess.run(
            ['systemctl', 'reload', settings.v2ray_service_name],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            return {"message": "V2Ray service reloaded successfully"}
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to reload V2Ray: {result.stderr}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reload error: {str(e)}")


@router.post("/backup")
async def create_config_backup(
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create backup of current configuration"""
    import os
    import shutil
    from datetime import datetime
    
    try:
        from ...core.config import settings
        
        # Create backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = "/var/backups/v2ray-vpn/"
        os.makedirs(backup_dir, exist_ok=True)
        
        backup_file = f"{backup_dir}/config_backup_{timestamp}.json"
        
        # Copy current config file
        if os.path.exists(settings.v2ray_config_path):
            shutil.copy2(settings.v2ray_config_path, backup_file)
            
            return {
                "message": "Configuration backup created successfully",
                "backup_file": backup_file,
                "timestamp": timestamp
            }
        else:
            raise HTTPException(status_code=404, detail="Configuration file not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup error: {str(e)}")


@router.post("/restore/{backup_name}")
async def restore_config_backup(
    backup_name: str,
    current_user = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Restore configuration from backup"""
    import os
    import shutil
    
    try:
        from ...core.config import settings
        
        backup_dir = "/var/backups/v2ray-vpn/"
        backup_file = f"{backup_dir}/{backup_name}"
        
        if not os.path.exists(backup_file):
            raise HTTPException(status_code=404, detail="Backup file not found")
        
        # Validate backup file
        with open(backup_file, 'r') as f:
            backup_config = json.load(f)
        
        config_manager = V2RayConfigManager(db)
        if not config_manager._validate_config(backup_config):
            raise HTTPException(status_code=400, detail="Invalid backup configuration")
        
        # Restore configuration
        shutil.copy2(backup_file, settings.v2ray_config_path)
        
        # Reload V2Ray
        subprocess_result = subprocess.run(
            ['systemctl', 'reload', settings.v2ray_service_name],
            capture_output=True,
            text=True
        )
        
        if subprocess_result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Configuration restored but V2Ray reload failed: {subprocess_result.stderr}"
            )
        
        return {
            "message": "Configuration restored successfully from backup",
            "backup_file": backup_name
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid backup file format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore error: {str(e)}") 