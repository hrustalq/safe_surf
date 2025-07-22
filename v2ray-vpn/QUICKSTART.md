# V2Ray VPN Service - Quick Start Guide

Get your V2Ray VPN service running in 5 minutes!

## Prerequisites Checklist

- [ ] Ubuntu 20.04+ or Debian 11+ server
- [ ] Root access to the server
- [ ] Domain name pointing to your server IP (optional but recommended)
- [ ] Minimum 2GB RAM and 20GB disk space

## Step-by-Step Installation

### 1. Download and Prepare

```bash
# Connect to your server
ssh root@your-server-ip

# Download the V2Ray VPN service
git clone <repository-url>
cd v2ray-vpn

# Make installation script executable
chmod +x install.sh
```

### 2. Run Installation

```bash
# Start installation (will prompt for domain name)
./install.sh
```

When prompted, enter your domain name (e.g., `vpn.example.com`) or press Enter to skip.

### 3. Wait for Completion

The installation will take 5-10 minutes and will:
- ✅ Install all dependencies
- ✅ Configure PostgreSQL database  
- ✅ Setup V2Ray service
- ✅ Configure Nginx and SSL
- ✅ Setup firewall rules
- ✅ Start all services

## Post-Installation Setup

### 1. Verify Installation

```bash
# Check all services are running
v2ray-vpn status

# Test API endpoint
curl https://your-domain.com/health
# Should return: {"status":"healthy",...}
```

### 2. Access API Documentation

Open in browser: `https://your-domain.com/docs`

### 3. Create Your First User

```bash
# Using curl (replace with your domain)
curl -X POST "https://your-domain.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "myuser",
    "password": "securepassword123",
    "tier": 1
  }'
```

This returns:
- Access token for API
- User credentials for all protocols
- Connection strings ready to use

### 4. Add VPN Servers

```bash
# Login first to get access token
LOGIN_RESPONSE=$(curl -X POST "https://your-domain.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "changeme"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

# Add a VMess server
curl -X POST "https://your-domain.com/api/v1/servers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "US-Server-1",
    "address": "your-server-ip",
    "port": 443,
    "protocol": "vmess",
    "config": {
      "id": "generated-uuid-here",
      "security": "auto"
    },
    "location": "United States"
  }'
```

## Quick Configuration Examples

### VMess Configuration
```json
{
  "name": "VMess-Server",
  "address": "1.2.3.4",
  "port": 443,
  "protocol": "vmess",
  "config": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "security": "auto"
  }
}
```

### VLESS Configuration  
```json
{
  "name": "VLESS-Server", 
  "address": "1.2.3.4",
  "port": 8443,
  "protocol": "vless",
  "config": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "encryption": "none"
  }
}
```

### Shadowsocks Configuration
```json
{
  "name": "SS-Server",
  "address": "1.2.3.4", 
  "port": 8388,
  "protocol": "shadowsocks",
  "config": {
    "password": "your-secure-password",
    "cipher": "chacha20-ietf-poly1305"
  }
}
```

## Essential Management Commands

```bash
# Check system status
v2ray-vpn status

# View real-time logs
v2ray-vpn logs

# Restart services
v2ray-vpn restart

# Apply new V2Ray configuration
v2ray-vpn config-reload

# Create backup
v2ray-vpn backup
```

## Testing Your Setup

### 1. Check API Health
```bash
curl https://your-domain.com/health
```

### 2. Test Authentication
```bash
curl -X POST "https://your-domain.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "changeme"}'
```

### 3. Verify V2Ray is Running
```bash
systemctl status v2ray
```

### 4. Check Server Health
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://your-domain.com/api/v1/servers"
```

## Client Setup Examples

### V2Ray Client (VMess)
```json
{
  "v": "2",
  "ps": "My VPN Server",
  "add": "your-domain.com",
  "port": "443",
  "id": "user-uuid-here",
  "aid": "0",
  "net": "ws",
  "path": "/ray",
  "type": "none",
  "host": "",
  "tls": "tls"
}
```

### Shadowsocks Client
```
ss://chacha20-ietf-poly1305:password@your-domain.com:8388#MyVPN
```

## Common Issues & Solutions

### ❌ Services not starting
```bash
# Check logs for errors
journalctl -u v2ray-vpn-api -f

# Verify database connection
psql -U v2ray_vpn -d v2ray_vpn -h localhost
```

### ❌ SSL certificate failed
```bash
# Manual certificate request
certbot --nginx -d your-domain.com

# Check DNS is pointing to your server
nslookup your-domain.com
```

### ❌ API returning 500 errors
```bash
# Check database is running
systemctl status postgresql

# Verify environment variables
cat /etc/v2ray-vpn/.env
```

### ❌ Can't connect to VPN
```bash
# Check V2Ray configuration
v2ray-vpn config-reload

# Verify ports are open
ufw status
```

## Security Checklist

- [ ] Changed default admin password
- [ ] SSL certificate installed and working
- [ ] Firewall is active with minimal ports
- [ ] fail2ban is monitoring failed logins
- [ ] Regular backups scheduled
- [ ] Database credentials are secure
- [ ] API access is over HTTPS only

## Next Steps

1. **Change Admin Password**: Use API to update admin user
2. **Add More Servers**: Scale with additional server locations  
3. **Configure Monitoring**: Set up alerts for server health
4. **User Management**: Create users with appropriate tiers
5. **Backup Strategy**: Schedule regular automated backups

## Getting Help

- **Logs**: `/var/log/v2ray-vpn/` and `journalctl -u v2ray-vpn-api`
- **Configuration**: `/etc/v2ray-vpn/.env`
- **API Docs**: `https://your-domain.com/docs`
- **Status Check**: `v2ray-vpn status`

---

🎉 **Congratulations!** Your V2Ray VPN service is now running and ready to use! 