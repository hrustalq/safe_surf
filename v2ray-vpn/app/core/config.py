import os
from typing import List, Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    # Database settings
    database_url: str = "postgresql://v2ray_vpn:password@localhost/v2ray_vpn"
    
    # API settings
    api_title: str = "V2Ray VPN Service API"
    api_version: str = "1.0.0"
    debug: bool = False
    
    # Security settings
    secret_key: str = "your-secret-key-change-me"
    access_token_expire_minutes: int = 30
    
    # V2Ray settings
    v2ray_config_path: str = "/etc/v2ray/config.json"
    v2ray_api_port: int = 10085
    v2ray_service_name: str = "v2ray"
    
    # Server settings
    default_inbound_port_start: int = 10000
    default_inbound_port_end: int = 20000
    
    # Monitoring settings
    health_check_interval: int = 300  # 5 minutes
    stats_collection_interval: int = 60  # 1 minute
    
    # External services
    redis_url: str = "redis://localhost:6379/0"
    
    # CORS settings
    allowed_origins: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings() 