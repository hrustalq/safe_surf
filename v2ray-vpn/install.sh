#!/bin/bash
# V2Ray VPN Service - Complete Installation Script
# Based on technical requirements document

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
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check root privileges
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
    fi
}

# Check required files exist
check_files() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    log_info "Checking required files..."
    
    if [[ ! -d "$script_dir/app" ]]; then
        log_error "Application directory 'app' not found in $script_dir"
    fi
    
    if [[ ! -f "$script_dir/requirements.txt" ]]; then
        log_error "Requirements file 'requirements.txt' not found in $script_dir"
    fi
    
    if [[ ! -f "$script_dir/database/schema.sql" ]]; then
        log_error "Database schema file 'database/schema.sql' not found in $script_dir"
    fi
    
    log_info "All required files found"
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
            PYTHON_PKG="python3-venv python3-dev"
            ;;
        centos|rhel|fedora)
            PKG_MANAGER="yum"
            PKG_UPDATE="yum check-update"
            PYTHON_PKG="python3-devel"
            ;;
        *)
            log_error "Unsupported OS: $OS"
            ;;
    esac
    
    log_info "Detected OS: $OS $VER"
}

# Install system dependencies
install_dependencies() {
    log_step "Installing system dependencies..."
    
    $PKG_UPDATE || true
    
    # Common packages
    PACKAGES="curl wget git python3 python3-pip $PYTHON_PKG postgresql postgresql-contrib nginx certbot python3-certbot-nginx ufw fail2ban supervisor redis-server"
    
    $PKG_MANAGER install -y $PACKAGES
    
    log_info "System dependencies installed successfully"
}

# Install V2Ray
install_v2ray() {
    log_step "Installing V2Ray..."
    
    # Download and install V2Ray
    wget -O v2ray-install.sh https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh
    bash v2ray-install.sh
    
    # Create V2Ray directories
    mkdir -p /etc/v2ray
    mkdir -p /var/log/v2ray
    
    # Set permissions
    chown -R nobody:nogroup /var/log/v2ray
    
    log_info "V2Ray installed successfully"
}

# Setup PostgreSQL
setup_database() {
    log_step "Setting up PostgreSQL database..."
    
    # Start PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Generate secure password
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Create database and user
    sudo -u postgres psql <<EOF
CREATE USER v2ray_vpn WITH PASSWORD '$DB_PASS';
CREATE DATABASE v2ray_vpn OWNER v2ray_vpn;
GRANT ALL PRIVILEGES ON DATABASE v2ray_vpn TO v2ray_vpn;
EOF
    
    # Save database credentials
    mkdir -p "$CONFIG_DIR"
    cat > "$CONFIG_DIR/database.env" <<EOF
DATABASE_URL=postgresql://v2ray_vpn:$DB_PASS@localhost/v2ray_vpn
DB_HOST=localhost
DB_PORT=5432
DB_NAME=v2ray_vpn
DB_USER=v2ray_vpn
DB_PASS=$DB_PASS
EOF
    
    chmod 600 "$CONFIG_DIR/database.env"
    
    # Initialize database with schema
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PGPASSWORD=$DB_PASS psql -h localhost -U v2ray_vpn -d v2ray_vpn -f "$SCRIPT_DIR/database/schema.sql"
    
    log_info "PostgreSQL database configured successfully"
}

# Setup Python environment
setup_python_env() {
    log_step "Setting up Python environment..."
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Create directories
    mkdir -p "$INSTALL_DIR"
    
    # Copy application files from script directory
    cp -r "$SCRIPT_DIR/app" "$INSTALL_DIR/"
    cp "$SCRIPT_DIR/requirements.txt" "$INSTALL_DIR/"
    
    cd "$INSTALL_DIR"
    
    # Create virtual environment
    python3 -m venv venv
    
    # Activate and install packages
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    log_info "Python environment setup complete"
}

# Create application structure
create_app_structure() {
    log_step "Creating application structure..."
    
    # Create directories
    mkdir -p "$DATA_DIR"/{backups,exports}
    mkdir -p "$LOG_DIR"/{api,v2ray,nginx}
    mkdir -p "$CONFIG_DIR"/{certs,configs}
    
    # Create environment file
    cat > "$CONFIG_DIR/.env" <<EOF
# V2Ray VPN Service Configuration

# Database
DATABASE_URL=postgresql://v2ray_vpn:$DB_PASS@localhost/v2ray_vpn

# API Settings
API_TITLE=V2Ray VPN Service API
API_VERSION=1.0.0
DEBUG=false

# Security
SECRET_KEY=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# V2Ray Settings
V2RAY_CONFIG_PATH=/etc/v2ray/config.json
V2RAY_API_PORT=10085
V2RAY_SERVICE_NAME=v2ray

# Monitoring
HEALTH_CHECK_INTERVAL=300
STATS_COLLECTION_INTERVAL=60

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
ALLOWED_ORIGINS=["*"]
EOF
    
    chmod 600 "$CONFIG_DIR/.env"
    
    log_info "Application structure created"
}

# Setup systemd services
setup_systemd() {
    log_step "Setting up systemd services..."
    
    # Create service user
    useradd -r -s /bin/false -d /nonexistent -c "V2Ray VPN Service" v2ray-vpn || true
    
    # V2Ray VPN API service
    cat > "$SYSTEMD_DIR/v2ray-vpn-api.service" <<EOF
[Unit]
Description=V2Ray VPN API Service
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=v2ray-vpn
Group=v2ray-vpn
WorkingDirectory=$INSTALL_DIR
Environment="PATH=$INSTALL_DIR/venv/bin"
EnvironmentFile=$CONFIG_DIR/.env
ExecStart=$INSTALL_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # V2Ray health checker service
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
EnvironmentFile=$CONFIG_DIR/.env
ExecStart=$INSTALL_DIR/venv/bin/python -c "import asyncio; from app.services.health_checker import run_health_checker; asyncio.run(run_health_checker())"
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    
    # Set permissions
    chown -R v2ray-vpn:v2ray-vpn "$INSTALL_DIR" "$DATA_DIR" "$LOG_DIR"
    chown -R v2ray-vpn:v2ray-vpn "$CONFIG_DIR"
    
    # Reload systemd
    systemctl daemon-reload
    
    log_info "Systemd services configured"
}

# Configure firewall
configure_firewall() {
    log_step "Configuring firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (adjust port as needed)
    ufw allow 22/tcp
    
    # Allow V2Ray ports
    ufw allow 443/tcp    # VMess WebSocket + TLS
    ufw allow 8443/tcp   # VLESS gRPC
    ufw allow 80/tcp     # HTTP for Certbot
    ufw allow 8000/tcp   # API (should be behind nginx)
    
    # Allow additional protocols ports
    ufw allow 1080/tcp   # SOCKS
    ufw allow 8118/tcp   # HTTP Proxy
    ufw allow 8388/tcp   # Shadowsocks
    ufw allow 8388/udp   # Shadowsocks UDP
    
    ufw reload
    
    log_info "Firewall configured successfully"
}

# Configure Nginx
configure_nginx() {
    log_step "Configuring Nginx..."
    
    # Get domain name from user
    read -p "Enter your domain name (e.g., vpn.example.com): " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        log_warn "No domain provided, using default configuration"
        DOMAIN="vpn.example.com"
    fi
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/v2ray-vpn <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # API backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # V2Ray WebSocket
    location /ray {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:443;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    # API documentation
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_set_header Host \$host;
    }
    
    # Default response
    location / {
        return 200 'V2Ray VPN Service is running';
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/v2ray-vpn /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Start nginx
    systemctl enable nginx
    systemctl start nginx
    
    log_info "Nginx configured for domain: $DOMAIN"
}

# Setup SSL certificate
setup_ssl() {
    log_step "Setting up SSL certificate..."
    
    if [[ "$DOMAIN" == "vpn.example.com" ]]; then
        log_warn "Skipping SSL setup - using default domain"
        return
    fi
    
    # Get SSL certificate
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" || {
        log_warn "Failed to obtain SSL certificate. You may need to configure DNS first."
    }
}

# Setup monitoring
setup_monitoring() {
    log_step "Setting up monitoring..."
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[v2ray-api]
enabled = true
port = 8000
filter = v2ray-api
logpath = $LOG_DIR/api/access.log
maxretry = 10
EOF

    # Create fail2ban filter
    cat > /etc/fail2ban/filter.d/v2ray-api.conf <<EOF
[Definition]
failregex = .*Failed login attempt from <HOST>.*
            .*Unauthorized access from <HOST>.*
ignoreregex =
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log_info "Monitoring configured"
}

# Initialize application
initialize_app() {
    log_step "Initializing application..."
    
    cd "$INSTALL_DIR"
    source venv/bin/activate
    
    # Set environment
    export $(cat "$CONFIG_DIR/.env" | xargs)
    
    # Create initial V2Ray config
    python3 -c "
import asyncio
from app.core.database import create_tables
asyncio.run(create_tables())
print('Database tables created successfully')
"
    
    log_info "Application initialized successfully"
}

# Start services
start_services() {
    log_step "Starting services..."
    
    # Start Redis
    systemctl enable redis-server
    systemctl start redis-server
    
    # Start V2Ray
    systemctl enable v2ray
    systemctl start v2ray
    
    # Start application services
    systemctl enable v2ray-vpn-api
    systemctl start v2ray-vpn-api
    
    systemctl enable v2ray-vpn-health
    systemctl start v2ray-vpn-health
    
    # Reload nginx with new configuration
    systemctl reload nginx
    
    log_info "All services started successfully"
}

# Create management script
create_management_script() {
    log_step "Creating management script..."
    
    cat > /usr/local/bin/v2ray-vpn <<'EOF'
#!/bin/bash
# V2Ray VPN Service Management Script

INSTALL_DIR="/opt/v2ray-vpn"
CONFIG_DIR="/etc/v2ray-vpn"

case "$1" in
    status)
        echo "=== V2Ray VPN Service Status ==="
        systemctl status v2ray-vpn-api --no-pager -l
        systemctl status v2ray --no-pager -l
        ;;
    logs)
        echo "=== API Logs ==="
        journalctl -u v2ray-vpn-api -f
        ;;
    restart)
        echo "Restarting V2Ray VPN services..."
        systemctl restart v2ray-vpn-api
        systemctl restart v2ray
        echo "Services restarted"
        ;;
    config-reload)
        echo "Reloading V2Ray configuration..."
        cd "$INSTALL_DIR"
        source venv/bin/activate
        export $(cat "$CONFIG_DIR/.env" | xargs)
        python3 -c "
from app.core.database import SessionLocal
from app.v2ray.config_manager import V2RayConfigManager
db = SessionLocal()
config_manager = V2RayConfigManager(db)
success = config_manager.apply_config()
print('Config applied successfully' if success else 'Config application failed')
db.close()
"
        ;;
    backup)
        echo "Creating backup..."
        BACKUP_DIR="/var/lib/v2ray-vpn/backups"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mkdir -p "$BACKUP_DIR"
        
        # Backup database
        source "$CONFIG_DIR/.env"
        pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/database_$TIMESTAMP.sql.gz"
        
        # Backup configs
        tar -czf "$BACKUP_DIR/configs_$TIMESTAMP.tar.gz" /etc/v2ray /etc/v2ray-vpn
        
        echo "Backup created: $TIMESTAMP"
        ;;
    *)
        echo "Usage: $0 {status|logs|restart|config-reload|backup}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /usr/local/bin/v2ray-vpn
    
    log_info "Management script created: v2ray-vpn"
}

# Main installation flow
main() {
    echo "========================================"
    echo "V2Ray VPN Service Installation"
    echo "========================================"
    
    check_root
    check_files
    detect_os
    install_dependencies
    install_v2ray
    setup_database
    setup_python_env
    create_app_structure
    setup_systemd
    configure_firewall
    configure_nginx
    setup_ssl
    setup_monitoring
    initialize_app
    start_services
    create_management_script
    
    echo "========================================"
    log_info "Installation completed successfully!"
    echo "========================================"
    
    echo ""
    log_info "Service Information:"
    echo "  • API URL: https://$DOMAIN/api/v1/"
    echo "  • API Documentation: https://$DOMAIN/docs"
    echo "  • Health Check: https://$DOMAIN/health"
    echo ""
    
    log_info "Management Commands:"
    echo "  • Check status: v2ray-vpn status"
    echo "  • View logs: v2ray-vpn logs"
    echo "  • Restart services: v2ray-vpn restart"
    echo "  • Reload config: v2ray-vpn config-reload"
    echo "  • Create backup: v2ray-vpn backup"
    echo ""
    
    log_warn "Next Steps:"
    echo "  1. Change default admin password via API"
    echo "  2. Add your first VPN servers via API"
    echo "  3. Configure V2Ray certificates if needed"
    echo "  4. Test VPN connectivity"
    echo ""
    
    log_info "Database credentials saved in: $CONFIG_DIR/.env"
}

# Run main function
main "$@" 