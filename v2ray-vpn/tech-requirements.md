# V2Ray VPN Service - Complete Technical Requirements

## Project Overview

Build a production-ready VPN service using V2Ray as the core proxy engine with comprehensive management capabilities, user authentication, multi-server support, and automated deployment.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Management API                           │
│  (REST API for user management, server control, monitoring)     │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
┌─────────────────▼─────────────┐ ┌───────────▼───────────────────┐
│     Configuration Manager      │ │      User Management          │
│  (Dynamic config generation)   │ │  (Auth, quotas, policies)     │
└─────────────────┬─────────────┘ └───────────┬───────────────────┘
                  │                           │
┌─────────────────▼───────────────────────────▼───────────────────┐
│                        V2Ray Core                                │
│  (Multiple inbounds, outbounds, routing, policies)              │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
┌─────────────────▼─────────────┐ ┌───────────▼───────────────────┐
│      Monitoring Service        │ │     Database (PostgreSQL)     │
│  (Metrics, logs, alerts)       │ │  (Users, configs, metrics)    │
└───────────────────────────────┘ └───────────────────────────────┘
```

## Core Components

### 1. V2Ray Core Service

**1.1 Base Configuration Structure**
```json
{
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
        "statsUserUplink": true,
        "statsUserDownlink": true,
        "bufferSize": 10240
      }
    },
    "system": {
      "statsInboundUplink": true,
      "statsInboundDownlink": true,
      "statsOutboundUplink": true,
      "statsOutboundDownlink": true
    }
  },
  "inbounds": [],
  "outbounds": [],
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": []
  }
}
```

**1.2 Dynamic Inbound Generation**
- VMess protocol with UUID authentication
- Shadowsocks with multi-user support
- SOCKS5 with optional authentication
- HTTP proxy with user credentials
- Dynamic port allocation (10000-20000 range)

**1.3 Outbound Server Management**
- Support for multiple upstream servers
- Automatic health checking
- Load balancing with multiple strategies
- Failover mechanisms
- Per-server routing rules

### 2. User Management System

**2.1 Database Schema**
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    tier INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    reset_expires TIMESTAMP
);

-- User authentication methods
CREATE TABLE user_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    auth_type VARCHAR(20) NOT NULL, -- 'vmess', 'shadowsocks', 'socks'
    auth_id VARCHAR(255) NOT NULL, -- UUID for VMess, password for others
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auth_type, auth_id)
);

-- Traffic quotas and usage
CREATE TABLE user_traffic (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    upload_bytes BIGINT DEFAULT 0,
    download_bytes BIGINT DEFAULT 0,
    quota_bytes BIGINT DEFAULT 0, -- 0 = unlimited
    PRIMARY KEY(user_id, period)
);

-- Server configurations
CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    config JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    location VARCHAR(100),
    load_score DECIMAL(5,2) DEFAULT 0,
    health_score DECIMAL(5,2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User access rules
CREATE TABLE user_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    allowed BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connection logs
CREATE TABLE connection_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    server_id UUID REFERENCES servers(id),
    inbound_tag VARCHAR(50),
    outbound_tag VARCHAR(50),
    source_ip INET,
    destination VARCHAR(255),
    bytes_upload BIGINT,
    bytes_download BIGINT,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(20)
);

-- System events
CREATE TABLE system_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2.2 User Authentication Flow**
```python
# API endpoint: POST /api/v1/auth/register
def register_user(email, username, password, tier=0):
    # Validate input
    # Hash password with bcrypt
    # Create user record
    # Generate VMess UUID
    # Create auth entries
    # Send welcome email
    # Return auth credentials

# API endpoint: POST /api/v1/auth/login
def login_user(username, password):
    # Verify credentials
    # Generate JWT token
    # Update last_login
    # Return token and user info

# API endpoint: GET /api/v1/user/credentials
def get_user_credentials(user_id):
    # Return all auth methods
    # Include connection strings
    # Generate QR codes
```

### 3. Configuration Management

**3.1 Dynamic Configuration Generator**
```python
class V2RayConfigManager:
    def __init__(self, db_connection):
        self.db = db_connection
        self.base_config = load_base_config()
    
    def generate_config(self):
        config = deepcopy(self.base_config)
        
        # Add inbounds for all active users
        config['inbounds'] = self.generate_inbounds()
        
        # Add outbounds for all active servers
        config['outbounds'] = self.generate_outbounds()
        
        # Generate routing rules
        config['routing']['rules'] = self.generate_routing_rules()
        
        # Add user-specific policies
        config['policy']['levels'].update(self.generate_user_policies())
        
        return config
    
    def generate_inbounds(self):
        inbounds = []
        
        # API inbound
        inbounds.append({
            "tag": "api",
            "port": 10085,
            "listen": "127.0.0.1",
            "protocol": "dokodemo-door",
            "settings": {
                "address": "127.0.0.1"
            }
        })
        
        # VMess inbound
        vmess_users = self.db.query("SELECT * FROM user_auth WHERE auth_type = 'vmess'")
        inbounds.append({
            "tag": "vmess-in",
            "port": 443,
            "protocol": "vmess",
            "settings": {
                "clients": [
                    {
                        "id": user.auth_id,
                        "email": user.email,
                        "level": user.tier,
                        "alterId": 0
                    } for user in vmess_users
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
        
        # Add Shadowsocks, SOCKS, HTTP inbounds
        # ...
        
        return inbounds
    
    def apply_config(self):
        config = self.generate_config()
        
        # Validate configuration
        if not self.validate_config(config):
            raise ValueError("Invalid configuration generated")
        
        # Write to file
        with open('/etc/v2ray/config.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        # Reload V2Ray
        subprocess.run(['systemctl', 'reload', 'v2ray'], check=True)
```

**3.2 Hot Reload System**
```python
class ConfigReloader:
    def __init__(self, config_manager, v2ray_api):
        self.config_manager = config_manager
        self.api = v2ray_api
        self.reload_lock = threading.Lock()
    
    def add_user(self, user_data):
        with self.reload_lock:
            # Add user via API without restart
            self.api.add_user(
                tag="vmess-in",
                user={
                    "email": user_data['email'],
                    "id": user_data['uuid'],
                    "level": user_data['tier']
                }
            )
    
    def remove_user(self, email):
        with self.reload_lock:
            self.api.remove_user(tag="vmess-in", email=email)
    
    def update_servers(self):
        # Full config regeneration needed
        self.config_manager.apply_config()
```

### 4. Server Management

**4.1 Health Checking Service**
```python
class ServerHealthChecker:
    def __init__(self, db_connection):
        self.db = db_connection
        self.checkers = {
            'vmess': VMESSHealthChecker(),
            'shadowsocks': SSHealthChecker(),
            'socks': SOCKSHealthChecker()
        }
    
    async def check_all_servers(self):
        servers = self.db.query("SELECT * FROM servers WHERE status = 'active'")
        
        tasks = []
        for server in servers:
            checker = self.checkers[server.protocol]
            tasks.append(self.check_server(server, checker))
        
        results = await asyncio.gather(*tasks)
        self.update_health_scores(results)
    
    async def check_server(self, server, checker):
        try:
            latency = await checker.measure_latency(server)
            success_rate = await checker.test_connectivity(server)
            
            return {
                'server_id': server.id,
                'latency': latency,
                'success_rate': success_rate,
                'health_score': self.calculate_health_score(latency, success_rate)
            }
        except Exception as e:
            return {
                'server_id': server.id,
                'error': str(e),
                'health_score': 0
            }
```

**4.2 Load Balancing Strategy**
```python
class LoadBalancer:
    def __init__(self, strategy='weighted_random'):
        self.strategy = strategy
        self.strategies = {
            'round_robin': self.round_robin,
            'weighted_random': self.weighted_random,
            'least_connections': self.least_connections,
            'latency_based': self.latency_based
        }
    
    def select_server(self, user, available_servers):
        # Apply user access rules
        allowed_servers = self.filter_by_access_rules(user, available_servers)
        
        # Apply health threshold
        healthy_servers = [s for s in allowed_servers if s.health_score > 50]
        
        # Select using configured strategy
        return self.strategies[self.strategy](healthy_servers)
```

### 5. Management API

**5.1 RESTful API Endpoints**
```yaml
# Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/reset-password

# User Management
GET    /api/v1/users
GET    /api/v1/users/{id}
POST   /api/v1/users
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
GET    /api/v1/users/{id}/credentials
POST   /api/v1/users/{id}/reset-credentials
GET    /api/v1/users/{id}/traffic
PUT    /api/v1/users/{id}/quota

# Server Management
GET    /api/v1/servers
GET    /api/v1/servers/{id}
POST   /api/v1/servers
PUT    /api/v1/servers/{id}
DELETE /api/v1/servers/{id}
GET    /api/v1/servers/{id}/health
POST   /api/v1/servers/{id}/test

# Configuration
GET    /api/v1/config
POST   /api/v1/config/reload
GET    /api/v1/config/validate
POST   /api/v1/config/backup

# Monitoring
GET    /api/v1/stats/system
GET    /api/v1/stats/traffic
GET    /api/v1/stats/connections
GET    /api/v1/logs/access
GET    /api/v1/logs/error
GET    /api/v1/logs/events

# Admin
POST   /api/v1/admin/maintenance
GET    /api/v1/admin/backup
POST   /api/v1/admin/restore
```

**5.2 API Implementation (FastAPI)**
```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI(title="V2Ray VPN Service API")
security = HTTPBearer()

# Database dependency
async def get_db():
    async with Database() as db:
        yield db

# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        user = await db.get_user(user_id)
        if user is None:
            raise HTTPException(status_code=401)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

@app.post("/api/v1/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Check admin permissions
    if not current_user.is_admin:
        raise HTTPException(status_code=403)
    
    # Create user
    user = await db.create_user(user_data)
    
    # Generate V2Ray credentials
    vmess_uuid = str(uuid.uuid4())
    await db.create_user_auth(user.id, 'vmess', vmess_uuid)
    
    # Trigger config reload
    await config_manager.add_user({
        'email': user.email,
        'uuid': vmess_uuid,
        'tier': user.tier
    })
    
    return user

@app.get("/api/v1/stats/traffic")
async def get_traffic_stats(
    period: str = "day",
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Get traffic statistics from V2Ray API
    stats = await v2ray_api.get_stats()
    
    # Aggregate by period
    aggregated = aggregate_traffic(stats, period)
    
    return {
        "period": period,
        "stats": aggregated
    }
```

### 6. Installation and Setup Scripts

**6.1 Master Installation Script**
```bash
#!/bin/bash
# install.sh - Complete V2Ray VPN Service Installation

set -euo pipefail

# Configuration
INSTALL_DIR="/opt/v2ray-vpn"
DATA_DIR="/var/lib/v2ray-vpn"
LOG_DIR="/var/log/v2ray-vpn"
CONFIG_DIR="/etc/v2ray-vpn"
SYSTEMD_DIR="/etc/systemd/system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check root privileges
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log_error "Cannot detect OS"
    fi
    
    case $OS in
        ubuntu|debian)
            PKG_MANAGER="apt-get"
            PKG_UPDATE="apt-get update"
            ;;
        centos|rhel|fedora)
            PKG_MANAGER="yum"
            PKG_UPDATE="yum check-update"
            ;;
        *)
            log_error "Unsupported OS: $OS"
            ;;
    esac
}

# Install system dependencies
install_dependencies() {
    log_info "Installing system dependencies..."
    
    $PKG_UPDATE || true
    
    # Common packages
    PACKAGES="curl wget git python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx ufw fail2ban"
    
    $PKG_MANAGER install -y $PACKAGES
    
    # Install Node.js for web interface
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    $PKG_MANAGER install -y nodejs
}

# Install V2Ray
install_v2ray() {
    log_info "Installing V2Ray..."
    
    # Download and install V2Ray
    wget -O v2ray-install.sh https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh
    bash v2ray-install.sh
    
    # Create V2Ray directories
    mkdir -p /etc/v2ray
    mkdir -p /var/log/v2ray
    
    # Set permissions
    chown -R nobody:nogroup /var/log/v2ray
}

# Setup PostgreSQL
setup_database() {
    log_info "Setting up PostgreSQL database..."
    
    # Start PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Generate secure password
    DB_PASS=$(openssl rand -base64 32)
    
    # Create database and user
    sudo -u postgres psql <<EOF
CREATE USER v2ray_vpn WITH PASSWORD '$DB_PASS';
CREATE DATABASE v2ray_vpn OWNER v2ray_vpn;
GRANT ALL PRIVILEGES ON DATABASE v2ray_vpn TO v2ray_vpn;
EOF
    
    # Save database credentials
    cat > "$CONFIG_DIR/database.env" <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=v2ray_vpn
DB_USER=v2ray_vpn
DB_PASS=$DB_PASS
EOF
    
    chmod 600 "$CONFIG_DIR/database.env"
}

# Setup Python environment
setup_python_env() {
    log_info "Setting up Python environment..."
    
    # Create virtual environment
    python3 -m venv "$INSTALL_DIR/venv"
    
    # Activate and install packages
    source "$INSTALL_DIR/venv/bin/activate"
    
    pip install --upgrade pip
    pip install fastapi uvicorn[standard] asyncpg sqlalchemy alembic \
                pydantic python-jose[cryptography] passlib[bcrypt] \
                python-multipart aiofiles prometheus-client \
                celery redis python-v2ray-api
}

# Create application structure
create_app_structure() {
    log_info "Creating application structure..."
    
    # Create directories
    mkdir -p "$INSTALL_DIR"/{api,config,scripts,web}
    mkdir -p "$DATA_DIR"/{backups,exports}
    mkdir -p "$LOG_DIR"/{api,v2ray,nginx}
    mkdir -p "$CONFIG_DIR"/{certs,configs}
    
    # Create main application file
    cat > "$INSTALL_DIR/api/main.py" <<'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import auth, users, servers, config, stats
from core.database import engine, Base
from core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="V2Ray VPN Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(servers.router, prefix="/api/v1/servers", tags=["servers"])
app.include_router(config.router, prefix="/api/v1/config", tags=["config"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
}

# Setup systemd services
setup_systemd() {
    log_info "Setting up systemd services..."
    
    # V2Ray VPN API service
    cat > "$SYSTEMD_DIR/v2ray-vpn-api.service" <<EOF
[Unit]
Description=V2Ray VPN API Service
After=network.target postgresql.service

[Service]
Type=exec
User=v2ray-vpn
Group=v2ray-vpn
WorkingDirectory=$INSTALL_DIR
Environment="PATH=$INSTALL_DIR/venv/bin"
EnvironmentFile=$CONFIG_DIR/database.env
ExecStart=$INSTALL_DIR/venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # V2Ray config reloader service
    cat > "$SYSTEMD_DIR/v2ray-vpn-reloader.service" <<EOF
[Unit]
Description=V2Ray Configuration Reloader
After=v2ray.service v2ray-vpn-api.service

[Service]
Type=simple
User=v2ray-vpn
Group=v2ray-vpn
WorkingDirectory=$INSTALL_DIR
Environment="PATH=$INSTALL_DIR/venv/bin"
EnvironmentFile=$CONFIG_DIR/database.env
ExecStart=$INSTALL_DIR/venv/bin/python -m services.config_reloader
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    # Health checker service
    cat > "$SYSTEMD_DIR/v2ray-vpn-health.service" <<EOF
[Unit]
Description=V2Ray Server Health Checker
After=v2ray-vpn-api.service

[Service]
Type=simple
User=v2ray-vpn
Group=v2ray-vpn
WorkingDirectory=$INSTALL_DIR
Environment="PATH=$INSTALL_DIR/venv/bin"
EnvironmentFile=$CONFIG_DIR/database.env
ExecStart=$INSTALL_DIR/venv/bin/python -m services.health_checker
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    # Create service user
    useradd -r -s /bin/false -d /nonexistent -c "V2Ray VPN Service" v2ray-vpn || true
    
    # Set permissions
    chown -R v2ray-vpn:v2ray-vpn "$INSTALL_DIR" "$DATA_DIR" "$CONFIG_DIR"
    
    # Reload systemd
    systemctl daemon-reload
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (adjust port as needed)
    ufw allow 22/tcp
    
    # Allow V2Ray ports
    ufw allow 443/tcp    # VMess WebSocket + TLS
    ufw allow 80/tcp     # HTTP for Certbot
    ufw allow 8000/tcp   # API (should be behind nginx)
    
    # Allow additional protocols ports
    ufw allow 1080/tcp   # SOCKS
    ufw allow 8118/tcp   # HTTP Proxy
    ufw allow 8388/tcp   # Shadowsocks
    ufw allow 8388/udp   # Shadowsocks UDP
    
    ufw reload
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/v2ray-vpn <<'EOF'
server {
    listen 80;
    server_name your.domain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your.domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
    
    # API backend
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # V2Ray WebSocket
    location /ray {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Web interface
    location / {
        root /opt/v2ray-vpn/web/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/v2ray-vpn /etc/nginx/sites-enabled/
    
    # Test and reload
    nginx -t
    systemctl reload nginx
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Install Prometheus node exporter
    wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
    tar xvf node_exporter-1.5.0.linux-amd64.tar.gz
    cp node_exporter-1.5.0.linux-amd64/node_exporter /usr/local/bin/
    
    # Create node exporter service
    cat > "$SYSTEMD_DIR/node_exporter.service" <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF
    
    # Create monitoring user
    useradd -r -s /bin/false node_exporter || true
    
    # Start services
    systemctl daemon-reload
    systemctl enable node_exporter
    systemctl start node_exporter
}

# Initialize application
initialize_app() {
    log_info "Initializing application..."
    
    source "$INSTALL_DIR/venv/bin/activate"
    cd "$INSTALL_DIR"
    
    # Run database migrations
    alembic upgrade head
    
    # Create admin user
    python -c "
from api.core.security import get_password_hash
from api.models import User
from api.database import SessionLocal

db = SessionLocal()
admin = User(
    email='admin@example.com',
    username='admin',
    password_hash=get_password_hash('changeme'),
    is_admin=True
)
db.add(admin)
db.commit()
print('Admin user created. Please change the password!')
"
    
    # Generate initial V2Ray config
    python -m scripts.generate_initial_config
}

# Start services
start_services() {
    log_info "Starting services..."
    
    systemctl enable v2ray
    systemctl start v2ray
    
    systemctl enable v2ray-vpn-api
    systemctl start v2ray-vpn-api
    
    systemctl enable v2ray-vpn-reloader
    systemctl start v2ray-vpn-reloader
    
    systemctl enable v2ray-vpn-health
    systemctl start v2ray-vpn-health
}

# Main installation flow
main() {
    log_info "Starting V2Ray VPN Service installation..."
    
    check_root
    detect_os
    install_dependencies
    install_v2ray
    setup_database
    setup_python_env
    create_app_structure
    setup_systemd
    configure_firewall
    configure_nginx
    setup_monitoring
    initialize_app
    start_services
    
    log_info "Installation completed successfully!"
    log_info "Admin panel: https://your.domain.com"
    log_info "Default admin credentials: admin / changeme"
    log_warn "Please change the admin password immediately!"
}

# Run main function
main
```

**6.2 Configuration Update Script**
```bash
#!/bin/bash
# update_config.sh - Update V2Ray configuration

source /etc/v2ray-vpn/database.env

python3 <<EOF
import json
import psycopg2
from datetime import datetime

# Connect to database
conn = psycopg2.connect(
    host="$DB_HOST",
    port="$DB_PORT",
    database="$DB_NAME",
    user="$DB_USER",
    password="$DB_PASS"
)

# Generate new configuration
# ... (configuration generation logic)

# Apply configuration
with open('/etc/v2ray/config.json', 'w') as f:
    json.dump(config, f, indent=2)

# Reload V2Ray
import subprocess
subprocess.run(['systemctl', 'reload', 'v2ray'])

print(f"Configuration updated at {datetime.now()}")
EOF
```

### 7. Monitoring and Logging

**7.1 Log Aggregation Configuration**
```python
# logging_config.py
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'detailed': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'json': {
            'class': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'detailed',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'INFO',
            'formatter': 'json',
            'filename': '/var/log/v2ray-vpn/api/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'level': 'ERROR',
            'formatter': 'json',
            'filename': '/var/log/v2ray-vpn/api/error.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5
        }
    },
    'loggers': {
        'api': {
            'level': 'INFO',
            'handlers': ['console', 'file', 'error_file']
        },
        'v2ray': {
            'level': 'INFO',
            'handlers': ['file']
        }
    }
}
```

**7.2 Metrics Collection**
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Define metrics
user_connections = Gauge('v2ray_user_connections', 'Active user connections', ['user_id', 'protocol'])
traffic_bytes = Counter('v2ray_traffic_bytes', 'Traffic in bytes', ['direction', 'user_id'])
connection_duration = Histogram('v2ray_connection_duration_seconds', 'Connection duration')
server_health = Gauge('v2ray_server_health', 'Server health score', ['server_id'])

class MetricsCollector:
    def __init__(self, v2ray_api, db):
        self.v2ray_api = v2ray_api
        self.db = db
    
    async def collect_metrics(self):
        # Collect from V2Ray stats API
        stats = await self.v2ray_api.get_stats()
        
        for stat in stats:
            if 'user' in stat['name'] and 'traffic' in stat['name']:
                user_id = self.extract_user_id(stat['name'])
                direction = 'upload' if 'uplink' in stat['name'] else 'download'
                traffic_bytes.labels(direction=direction, user_id=user_id).inc(stat['value'])
        
        # Update active connections
        connections = await self.db.get_active_connections()
        for conn in connections:
            user_connections.labels(
                user_id=conn['user_id'],
                protocol=conn['protocol']
            ).set(conn['count'])
        
        # Update server health
        servers = await self.db.get_servers()
        for server in servers:
            server_health.labels(server_id=server['id']).set(server['health_score'])

# Expose metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 8. Backup and Recovery

**8.1 Automated Backup Script**
```bash
#!/bin/bash
# backup.sh - Automated backup script

BACKUP_DIR="/var/lib/v2ray-vpn/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="v2ray_vpn_backup_${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

# Backup database
source /etc/v2ray-vpn/database.env
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > "${BACKUP_DIR}/${BACKUP_NAME}/database.sql.gz"

# Backup configurations
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/configs.tar.gz" /etc/v2ray /etc/v2ray-vpn

# Backup certificates
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/certs.tar.gz" /etc/letsencrypt

# Create backup manifest
cat > "${BACKUP_DIR}/${BACKUP_NAME}/manifest.json" <<EOF
{
    "timestamp": "${TIMESTAMP}",
    "version": "$(v2ray --version | head -1)",
    "files": [
        "database.sql.gz",
        "configs.tar.gz",
        "certs.tar.gz"
    ]
}
EOF

# Compress final backup
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"
rm -rf "${BACKUP_NAME}/"

# Cleanup old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_NAME}.tar.gz"
```

**8.2 Recovery Script**
```bash
#!/bin/bash
# restore.sh - Restore from backup

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/v2ray_restore_$$"

# Extract backup
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Find backup directory
BACKUP_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d -name "v2ray_vpn_backup_*" | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo "Invalid backup file"
    exit 1
fi

# Stop services
systemctl stop v2ray-vpn-api v2ray-vpn-reloader v2ray-vpn-health v2ray

# Restore database
source /etc/v2ray-vpn/database.env
gunzip -c "${BACKUP_DIR}/database.sql.gz" | PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER $DB_NAME

# Restore configurations
tar -xzf "${BACKUP_DIR}/configs.tar.gz" -C /

# Restore certificates
tar -xzf "${BACKUP_DIR}/certs.tar.gz" -C /

# Start services
systemctl start v2ray v2ray-vpn-api v2ray-vpn-reloader v2ray-vpn-health

# Cleanup
rm -rf "$RESTORE_DIR"

echo "Restore completed successfully"
```

### 9. Security Hardening

**9.1 Security Configuration Script**
```bash
#!/bin/bash
# security_hardening.sh

# Kernel parameters for security
cat >> /etc/sysctl.conf <<EOF
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Ignore ICMP ping requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Enable TCP syncookies
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Increase system file descriptor limit
fs.file-max = 65535
EOF

sysctl -p

# Configure fail2ban
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[v2ray-api]
enabled = true
port = 8000
filter = v2ray-api
logpath = /var/log/v2ray-vpn/api/app.log
maxretry = 10

[v2ray-auth]
enabled = true
port = 443,1080,8388
filter = v2ray-auth
logpath = /var/log/v2ray/access.log
maxretry = 5
EOF

# Create fail2ban filters
cat > /etc/fail2ban/filter.d/v2ray-api.conf <<EOF
[Definition]
failregex = .*Failed login attempt from <HOST>.*
            .*Unauthorized access from <HOST>.*
ignoreregex =
EOF

cat > /etc/fail2ban/filter.d/v2ray-auth.conf <<EOF
[Definition]
failregex = .*rejected.*from <HOST>:[0-9]+.*
ignoreregex =
EOF

systemctl restart fail2ban
```

### 10. Web Interface Structure

**10.1 Frontend Application Structure**
```typescript
// Frontend structure for management UI
interface AppStructure {
  components: {
    auth: ['LoginForm', 'RegisterForm', 'ResetPassword'],
    dashboard: ['Overview', 'QuickStats', 'RecentActivity'],
    users: ['UserList', 'UserDetail', 'UserForm', 'CredentialsDisplay'],
    servers: ['ServerList', 'ServerDetail', 'ServerForm', 'HealthStatus'],
    config: ['ConfigEditor', 'ConfigValidator', 'ConfigHistory'],
    monitoring: ['TrafficChart', 'ConnectionsMap', 'ServerStatus'],
    settings: ['GeneralSettings', 'SecuritySettings', 'NotificationSettings']
  },
  services: {
    api: 'ApiService',
    auth: 'AuthService',
    websocket: 'WebSocketService',
    notification: 'NotificationService'
  },
  state: {
    auth: 'AuthStore',
    users: 'UserStore',
    servers: 'ServerStore',
    stats: 'StatsStore'
  }
}
```

## Deployment Checklist

- [ ] Server Requirements
  - [ ] Ubuntu 20.04+ or CentOS 8+
  - [ ] Minimum 2GB RAM
  - [ ] 20GB disk space
  - [ ] Public IP address
  - [ ] Domain name configured

- [ ] Pre-installation
  - [ ] Update system packages
  - [ ] Configure hostname
  - [ ] Setup SSH keys
  - [ ] Disable root login

- [ ] Installation
  - [ ] Run installation script
  - [ ] Configure domain in Nginx
  - [ ] Obtain SSL certificate
  - [ ] Change default passwords

- [ ] Post-installation
  - [ ] Test all services
  - [ ] Configure monitoring alerts
  - [ ] Setup backup schedule
  - [ ] Document configuration

- [ ] Security
  - [ ] Enable firewall rules
  - [ ] Configure fail2ban
  - [ ] Setup log rotation
  - [ ] Enable automatic updates

## Maintenance Commands

```bash
# Service management
systemctl status v2ray-vpn-api
systemctl restart v2ray
journalctl -u v2ray-vpn-api -f

# User management
v2ray-vpn user create --email user@example.com --tier 1
v2ray-vpn user list
v2ray-vpn user reset-password user@example.com

# Server management
v2ray-vpn server add --name "US-1" --address 1.2.3.4 --port 443
v2ray-vpn server health-check
v2ray-vpn server disable US-1

# Backup operations
v2ray-vpn backup create
v2ray-vpn backup list
v2ray-vpn backup restore backup_20240122_120000.tar.gz

# Configuration
v2ray-vpn config validate
v2ray-vpn config reload
v2ray-vpn config export

# Monitoring
v2ray-vpn stats traffic --period day
v2ray-vpn stats connections
v2ray-vpn logs tail -f
```

This complete technical specification provides everything needed to build a production-ready V2Ray VPN service with comprehensive management capabilities.