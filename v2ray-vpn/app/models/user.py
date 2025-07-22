from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Date, BigInteger, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from ..core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), default='active', index=True)
    tier = Column(Integer, default=0, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    reset_token = Column(String(255))
    reset_expires = Column(DateTime(timezone=True))
    
    # Relationships
    auth_methods = relationship("UserAuth", back_populates="user", cascade="all, delete-orphan")
    traffic_records = relationship("UserTraffic", back_populates="user", cascade="all, delete-orphan")
    access_rules = relationship("UserAccessRule", back_populates="user", cascade="all, delete-orphan")
    connections = relationship("ConnectionLog", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


class UserAuth(Base):
    __tablename__ = "user_auth"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    auth_type = Column(String(20), nullable=False, index=True)
    auth_id = Column(String(255), nullable=False, index=True)
    config = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="auth_methods")
    
    __table_args__ = (
        UniqueConstraint('auth_type', 'auth_id', name='unique_auth_type_id'),
    )
    
    def __repr__(self):
        return f"<UserAuth(id={self.id}, user_id={self.user_id}, auth_type={self.auth_type})>"


class UserTraffic(Base):
    __tablename__ = "user_traffic"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    period = Column(Date, primary_key=True, index=True)
    upload_bytes = Column(BigInteger, default=0)
    download_bytes = Column(BigInteger, default=0)
    quota_bytes = Column(BigInteger, default=0, index=True)
    
    # Relationships
    user = relationship("User", back_populates="traffic_records")
    
    @property
    def total_bytes(self):
        return (self.upload_bytes or 0) + (self.download_bytes or 0)
    
    @property
    def remaining_quota(self):
        if self.quota_bytes == 0:  # Unlimited
            return None
        return max(0, self.quota_bytes - self.total_bytes)
    
    @property
    def quota_exceeded(self):
        if self.quota_bytes == 0:  # Unlimited
            return False
        return self.total_bytes > self.quota_bytes
    
    def __repr__(self):
        return f"<UserTraffic(user_id={self.user_id}, period={self.period}, total={self.total_bytes})>"


class UserAccessRule(Base):
    __tablename__ = "user_access_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    server_id = Column(UUID(as_uuid=True), ForeignKey("servers.id", ondelete="CASCADE"), nullable=False)
    allowed = Column(Boolean, default=True, index=True)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="access_rules")
    server = relationship("Server", back_populates="access_rules")
    
    def __repr__(self):
        return f"<UserAccessRule(id={self.id}, user_id={self.user_id}, server_id={self.server_id}, allowed={self.allowed})>" 