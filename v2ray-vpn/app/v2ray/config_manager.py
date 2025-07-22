import json
import hashlib
import logging
import subprocess
from typing import Dict, List, Any, Optional
from copy import deepcopy
from sqlalchemy.orm import Session
from datetime import datetime

from ..models import User, UserAuth, Server, V2RayConfig, SystemEvent
from ..core.config import settings

logger = logging.getLogger(__name__)


class V2RayConfigManager:
    """V2Ray configuration management system"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.base_config = self._load_base_config()
    
    def _load_base_config(self) -> Dict[str, Any]:
        """Load base V2Ray configuration template"""
        return {
            "log": {
                "access": "/var/log/v2ray/access.log",
                "error": "/var/log/v2ray/error.log",
                "loglevel": "warning"
            },
            "api": {
                "tag": "api",
                "services": [
                    "HandlerService",
                    "LoggerService",
                    "StatsService"
                ]
            },
            "stats": {},
            "policy": {
                "levels": {
                    "0": {
                        "handshake": 4,
                        "connIdle": 300,
                        "uplinkOnly": 2,
                        "downlinkOnly": 5,
                        "statsUserUplink": True,
                        "statsUserDownlink": True,
                        "bufferSize": 10240
                    }
                },
                "system": {
                    "statsInboundUplink": True,
                    "statsInboundDownlink": True,
                    "statsOutboundUplink": True,
                    "statsOutboundDownlink": True
                }
            },
            "inbounds": [],
            "outbounds": [],
            "routing": {
                "domainStrategy": "IPIfNonMatch",
                "rules": []
            }
        }
    
    def generate_config(self) -> Dict[str, Any]:
        """Generate complete V2Ray configuration"""
        config = deepcopy(self.base_config)
        
        # Add inbounds for all active users
        config['inbounds'] = self._generate_inbounds()
        
        # Add outbounds for all active servers
        config['outbounds'] = self._generate_outbounds()
        
        # Generate routing rules
        config['routing']['rules'] = self._generate_routing_rules()
        
        # Add user-specific policies
        config['policy']['levels'].update(self._generate_user_policies())
        
        return config
    
    def _generate_inbounds(self) -> List[Dict[str, Any]]:
        """Generate inbound configurations for all users"""
        inbounds = []
        
        # API inbound
        inbounds.append({
            "tag": "api",
            "port": settings.v2ray_api_port,
            "listen": "127.0.0.1",
            "protocol": "dokodemo-door",
            "settings": {
                "address": "127.0.0.1"
            }
        })
        
        # VMess inbound
        vmess_users = self._get_users_by_auth_type('vmess')
        if vmess_users:
            inbounds.append({
                "tag": "vmess-in",
                "port": 443,
                "protocol": "vmess",
                "settings": {
                    "clients": [
                        {
                            "id": auth.auth_id,
                            "email": user.email,
                            "level": user.tier,
                            "alterId": 0
                        } for user, auth in vmess_users
                    ]
                },
                "streamSettings": {
                    "network": "ws",
                    "wsSettings": {
                        "path": "/ray"
                    },
                    "security": "tls",
                    "tlsSettings": {
                        "certificates": [{
                            "certificateFile": "/etc/v2ray/cert.pem",
                            "keyFile": "/etc/v2ray/key.pem"
                        }]
                    }
                }
            })
        
        # VLESS inbound
        vless_users = self._get_users_by_auth_type('vless')
        if vless_users:
            inbounds.append({
                "tag": "vless-in",
                "port": 8443,
                "protocol": "vless",
                "settings": {
                    "clients": [
                        {
                            "id": auth.auth_id,
                            "email": user.email,
                            "level": user.tier
                        } for user, auth in vless_users
                    ],
                    "decryption": "none"
                },
                "streamSettings": {
                    "network": "grpc",
                    "security": "reality",
                    "realitySettings": {
                        "show": False,
                        "dest": "www.microsoft.com:443",
                        "xver": 0,
                        "serverNames": ["www.microsoft.com"],
                        "privateKey": "YOUR_PRIVATE_KEY",
                        "shortIds": [""]
                    }
                }
            })
        
        # Shadowsocks inbound
        ss_users = self._get_users_by_auth_type('shadowsocks')
        if ss_users:
            inbounds.append({
                "tag": "shadowsocks-in",
                "port": 8388,
                "protocol": "shadowsocks",
                "settings": {
                    "method": "chacha20-ietf-poly1305",
                    "clients": [
                        {
                            "password": auth.auth_id,
                            "email": user.email,
                            "level": user.tier
                        } for user, auth in ss_users
                    ]
                }
            })
        
        # SOCKS inbound
        socks_users = self._get_users_by_auth_type('socks')
        if socks_users:
            inbounds.append({
                "tag": "socks-in",
                "port": 1080,
                "protocol": "socks",
                "settings": {
                    "auth": "password",
                    "accounts": [
                        {
                            "user": user.username,
                            "pass": auth.auth_id,
                            "level": user.tier
                        } for user, auth in socks_users
                    ]
                }
            })
        
        # HTTP inbound
        http_users = self._get_users_by_auth_type('http')
        if http_users:
            inbounds.append({
                "tag": "http-in",
                "port": 8118,
                "protocol": "http",
                "settings": {
                    "accounts": [
                        {
                            "user": user.username,
                            "pass": auth.auth_id,
                            "level": user.tier
                        } for user, auth in http_users
                    ]
                }
            })
        
        return inbounds
    
    def _generate_outbounds(self) -> List[Dict[str, Any]]:
        """Generate outbound configurations for all servers"""
        outbounds = []
        
        # Direct outbound
        outbounds.append({
            "tag": "direct",
            "protocol": "freedom",
            "settings": {}
        })
        
        # Blocked outbound
        outbounds.append({
            "tag": "blocked",
            "protocol": "blackhole",
            "settings": {}
        })
        
        # Server outbounds
        active_servers = self.db.query(Server).filter(
            Server.status == 'active'
        ).all()
        
        for server in active_servers:
            outbound_config = {
                "tag": f"server-{server.id}",
                "protocol": server.protocol
            }
            
            if server.protocol == "vmess":
                outbound_config["settings"] = {
                    "vnext": [{
                        "address": server.address,
                        "port": server.port,
                        "users": [{
                            "id": server.config.get("id", ""),
                            "alterId": 0,
                            "security": "auto"
                        }]
                    }]
                }
            elif server.protocol == "vless":
                outbound_config["settings"] = {
                    "vnext": [{
                        "address": server.address,
                        "port": server.port,
                        "users": [{
                            "id": server.config.get("id", ""),
                            "encryption": "none"
                        }]
                    }]
                }
            elif server.protocol == "shadowsocks":
                outbound_config["settings"] = {
                    "servers": [{
                        "address": server.address,
                        "port": server.port,
                        "method": server.config.get("cipher", "chacha20-ietf-poly1305"),
                        "password": server.config.get("password", "")
                    }]
                }
            
            # Add stream settings if configured
            if "streamSettings" in server.config:
                outbound_config["streamSettings"] = server.config["streamSettings"]
            
            outbounds.append(outbound_config)
        
        return outbounds
    
    def _generate_routing_rules(self) -> List[Dict[str, Any]]:
        """Generate routing rules"""
        rules = [
            {
                "inboundTag": ["api"],
                "outboundTag": "api",
                "type": "field"
            },
            {
                "type": "field",
                "ip": ["geoip:private"],
                "outboundTag": "blocked"
            },
            {
                "type": "field",
                "domain": ["geosite:category-ads-all"],
                "outboundTag": "blocked"
            }
        ]
        
        # Add server-specific routing rules
        active_servers = self.db.query(Server).filter(
            Server.status == 'active'
        ).all()
        
        for server in active_servers:
            rules.append({
                "type": "field",
                "inboundTag": [f"{server.protocol}-in"],
                "balancerTag": "load-balancer"
            })
        
        return rules
    
    def _generate_user_policies(self) -> Dict[str, Dict[str, Any]]:
        """Generate user-specific policies"""
        policies = {}
        
        # Get all tiers and their configurations
        tiers = self.db.query(User.tier).distinct().all()
        
        for tier_row in tiers:
            tier = tier_row[0]
            policy = {
                "handshake": 4,
                "connIdle": 300,
                "uplinkOnly": 2,
                "downlinkOnly": 5,
                "statsUserUplink": True,
                "statsUserDownlink": True,
                "bufferSize": 10240
            }
            
            # Adjust policy based on tier
            if tier >= 2:  # Premium tiers
                policy.update({
                    "connIdle": 600,
                    "bufferSize": 20480
                })
            
            policies[str(tier)] = policy
        
        return policies
    
    def _get_users_by_auth_type(self, auth_type: str) -> List[tuple]:
        """Get users with specific authentication type"""
        return self.db.query(User, UserAuth).join(
            UserAuth, User.id == UserAuth.user_id
        ).filter(
            User.status == 'active',
            UserAuth.auth_type == auth_type
        ).all()
    
    def apply_config(self) -> bool:
        """Generate and apply V2Ray configuration"""
        try:
            config = self.generate_config()
            
            # Validate configuration
            if not self._validate_config(config):
                logger.error("Generated configuration is invalid")
                return False
            
            # Calculate config hash
            config_json = json.dumps(config, sort_keys=True)
            config_hash = hashlib.sha256(config_json.encode()).hexdigest()
            
            # Check if config already exists and is active
            existing_config = self.db.query(V2RayConfig).filter(
                V2RayConfig.config_hash == config_hash,
                V2RayConfig.status == 'active'
            ).first()
            
            if existing_config:
                logger.info("Configuration already active, no changes needed")
                return True
            
            # Save new configuration to database
            new_config = V2RayConfig(
                config_hash=config_hash,
                config_data=config,
                status='pending'
            )
            self.db.add(new_config)
            self.db.commit()
            
            # Write configuration file
            with open(settings.v2ray_config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Reload V2Ray service
            result = subprocess.run(
                ['systemctl', 'reload', settings.v2ray_service_name],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Update config status
                new_config.status = 'active'
                new_config.applied_at = datetime.utcnow()
                
                # Deactivate old configs
                self.db.query(V2RayConfig).filter(
                    V2RayConfig.id != new_config.id,
                    V2RayConfig.status == 'active'
                ).update({'status': 'inactive'})
                
                self.db.commit()
                
                # Log success event
                self._log_event("config_applied", "info", 
                              f"V2Ray configuration applied successfully (hash: {config_hash})")
                
                logger.info("V2Ray configuration applied successfully")
                return True
            else:
                # Update config status to failed
                new_config.status = 'failed'
                self.db.commit()
                
                # Log error event
                self._log_event("config_failed", "error", 
                              f"Failed to reload V2Ray service: {result.stderr}")
                
                logger.error(f"Failed to reload V2Ray service: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error applying V2Ray configuration: {e}")
            self._log_event("config_error", "error", f"Configuration error: {str(e)}")
            return False
    
    def _validate_config(self, config: Dict[str, Any]) -> bool:
        """Validate V2Ray configuration"""
        try:
            # Basic structure validation
            required_keys = ['log', 'inbounds', 'outbounds', 'routing']
            for key in required_keys:
                if key not in config:
                    logger.error(f"Missing required configuration key: {key}")
                    return False
            
            # Validate inbounds
            if not isinstance(config['inbounds'], list):
                logger.error("Inbounds must be a list")
                return False
            
            # Validate outbounds
            if not isinstance(config['outbounds'], list):
                logger.error("Outbounds must be a list")
                return False
            
            # Check for at least one outbound
            if len(config['outbounds']) == 0:
                logger.error("At least one outbound is required")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Configuration validation error: {e}")
            return False
    
    def _log_event(self, event_type: str, severity: str, message: str, metadata: Optional[Dict] = None):
        """Log system event"""
        try:
            event = SystemEvent(
                event_type=event_type,
                severity=severity,
                message=message,
                metadata=metadata or {}
            )
            self.db.add(event)
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to log system event: {e}")


class ConfigReloader:
    """Hot reload system for V2Ray configuration"""
    
    def __init__(self, config_manager: V2RayConfigManager):
        self.config_manager = config_manager
        self.reload_lock = False
    
    def add_user(self, user_data: Dict[str, Any]) -> bool:
        """Add user without full config reload"""
        if self.reload_lock:
            logger.warning("Reload already in progress")
            return False
        
        try:
            self.reload_lock = True
            # For now, trigger full config reload
            # In production, implement V2Ray API hot adding
            return self.config_manager.apply_config()
        finally:
            self.reload_lock = False
    
    def remove_user(self, user_email: str) -> bool:
        """Remove user without full config reload"""
        if self.reload_lock:
            logger.warning("Reload already in progress")
            return False
        
        try:
            self.reload_lock = True
            # For now, trigger full config reload
            # In production, implement V2Ray API hot removal
            return self.config_manager.apply_config()
        finally:
            self.reload_lock = False
    
    def update_servers(self) -> bool:
        """Update server configurations"""
        if self.reload_lock:
            logger.warning("Reload already in progress")
            return False
        
        try:
            self.reload_lock = True
            return self.config_manager.apply_config()
        finally:
            self.reload_lock = False 