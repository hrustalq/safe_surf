import uuid
import secrets
import logging
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models import User, UserAuth, UserTraffic, SystemEvent
from ..core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)


class UserService:
    """Service for user management and credential generation"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def create_user(self, email: str, username: str, password: str, tier: int = 0) -> Tuple[User, Dict[str, str]]:
        """Create a new user with automatic credential generation"""
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(
                (User.email == email) | (User.username == username)
            ).first()
            
            if existing_user:
                raise ValueError("User with this email or username already exists")
            
            # Create user
            user = User(
                email=email,
                username=username,
                password_hash=get_password_hash(password),
                tier=tier,
                status='active'
            )
            
            self.db.add(user)
            self.db.flush()  # Get the user ID
            
            # Generate credentials for all protocols
            credentials = self._generate_user_credentials(user)
            
            # Create authentication entries
            for protocol, cred_data in credentials.items():
                auth = UserAuth(
                    user_id=user.id,
                    auth_type=protocol,
                    auth_id=cred_data['auth_id'],
                    config=cred_data.get('config', {})
                )
                self.db.add(auth)
            
            # Initialize traffic quota for current month
            self._initialize_user_traffic(user)
            
            self.db.commit()
            
            # Log user creation
            self._log_user_event(user, 'user_created', 'info', f"User {username} created successfully")
            
            logger.info(f"User {username} created successfully with ID {user.id}")
            
            return user, self._format_credentials_for_client(user, credentials)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create user {username}: {e}")
            raise
    
    def get_user_credentials(self, user_id: uuid.UUID) -> Dict[str, any]:
        """Get user credentials for all protocols"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Get all auth methods
        auth_methods = self.db.query(UserAuth).filter(UserAuth.user_id == user_id).all()
        
        credentials = {}
        for auth in auth_methods:
            credentials[auth.auth_type] = {
                'auth_id': auth.auth_id,
                'config': auth.config or {}
            }
        
        return self._format_credentials_for_client(user, credentials)
    
    def regenerate_credentials(self, user_id: uuid.UUID, protocols: List[str] = None) -> Dict[str, any]:
        """Regenerate credentials for specified protocols (or all if none specified)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        try:
            if protocols is None:
                protocols = ['vmess', 'vless', 'shadowsocks', 'socks', 'http']
            
            # Generate new credentials
            new_credentials = {}
            for protocol in protocols:
                if protocol == 'vmess' or protocol == 'vless':
                    auth_id = str(uuid.uuid4())
                    config = {}
                elif protocol == 'shadowsocks':
                    auth_id = self._generate_password(16)
                    config = {'cipher': 'chacha20-ietf-poly1305'}
                elif protocol in ['socks', 'http']:
                    auth_id = self._generate_password(12)
                    config = {}
                else:
                    continue  # Skip unsupported protocols
                
                new_credentials[protocol] = {
                    'auth_id': auth_id,
                    'config': config
                }
                
                # Update or create auth record
                auth = self.db.query(UserAuth).filter(
                    UserAuth.user_id == user_id,
                    UserAuth.auth_type == protocol
                ).first()
                
                if auth:
                    auth.auth_id = auth_id
                    auth.config = config
                else:
                    auth = UserAuth(
                        user_id=user_id,
                        auth_type=protocol,
                        auth_id=auth_id,
                        config=config
                    )
                    self.db.add(auth)
            
            self.db.commit()
            
            # Log credential regeneration
            self._log_user_event(user, 'credentials_regenerated', 'info', 
                               f"Credentials regenerated for protocols: {', '.join(protocols)}")
            
            return self._format_credentials_for_client(user, new_credentials)
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to regenerate credentials for user {user_id}: {e}")
            raise
    
    def update_user_quota(self, user_id: uuid.UUID, quota_bytes: int, period: str = 'monthly') -> bool:
        """Update user traffic quota"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")
            
            # For now, we only support monthly quotas
            if period != 'monthly':
                raise ValueError("Only monthly quotas are supported")
            
            # Get current month traffic record
            today = datetime.utcnow().date()
            current_month = today.replace(day=1)
            
            traffic = self.db.query(UserTraffic).filter(
                UserTraffic.user_id == user_id,
                UserTraffic.period == current_month
            ).first()
            
            if traffic:
                traffic.quota_bytes = quota_bytes
            else:
                traffic = UserTraffic(
                    user_id=user_id,
                    period=current_month,
                    quota_bytes=quota_bytes
                )
                self.db.add(traffic)
            
            self.db.commit()
            
            # Log quota update
            quota_gb = quota_bytes / (1024**3) if quota_bytes > 0 else 0
            self._log_user_event(user, 'quota_updated', 'info', 
                               f"Traffic quota updated to {quota_gb:.2f} GB")
            
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update quota for user {user_id}: {e}")
            raise
    
    def get_user_traffic(self, user_id: uuid.UUID, period: Optional[str] = None) -> Dict:
        """Get user traffic statistics"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Default to current month if no period specified
        if period is None:
            today = datetime.utcnow().date()
            period_date = today.replace(day=1)
        else:
            # Parse period (format: YYYY-MM)
            try:
                year, month = map(int, period.split('-'))
                period_date = datetime(year, month, 1).date()
            except ValueError:
                raise ValueError("Invalid period format. Use YYYY-MM")
        
        traffic = self.db.query(UserTraffic).filter(
            UserTraffic.user_id == user_id,
            UserTraffic.period == period_date
        ).first()
        
        if not traffic:
            return {
                'user_id': str(user_id),
                'period': period_date.strftime('%Y-%m'),
                'upload_bytes': 0,
                'download_bytes': 0,
                'total_bytes': 0,
                'quota_bytes': 0,
                'remaining_quota': None,
                'quota_exceeded': False
            }
        
        return {
            'user_id': str(user_id),
            'period': period_date.strftime('%Y-%m'),
            'upload_bytes': traffic.upload_bytes,
            'download_bytes': traffic.download_bytes,
            'total_bytes': traffic.total_bytes,
            'quota_bytes': traffic.quota_bytes,
            'remaining_quota': traffic.remaining_quota,
            'quota_exceeded': traffic.quota_exceeded
        }
    
    def _generate_user_credentials(self, user: User) -> Dict[str, Dict]:
        """Generate credentials for all supported protocols"""
        credentials = {}
        
        # VMess - UUID based
        credentials['vmess'] = {
            'auth_id': str(uuid.uuid4()),
            'config': {
                'alterId': 0,
                'security': 'auto'
            }
        }
        
        # VLESS - UUID based
        credentials['vless'] = {
            'auth_id': str(uuid.uuid4()),
            'config': {
                'encryption': 'none'
            }
        }
        
        # Shadowsocks - Password based
        credentials['shadowsocks'] = {
            'auth_id': self._generate_password(16),
            'config': {
                'cipher': 'chacha20-ietf-poly1305'
            }
        }
        
        # SOCKS - Username/Password
        credentials['socks'] = {
            'auth_id': self._generate_password(12),
            'config': {}
        }
        
        # HTTP - Username/Password
        credentials['http'] = {
            'auth_id': self._generate_password(12),
            'config': {}
        }
        
        return credentials
    
    def _format_credentials_for_client(self, user: User, credentials: Dict) -> Dict[str, any]:
        """Format credentials for client response with connection strings"""
        formatted = {
            'user_id': str(user.id),
            'username': user.username,
            'email': user.email,
            'tier': user.tier,
            'protocols': {}
        }
        
        for protocol, cred_data in credentials.items():
            auth_id = cred_data['auth_id']
            config = cred_data.get('config', {})
            
            protocol_info = {
                'auth_id': auth_id,
                'config': config
            }
            
            # Add connection strings based on protocol
            if protocol == 'vmess':
                protocol_info['connection_string'] = self._generate_vmess_url(user, auth_id)
            elif protocol == 'vless':
                protocol_info['connection_string'] = self._generate_vless_url(user, auth_id)
            elif protocol == 'shadowsocks':
                protocol_info['connection_string'] = self._generate_shadowsocks_url(user, auth_id, config)
            elif protocol == 'socks':
                protocol_info['connection_string'] = f"socks5://{user.username}:{auth_id}@SERVER:1080"
            elif protocol == 'http':
                protocol_info['connection_string'] = f"http://{user.username}:{auth_id}@SERVER:8118"
            
            formatted['protocols'][protocol] = protocol_info
        
        return formatted
    
    def _generate_vmess_url(self, user: User, uuid_str: str) -> str:
        """Generate VMess connection URL"""
        # This is a simplified version. In production, you'd use actual server details
        config = {
            "v": "2",
            "ps": f"VMess-{user.username}",
            "add": "SERVER_ADDRESS",
            "port": "443",
            "id": uuid_str,
            "aid": "0",
            "scy": "auto",
            "net": "ws",
            "type": "none",
            "host": "",
            "path": "/ray",
            "tls": "tls"
        }
        
        import json
        import base64
        config_json = json.dumps(config)
        encoded = base64.b64encode(config_json.encode()).decode()
        return f"vmess://{encoded}"
    
    def _generate_vless_url(self, user: User, uuid_str: str) -> str:
        """Generate VLESS connection URL"""
        return f"vless://{uuid_str}@SERVER_ADDRESS:8443?encryption=none&security=reality&sni=www.microsoft.com&type=grpc#{user.username}"
    
    def _generate_shadowsocks_url(self, user: User, password: str, config: Dict) -> str:
        """Generate Shadowsocks connection URL"""
        import base64
        method = config.get('cipher', 'chacha20-ietf-poly1305')
        auth_str = f"{method}:{password}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()
        return f"ss://{encoded_auth}@SERVER_ADDRESS:8388#{user.username}"
    
    def _generate_password(self, length: int = 12) -> str:
        """Generate secure random password"""
        return secrets.token_urlsafe(length)[:length]
    
    def _initialize_user_traffic(self, user: User):
        """Initialize traffic quota for new user"""
        today = datetime.utcnow().date()
        current_month = today.replace(day=1)
        
        # Default quotas based on tier
        quota_map = {
            0: 10 * 1024**3,  # 10GB for free tier
            1: 50 * 1024**3,  # 50GB for basic tier
            2: 200 * 1024**3, # 200GB for premium tier
            3: 0,             # Unlimited for VIP tier
        }
        
        quota_bytes = quota_map.get(user.tier, 10 * 1024**3)
        
        traffic = UserTraffic(
            user_id=user.id,
            period=current_month,
            quota_bytes=quota_bytes
        )
        
        self.db.add(traffic)
    
    def _log_user_event(self, user: User, event_type: str, severity: str, message: str):
        """Log user-related system event"""
        try:
            event = SystemEvent(
                event_type=event_type,
                severity=severity,
                message=message,
                metadata={
                    'user_id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'tier': user.tier
                }
            )
            self.db.add(event)
        except Exception as e:
            logger.error(f"Failed to log user event: {e}") 