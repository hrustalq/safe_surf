# V2Ray VPN Service - Production Implementation

A complete, production-ready V2Ray VPN service with comprehensive management capabilities, user authentication, multi-server support, and automated deployment.

## Features

### Core Functionality
- **Multi-Protocol Support**: VMess, VLESS, Shadowsocks, SOCKS5, HTTP Proxy
- **Dynamic Configuration**: Hot-reload V2Ray configs without service restart
- **User Management**: Complete user lifecycle with automatic credential generation
- **Server Management**: Multi-server support with health monitoring and load balancing
- **Traffic Management**: Quota management, usage tracking, and statistics
- **Real-time Monitoring**: Server health checks, connection monitoring, system events

### Security & Administration
- **JWT Authentication**: Secure API access with role-based permissions
- **Automated Deployment**: One-command installation with all dependencies
- **Backup & Recovery**: Automated backup system for configs and database
- **Security Hardening**: Firewall rules, fail2ban integration, SSL/TLS
- **Monitoring & Alerting**: Prometheus metrics, system events, health checks

### API & Integration
- **RESTful API**: Complete FastAPI-based management interface
- **Interactive Documentation**: Auto-generated API docs with Swagger/OpenAPI
- **Database Support**: PostgreSQL with proper indexing and relationships
- **Scalable Architecture**: Microservices-ready with proper separation of concerns

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Management API                       │
│              (Authentication, CRUD, Monitoring)                 │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
┌─────────────────▼─────────────┐ ┌───────────▼───────────────────┐
│  Configuration Manager        │ │    User Service               │
│  (Dynamic V2Ray configs)      │ │  (Credentials, Quotas)        │
└─────────────────┬─────────────┘ └───────────┬───────────────────┘
                  │                           │
┌─────────────────▼───────────────────────────▼───────────────────┐
│                        V2Ray Core                                │
│     (VMess, VLESS, Shadowsocks, SOCKS, HTTP protocols)         │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
┌─────────────────▼─────────────┐ ┌───────────▼───────────────────┐
│   Health Monitoring           │ │    PostgreSQL Database        │
│  (Server checks, metrics)     │ │  (Users, configs, stats)      │
└───────────────────────────────┘ └───────────────────────────────┘
```

## Installation

### Prerequisites

- **Operating System**: Ubuntu 20.04+, Debian 11+, or CentOS 8+
- **Hardware**: Minimum 2GB RAM, 20GB disk space
- **Network**: Public IP address and domain name (recommended)
- **Access**: Root privileges for installation

### One-Command Installation

```bash
# Clone the repository
git clone <repository-url>
cd v2ray-vpn

# Run installation (requires root)
sudo ./install.sh
```

The installation script will:
1. Install system dependencies (Python, PostgreSQL, Nginx, V2Ray)
2. Set up database with secure credentials
3. Configure Python virtual environment
4. Create systemd services
5. Configure firewall and security
6. Set up SSL certificates (if domain provided)
7. Initialize the application

## Configuration

### Environment Variables

The service is configured via `/etc/v2ray-vpn/.env`:

```bash
# Database
DATABASE_URL=postgresql://v2ray_vpn:password@localhost/v2ray_vpn

# API Settings
API_TITLE=V2Ray VPN Service API
API_VERSION=1.0.0
DEBUG=false

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# V2Ray Settings
V2RAY_CONFIG_PATH=/etc/v2ray/config.json
V2RAY_API_PORT=10085
V2RAY_SERVICE_NAME=v2ray
```

### Database Schema

The service uses PostgreSQL with comprehensive schema:

- **Users**: Authentication, tiers, quotas
- **User Auth**: Protocol-specific credentials (VMess UUIDs, passwords)
- **Servers**: Outbound server configurations
- **Traffic**: Usage tracking and quota management
- **Health Checks**: Server monitoring history
- **System Events**: Audit log and error tracking

## API Documentation

### Authentication

```bash
# Register new user
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "securepassword",
  "tier": 0
}

# Login
POST /api/v1/auth/login
{
  "username": "testuser",
  "password": "securepassword"
}
```

### User Management

```bash
# Get user credentials
GET /api/v1/users/{user_id}/credentials

# Regenerate credentials
POST /api/v1/users/{user_id}/credentials/regenerate

# Get traffic statistics
GET /api/v1/users/{user_id}/traffic?period=2024-01
```

### Server Management

```bash
# Add new server
POST /api/v1/servers
{
  "name": "US-East-1",
  "address": "1.2.3.4",
  "port": 443,
  "protocol": "vmess",
  "config": {
    "id": "uuid-here",
    "security": "auto"
  },
  "location": "New York, USA"
}

# Check server health
GET /api/v1/servers/{server_id}/health

# Test server connectivity
POST /api/v1/servers/{server_id}/test
```

### Configuration Management

```bash
# Generate new V2Ray config
GET /api/v1/config/generate

# Apply configuration
POST /api/v1/config/apply

# Get configuration history
GET /api/v1/config/history
```

## Management Commands

The installation creates a management CLI tool:

```bash
# Check service status
v2ray-vpn status

# View real-time logs
v2ray-vpn logs

# Restart all services
v2ray-vpn restart

# Reload V2Ray configuration
v2ray-vpn config-reload

# Create backup
v2ray-vpn backup
```

## Supported Protocols

### VMess
- **Transport**: WebSocket + TLS
- **Security**: Auto/AES-128-GCM/ChaCha20-Poly1305
- **Port**: 443 (configurable)
- **Path**: `/ray` (WebSocket path)

### VLESS
- **Transport**: gRPC + Reality
- **Encryption**: None (handled by Reality)
- **Port**: 8443 (configurable)
- **SNI**: Configurable (default: www.microsoft.com)

### Shadowsocks
- **Cipher**: ChaCha20-IETF-Poly1305
- **Port**: 8388 (configurable)
- **Multi-user**: Supported

### SOCKS5
- **Authentication**: Username/Password
- **Port**: 1080 (configurable)

### HTTP Proxy
- **Authentication**: Basic Auth
- **Port**: 8118 (configurable)

## User Tiers & Quotas

| Tier | Name | Monthly Quota | Features |
|------|------|---------------|----------|
| 0 | Free | 10 GB | Basic protocols |
| 1 | Basic | 50 GB | All protocols |
| 2 | Premium | 200 GB | Priority servers |
| 3 | VIP | Unlimited | Best performance |
| 999 | Admin | Unlimited | Full access |

## Load Balancing Strategies

- **Round Robin**: Cycle through available servers
- **Weighted Random**: Random selection based on health scores
- **Least Connections**: Select server with lowest load
- **Latency Based**: Choose server with best response time
- **Health Based**: Prefer servers with highest health scores

## Monitoring & Alerting

### Health Checks
- **Frequency**: Every 5 minutes (configurable)
- **Metrics**: Latency, connectivity, success rate
- **Scoring**: 0-100 health score based on performance
- **Actions**: Automatic server rotation, maintenance mode

### System Events
- **Levels**: Debug, Info, Warning, Error, Critical
- **Types**: Authentication, configuration, health, traffic
- **Storage**: PostgreSQL with automatic cleanup
- **Integration**: Prometheus metrics export

### Backup System
- **Automatic**: Daily database and configuration backups
- **Manual**: On-demand backup creation
- **Retention**: Configurable (default: 7 days)
- **Recovery**: One-command restoration process

## Security Features

### Network Security
- **Firewall**: UFW with restrictive rules
- **Rate Limiting**: Fail2ban integration
- **SSL/TLS**: Let's Encrypt certificates
- **Port Management**: Minimal exposure

### Application Security
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **SQL Injection**: Protected by SQLAlchemy ORM

### Data Security
- **Password Hashing**: bcrypt with salt
- **Credential Storage**: Encrypted database fields
- **API Keys**: Secure token generation
- **Audit Trail**: Complete activity logging

## Performance Optimization

### Database
- **Indexing**: Optimized queries with proper indexes
- **Connection Pool**: Efficient database connections
- **Pagination**: Large result set handling
- **Caching**: Redis integration ready

### V2Ray Integration
- **Hot Reload**: Configuration updates without restart
- **Multiplexing**: Connection reuse
- **Load Balancing**: Intelligent server selection
- **Health Monitoring**: Proactive issue detection

## Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
journalctl -u v2ray-vpn-api -f

# Verify database connection
v2ray-vpn status
```

**Configuration not applying:**
```bash
# Manually reload configuration
v2ray-vpn config-reload

# Check V2Ray logs
journalctl -u v2ray -f
```

**SSL certificate issues:**
```bash
# Renew certificate
certbot renew

# Restart nginx
systemctl restart nginx
```

### Log Locations

- **API Logs**: `/var/log/v2ray-vpn/api/`
- **V2Ray Logs**: `/var/log/v2ray/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `journalctl -u v2ray-vpn-api`

## Development

### Local Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost/v2ray_vpn

# Run development server
uvicorn app.main:app --reload --port 8000
```

### Testing

```bash
# Run API tests
python -m pytest tests/

# Manual API testing
curl -X GET http://localhost:8000/health

# Database testing
python -c "from app.core.database import check_connection; print(check_connection())"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- **Documentation**: Check this README and API docs
- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

## Changelog

### v1.0.0 (Initial Release)
- Complete V2Ray VPN service implementation
- Multi-protocol support (VMess, VLESS, Shadowsocks, SOCKS, HTTP)
- Dynamic configuration management
- User management with automatic credential generation
- Server health monitoring and load balancing
- Traffic quota management
- RESTful API with authentication
- Automated installation and deployment
- Security hardening and monitoring
- Backup and recovery system 