# V2Ray Connection String Configuration Guide

This guide explains how to properly construct connection strings (URI format) for V2Ray clients to connect to servers. These strings can be shared with users or converted to QR codes for easy mobile setup.

## Table of Contents
- [VMess Protocol](#vmess-protocol)
- [VLESS Protocol](#vless-protocol)
- [Shadowsocks Protocol](#shadowsocks-protocol)
- [Transport Configurations](#transport-configurations)
- [Security Options](#security-options)
- [Complete Examples](#complete-examples)
- [QR Code Generation](#qr-code-generation)
- [Troubleshooting](#troubleshooting)

## VMess Protocol

VMess is V2Ray's primary protocol with built-in encryption and authentication.

### Basic VMess URI Format
```
vmess://[base64-encoded-json-config]
```

The JSON configuration before base64 encoding:
```json
{
  "v": "2",
  "ps": "Remark/Name",
  "add": "server.address.com",
  "port": "443",
  "id": "uuid-here",
  "aid": "0",
  "scy": "auto",
  "net": "tcp",
  "type": "none",
  "host": "",
  "path": "",
  "tls": "tls",
  "sni": "",
  "alpn": ""
}
```

### VMess Parameters Explained

| Parameter | Description | Values | Required |
|-----------|-------------|---------|----------|
| `v` | Version | "2" | Yes |
| `ps` | Remark/Name | Any string | Yes |
| `add` | Server address | Domain/IP | Yes |
| `port` | Port number | 1-65535 | Yes |
| `id` | User UUID | Valid UUID | Yes |
| `aid` | AlterID | Number (0 recommended) | Yes |
| `scy` | Encryption | auto/aes-128-gcm/chacha20-poly1305/none | No |
| `net` | Network type | tcp/kcp/ws/h2/quic/grpc | Yes |
| `type` | Header type | none/http/srtp/utp/wechat-video/dtls/wireguard | No |
| `host` | Host header | Domain | Conditional |
| `path` | Path | URL path | Conditional |
| `tls` | Security | tls/none | No |
| `sni` | Server Name | Domain | No |
| `alpn` | ALPN | h2,http/1.1 | No |

### VMess Examples

#### 1. VMess + TCP + TLS
```json
{
  "v": "2",
  "ps": "US-Server-01",
  "add": "us1.example.com",
  "port": "443",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "auto",
  "net": "tcp",
  "type": "none",
  "tls": "tls"
}
```
Encoded: `vmess://eyJ2IjoiMiIsInBzIjoiVVMtU2VydmVyLTAxIiwiYWRkIjoidXMxLmV4YW1wbGUuY29tIiwicG9ydCI6IjQ0MyIsImlkIjoiM2I1MzkwYzUtNTJhMi00NzJkLThkYzItMTAzZWY1MDhiZTZjIiwiYWlkIjoiMCIsInNjeSI6ImF1dG8iLCJuZXQiOiJ0Y3AiLCJ0eXBlIjoibm9uZSIsInRscyI6InRscyJ9`

#### 2. VMess + WebSocket + TLS
```json
{
  "v": "2",
  "ps": "HK-WS-Server",
  "add": "hk.example.com",
  "port": "443",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "auto",
  "net": "ws",
  "type": "none",
  "host": "hk.example.com",
  "path": "/ray",
  "tls": "tls"
}
```

#### 3. VMess + mKCP + WeChat Video Header
```json
{
  "v": "2",
  "ps": "Gaming-Server",
  "add": "game.example.com",
  "port": "8399",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "aes-128-gcm",
  "net": "kcp",
  "type": "wechat-video",
  "tls": "none"
}
```

#### 4. VMess + HTTP/2 + TLS
```json
{
  "v": "2",
  "ps": "Premium-H2",
  "add": "premium.example.com",
  "port": "443",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "auto",
  "net": "h2",
  "type": "none",
  "host": "premium.example.com",
  "path": "/v2ray",
  "tls": "tls"
}
```

#### 5. VMess + QUIC
```json
{
  "v": "2",
  "ps": "QUIC-Server",
  "add": "quic.example.com",
  "port": "443",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "chacha20-poly1305",
  "net": "quic",
  "type": "none",
  "host": "quic.example.com",
  "tls": "tls"
}
```

## VLESS Protocol

**Note**: VLESS is not part of official V2Ray but is supported by Xray and other forks.

### Basic VLESS URI Format
```
vless://[uuid]@[address]:[port]?[parameters]#[remark]
```

### VLESS Parameters

| Parameter | Description | Values |
|-----------|-------------|---------|
| `encryption` | Encryption | none (required) |
| `security` | Security layer | none/tls/xtls |
| `type` | Network type | tcp/kcp/ws/h2/quic/grpc |
| `host` | Host header | Domain |
| `path` | Path | URL path |
| `headerType` | Header type | none/http |
| `seed` | mKCP seed | String |
| `quicSecurity` | QUIC security | none/aes-128-gcm/chacha20-poly1305 |
| `key` | QUIC key | String |
| `mode` | gRPC mode | gun/multi |
| `serviceName` | gRPC service | String |
| `flow` | Flow control | xtls-rprx-direct/xtls-rprx-splice |
| `sni` | Server name | Domain |
| `alpn` | ALPN | http/1.1,h2,h3 |

### VLESS Examples

#### 1. VLESS + TCP + XTLS
```
vless://3b5390c5-52a2-472d-8dc2-103ef508be6c@server.example.com:443?encryption=none&security=xtls&type=tcp&flow=xtls-rprx-direct&sni=server.example.com#VLESS-XTLS-Server
```

#### 2. VLESS + WebSocket + TLS
```
vless://3b5390c5-52a2-472d-8dc2-103ef508be6c@server.example.com:443?encryption=none&security=tls&type=ws&host=server.example.com&path=%2Fvless#VLESS-WS-TLS
```

#### 3. VLESS + gRPC + TLS
```
vless://3b5390c5-52a2-472d-8dc2-103ef508be6c@server.example.com:443?encryption=none&security=tls&type=grpc&serviceName=grpc-service&mode=gun#VLESS-gRPC
```

#### 4. VLESS + HTTP/2 + TLS
```
vless://3b5390c5-52a2-472d-8dc2-103ef508be6c@server.example.com:443?encryption=none&security=tls&type=h2&host=server.example.com&path=%2Fvless#VLESS-H2
```

## Shadowsocks Protocol

### Basic Shadowsocks URI Format
```
ss://[base64-encoded-auth]@[server]:[port]#[remark]
```

Where auth is: `encryption:password`

### Shadowsocks Examples

#### 1. Shadowsocks with AES-256-GCM
```
ss://YWVzLTI1Ni1nY206cGFzc3dvcmQxMjM0NTY@server.example.com:8388#SS-Server
```
Decoded auth: `aes-256-gcm:password123456`

#### 2. Shadowsocks with ChaCha20-Poly1305
```
ss://Y2hhY2hhMjAtcG9seTEzMDU6c3Ryb25ncGFzc3dvcmQ@server.example.com:8388#SS-ChaCha
```

#### 3. SIP002 URI Format (with plugin)
```
ss://YWVzLTI1Ni1nY206cGFzc3dvcmQ@server.example.com:8388/?plugin=v2ray-plugin;obfs=websocket;obfs-host=server.example.com;path=/ss;tls#SS-V2Ray-Plugin
```

## Transport Configurations

### TCP Configuration
- **Plain TCP**: No additional parameters needed
- **HTTP Header**: Add `"type": "http"` with custom headers

### mKCP Configuration
```json
{
  "net": "kcp",
  "type": "none|srtp|utp|wechat-video|dtls|wireguard"
}
```

**mKCP Headers**:
- `none`: No obfuscation
- `srtp`: Disguised as SRTP packets
- `utp`: Disguised as uTP packets
- `wechat-video`: Disguised as WeChat video
- `dtls`: Disguised as DTLS 1.2 packets
- `wireguard`: Disguised as WireGuard packets

### WebSocket Configuration
```json
{
  "net": "ws",
  "host": "your.domain.com",
  "path": "/websocket"
}
```

**Important**: 
- Path must start with `/`
- Host header should match certificate domain
- Can work with CDN services (Cloudflare)

### HTTP/2 Configuration
```json
{
  "net": "h2",
  "host": "your.domain.com",
  "path": "/h2path"
}
```

**Requirements**:
- Must use TLS
- Path is optional (default: `/`)
- Supports multiple hosts (comma-separated)

### QUIC Configuration
```json
{
  "net": "quic",
  "quicSecurity": "none|aes-128-gcm|chacha20-poly1305",
  "key": "optional-key",
  "header": {
    "type": "none|srtp|utp|wechat-video|dtls|wireguard"
  }
}
```

### gRPC Configuration (VLESS/Xray only)
```json
{
  "net": "grpc",
  "serviceName": "grpc-service",
  "mode": "gun|multi"
}
```

## Security Options

### TLS Configuration
- **Enable TLS**: Set `"tls": "tls"` or `security=tls`
- **Server Name (SNI)**: Specify custom SNI for certificate verification
- **ALPN**: Protocol negotiation (h2,http/1.1)
- **Allow Insecure**: Not recommended for production

### Certificate Pinning
Some clients support certificate pinning:
```
&pinnedPeerCertificateChainSha256=base64url(sha256(cert))
```

## Complete Examples

### Production VMess + WebSocket + TLS + CDN
```json
{
  "v": "2",
  "ps": "Production-CDN-Server",
  "add": "cdn.cloudflare.com",
  "port": "443",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "auto",
  "net": "ws",
  "type": "none",
  "host": "your-actual-domain.com",
  "path": "/v2ray",
  "tls": "tls",
  "sni": "your-actual-domain.com"
}
```

### High-Performance VLESS + XTLS
```
vless://3b5390c5-52a2-472d-8dc2-103ef508be6c@direct.example.com:443?encryption=none&security=xtls&type=tcp&flow=xtls-rprx-splice&sni=direct.example.com&alpn=h2,http/1.1#Performance-Server
```

### Mobile-Optimized VMess + mKCP
```json
{
  "v": "2",
  "ps": "Mobile-Optimized",
  "add": "mobile.example.com",
  "port": "8399",
  "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
  "aid": "0",
  "scy": "chacha20-poly1305",
  "net": "kcp",
  "type": "wechat-video",
  "tls": "none"
}
```

## QR Code Generation

### Generate QR Code from Connection String

**Python Example**:
```python
import qrcode
import base64
import json

def generate_vmess_qr(config_dict):
    # Convert config to JSON
    config_json = json.dumps(config_dict, separators=(',', ':'))
    
    # Base64 encode
    config_b64 = base64.b64encode(config_json.encode()).decode()
    
    # Create VMess URI
    vmess_uri = f"vmess://{config_b64}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(vmess_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    return img

# Example usage
config = {
    "v": "2",
    "ps": "My-Server",
    "add": "server.example.com",
    "port": "443",
    "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
    "aid": "0",
    "scy": "auto",
    "net": "ws",
    "path": "/ray",
    "tls": "tls"
}

qr_image = generate_vmess_qr(config)
qr_image.save("vmess_qr.png")
```

**JavaScript Example**:
```javascript
function generateVMessURI(config) {
    const configStr = JSON.stringify(config);
    const base64Config = btoa(configStr);
    return `vmess://${base64Config}`;
}

function generateVLESSURI(uuid, address, port, params) {
    const queryString = new URLSearchParams(params).toString();
    const remark = params.remark || 'VLESS-Server';
    delete params.remark;
    return `vless://${uuid}@${address}:${port}?${queryString}#${encodeURIComponent(remark)}`;
}
```

## Troubleshooting

### Common Issues

1. **Base64 Encoding Issues**
   - Ensure proper padding (=)
   - Use URL-safe base64 for some parameters
   - No line breaks in encoded strings

2. **Special Characters**
   - URL encode special characters in paths and remarks
   - Use %2F for / in paths
   - Use %23 for # in parameters

3. **Port Conflicts**
   - 443: Standard HTTPS/TLS
   - 80: HTTP (avoid for security)
   - 8388: Common Shadowsocks port
   - Custom ports may be blocked by firewalls

4. **Certificate Issues**
   - SNI must match certificate domain
   - Certificate must be valid and not expired
   - Self-signed certificates require allowing insecure

5. **Protocol Mismatches**
   - Ensure client supports the protocol version
   - VLESS requires Xray or compatible client
   - Some features are client-specific

### Validation Script

```python
def validate_vmess_uri(uri):
    try:
        if not uri.startswith('vmess://'):
            return False, "URI must start with vmess://"
        
        b64_part = uri[8:]
        config_json = base64.b64decode(b64_part)
        config = json.loads(config_json)
        
        required_fields = ['v', 'ps', 'add', 'port', 'id', 'aid', 'net']
        for field in required_fields:
            if field not in config:
                return False, f"Missing required field: {field}"
        
        # Validate UUID
        import uuid
        try:
            uuid.UUID(config['id'])
        except ValueError:
            return False, "Invalid UUID format"
        
        # Validate port
        port = int(config['port'])
        if not 1 <= port <= 65535:
            return False, "Invalid port number"
        
        return True, "Valid VMess URI"
        
    except Exception as e:
        return False, f"Validation error: {str(e)}"
```

### Testing Connection Strings

**Using V2Ray CLI**:
```bash
# Test VMess connection
v2ray test -config <(echo '{
  "outbounds": [{
    "protocol": "vmess",
    "settings": {
      "vnext": [{
        "address": "server.example.com",
        "port": 443,
        "users": [{
          "id": "3b5390c5-52a2-472d-8dc2-103ef508be6c",
          "alterId": 0
        }]
      }]
    }
  }]
}')
```

## Best Practices

1. **Security**
   - Always use TLS for production
   - Set alterId to 0 (VMess AEAD)
   - Use strong passwords for Shadowsocks
   - Rotate UUIDs periodically

2. **Performance**
   - Use mKCP for low latency
   - Use WebSocket for CDN compatibility
   - Use QUIC for mobile connections
   - Monitor server load

3. **Compatibility**
   - Test with target client apps
   - Provide multiple protocol options
   - Document required client versions
   - Include fallback servers

4. **Distribution**
   - Use QR codes for mobile
   - Provide one-click import links
   - Include setup instructions
   - Offer multiple formats

This guide covers the essential formats and configurations for V2Ray connection strings. Always test your configurations with actual clients before distribution.