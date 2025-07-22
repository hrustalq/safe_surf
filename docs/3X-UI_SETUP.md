# 3x-UI Panel Setup Guide

This guide explains how to configure the 3x-UI panel integration for SafeSurf VPN.

## Overview

SafeSurf integrates with 3x-UI panels to automatically manage VPN clients, configurations, and traffic monitoring. This integration is **required** for full functionality.

## Prerequisites

1. A VPS/server with 3x-UI panel installed
2. Admin access to the 3x-UI web interface  
3. Network connectivity between your SafeSurf application and the 3x-UI panel

## Environment Variables

Add these variables to your `.env` file:

```bash
# 3x-UI Panel Configuration
THREEXUI_BASE_URL="https://your-server.com:2053"
THREEXUI_USERNAME="admin"
THREEXUI_PASSWORD="your-admin-password"
THREEXUI_SECRET_KEY=""  # Optional: for request signing
```

### Variable Details

- **THREEXUI_BASE_URL**: Full URL to your 3x-UI panel including protocol and port
- **THREEXUI_USERNAME**: Admin username for the 3x-UI panel
- **THREEXUI_PASSWORD**: Admin password for the 3x-UI panel  
- **THREEXUI_SECRET_KEY**: Optional secret key for request authentication

## 3x-UI Panel Setup

### 1. Install 3x-UI

Install 3x-UI on your VPS:

```bash
# Install via script
bash <(curl -Ls https://raw.githubusercontent.com/MHSanaei/3x-ui/master/install.sh)
```

### 2. Configure Panel Access

1. Access the web interface: `https://your-server-ip:2053`
2. Login with default credentials (admin/admin) or your custom ones
3. **Change default credentials** for security
4. Enable SSL/TLS if not already enabled

### 3. Create Inbound Rules

Create inbound rules for VPN protocols:

#### VLESS with Reality (Recommended)
- Protocol: VLESS
- Security: Reality
- Network: TCP
- Configure certificates and domains appropriately

#### VMESS with WebSocket + TLS
- Protocol: VMESS  
- Security: TLS
- Network: WebSocket
- Configure certificates and CDN settings

### 4. Network Configuration

Ensure your server allows:
- Incoming connections on your panel port (default: 2053)
- Incoming connections on configured VPN ports
- Outbound internet access for clients

## Integration Features

When properly configured, SafeSurf will:

✅ **Automatic Client Management**
- Create clients automatically for new subscriptions
- Update client limits when subscriptions change
- Handle email collision prevention across inbounds

✅ **Real-time Traffic Monitoring**
- Sync traffic usage from 3x-UI to database
- Display real usage on user dashboard
- Monitor connection status

✅ **Configuration Generation**
- Generate VLESS and VMESS URLs automatically
- Create QR codes for mobile clients  
- Provide subscription URLs for V2Ray clients

✅ **Multi-Inbound Support**
- Add clients to all active inbounds automatically
- Handle unique email requirements per inbound
- Load balance across multiple servers

## Testing the Integration

Use the test endpoint to verify your setup:

```bash
# Via tRPC (if you have admin access)
# This will test connection and list available inbounds
```

Or check the application logs for connection status during subscription operations.

## Troubleshooting

### Common Issues

**"3x-ui credentials not configured"**
- Ensure all three environment variables are set: THREEXUI_BASE_URL, THREEXUI_USERNAME, THREEXUI_PASSWORD
- Restart your Next.js application after adding variables

**Connection timeouts**
- Verify the panel URL is correct and accessible
- Check firewall rules allow connections on the panel port
- Ensure SSL certificates are valid if using HTTPS

**Authentication failed**
- Verify username and password are correct
- Check if account is not locked due to too many failed attempts
- Ensure admin privileges are granted to the account

**No inbounds found**
- Create at least one active VLESS or VMESS inbound
- Ensure inbounds are enabled in the panel
- Verify protocols are supported (VLESS/VMESS only)

### Security Considerations

1. **Use HTTPS**: Always use HTTPS URLs for panel access
2. **Strong Passwords**: Use strong passwords for panel admin accounts  
3. **Firewall Rules**: Restrict panel access to your application servers only
4. **Regular Updates**: Keep 3x-UI updated to latest version
5. **Monitor Access**: Review panel access logs regularly

### Performance Optimization

1. **Connection Pooling**: The client uses connection pooling for efficiency
2. **Caching**: Inbound data is cached to reduce API calls
3. **Batch Operations**: Multiple client operations are batched when possible
4. **Retry Logic**: Failed operations are retried with exponential backoff

## Development Mode

For development without a real 3x-UI panel:

1. Leave the environment variables empty/unset
2. The system will gracefully handle missing configuration
3. Subscriptions will still be created but without VPN configurations
4. Users can still navigate through the application flow

## Support

If you encounter issues:

1. Check application logs for detailed error messages
2. Verify 3x-UI panel is accessible from your server
3. Test panel API endpoints manually if needed
4. Consult the 3x-UI documentation for panel-specific issues

## Related Documentation

- [3x-UI Installation Guide](https://github.com/MHSanaei/3x-ui)
- [VLESS Protocol Documentation](https://xtls.github.io/config/protocols/vless.html)
- [V2Ray Client Configuration](https://www.v2ray.com/en/configuration/)