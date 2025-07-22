from sqlalchemy import Column, String, Integer, DateTime, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class ConnectionLog(Base):
    __tablename__ = "connection_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    server_id = Column(UUID(as_uuid=True), ForeignKey("servers.id"), index=True)
    inbound_tag = Column(String(50))
    outbound_tag = Column(String(50))
    source_ip = Column(INET)
    destination = Column(String(255))
    bytes_upload = Column(BigInteger, default=0)
    bytes_download = Column(BigInteger, default=0)
    started_at = Column(DateTime(timezone=True), index=True)
    ended_at = Column(DateTime(timezone=True))
    status = Column(String(20), index=True)
    
    # Relationships
    user = relationship("User", back_populates="connections")
    server = relationship("Server", back_populates="connections")
    
    @property
    def total_bytes(self):
        """Total bytes transferred in this connection"""
        return (self.bytes_upload or 0) + (self.bytes_download or 0)
    
    @property
    def duration_seconds(self):
        """Connection duration in seconds"""
        if not self.started_at or not self.ended_at:
            return None
        return (self.ended_at - self.started_at).total_seconds()
    
    @property
    def is_active(self):
        """Check if connection is currently active"""
        return self.status == 'active' and self.ended_at is None
    
    def __repr__(self):
        return f"<ConnectionLog(id={self.id}, user_id={self.user_id}, server_id={self.server_id}, status={self.status})>" 