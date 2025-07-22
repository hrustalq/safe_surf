from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..core.database import Base


class Server(Base):
    __tablename__ = "servers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    protocol = Column(String(20), nullable=False, index=True)
    config = Column(JSONB, nullable=False)
    status = Column(String(20), default='active', index=True)
    location = Column(String(100), index=True)
    load_score = Column(DECIMAL(5, 2), default=0, index=True)
    health_score = Column(DECIMAL(5, 2), default=100, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    access_rules = relationship("UserAccessRule", back_populates="server", cascade="all, delete-orphan")
    health_checks = relationship("ServerHealthCheck", back_populates="server", cascade="all, delete-orphan")
    connections = relationship("ConnectionLog", back_populates="server")
    
    @property
    def is_healthy(self):
        """Check if server is healthy based on health score"""
        return self.health_score >= 50.0
    
    @property
    def is_active(self):
        """Check if server is active"""
        return self.status == 'active'
    
    @property
    def is_available(self):
        """Check if server is available for new connections"""
        return self.is_active and self.is_healthy
    
    def __repr__(self):
        return f"<Server(id={self.id}, name={self.name}, protocol={self.protocol}, status={self.status})>"


class ServerHealthCheck(Base):
    __tablename__ = "server_health_checks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(UUID(as_uuid=True), ForeignKey("servers.id", ondelete="CASCADE"), nullable=False)
    latency_ms = Column(Integer)
    success_rate = Column(DECIMAL(5, 2))
    error_message = Column(Text)
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    server = relationship("Server", back_populates="health_checks")
    
    @property
    def is_successful(self):
        """Check if health check was successful"""
        return self.error_message is None and self.latency_ms is not None
    
    def __repr__(self):
        return f"<ServerHealthCheck(id={self.id}, server_id={self.server_id}, latency={self.latency_ms}ms)>" 