from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from ..core.database import Base


class SystemEvent(Base):
    __tablename__ = "system_events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    message = Column(Text)
    metadata = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    @property
    def is_critical(self):
        """Check if event is critical"""
        return self.severity == 'critical'
    
    @property
    def is_error(self):
        """Check if event is an error"""
        return self.severity in ['error', 'critical']
    
    def __repr__(self):
        return f"<SystemEvent(id={self.id}, type={self.event_type}, severity={self.severity})>"


class V2RayConfig(Base):
    __tablename__ = "v2ray_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_hash = Column(String(64), unique=True, nullable=False, index=True)
    config_data = Column(JSONB, nullable=False)
    status = Column(String(20), default='pending', index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    applied_at = Column(DateTime(timezone=True))
    
    @property
    def is_active(self):
        """Check if config is currently active"""
        return self.status == 'active'
    
    @property
    def is_applied(self):
        """Check if config has been applied"""
        return self.applied_at is not None
    
    def __repr__(self):
        return f"<V2RayConfig(id={self.id}, hash={self.config_hash}, status={self.status})>"


class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    permissions = Column(JSONB, default=lambda: [])
    expires_at = Column(DateTime(timezone=True), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used = Column(DateTime(timezone=True))
    
    @property
    def is_expired(self):
        """Check if API key is expired"""
        if not self.expires_at:
            return False
        return func.now() > self.expires_at
    
    @property
    def is_valid(self):
        """Check if API key is valid (not expired)"""
        return not self.is_expired
    
    def has_permission(self, permission: str) -> bool:
        """Check if API key has specific permission"""
        if not self.permissions:
            return False
        return permission in self.permissions or '*' in self.permissions
    
    def __repr__(self):
        return f"<APIKey(id={self.id}, name={self.name}, expires={self.expires_at})>" 