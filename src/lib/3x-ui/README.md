# 3x-ui API Client Library

A comprehensive TypeScript library for integrating with the 3x-ui (MHSanaei) panel API. This library provides full type safety, comprehensive error handling, authentication management, caching, and utility functions for managing inbounds, clients, and server monitoring.

## Features

- ✅ **Type-Safe**: Complete Zod schemas for all API endpoints and data structures
- ✅ **Authentication**: Automatic session management with retry logic
- ✅ **Caching**: Built-in caching system for improved performance
- ✅ **Error Handling**: Comprehensive error types and handling
- ✅ **Retry Logic**: Configurable retry with exponential backoff
- ✅ **Utilities**: Helper functions for common operations
- ✅ **Protocol Support**: VMESS, VLESS, Trojan, Shadowsocks
- ✅ **Stream Settings**: TCP, WebSocket, gRPC, HTTP/2 with TLS/Reality support
- ✅ **Bulk Operations**: Multi-client management capabilities

## Installation

This library is integrated into your project. Simply import from `@/lib/3x-ui`:

```typescript
import { createThreeXUIClient } from '@/lib/3x-ui';
```

## Quick Start

```typescript
import { createThreeXUIClient } from '@/lib/3x-ui';

// Create client instance
const client = createThreeXUIClient({
  baseUrl: 'https://your-panel.com:2053',
  username: 'admin',
  password: 'your-password',
  debug: true, // Enable debug logging
  timeout: 30000,
  cacheTTL: 300, // 5 minutes cache
});

// Test connection
const connected = await client.testConnection();
console.log('Connected:', connected);

// Get all inbounds
const inbounds = await client.getInbounds();
console.log('Inbounds:', inbounds);
```

## Configuration

```typescript
interface ThreeXUIConfig {
  baseUrl: string;        // Panel URL (e.g., https://your-domain.com:2053)
  username: string;       // Admin username
  password: string;       // Admin password
  timeout?: number;       // Request timeout (default: 30000ms)
  debug?: boolean;        // Enable debug logging (default: false)
  cacheTTL?: number;      // Cache TTL in seconds (default: 300)
  maxRetries?: number;    // Max retry attempts (default: 3)
  retryDelay?: number;    // Retry delay (default: 1000ms)
}
```

### Pre-configured Settings

```typescript
import { createThreeXUIClient, DefaultConfigs } from '@/lib/3x-ui';

// Development config (debug enabled, shorter cache)
const client = createThreeXUIClient({
  baseUrl: 'https://your-panel.com:2053',
  username: 'admin',
  password: 'password',
  ...DefaultConfigs.development,
});

// Production config (optimized for performance)
const client = createThreeXUIClient({
  baseUrl: 'https://your-panel.com:2053',
  username: 'admin',
  password: 'password',
  ...DefaultConfigs.production,
});
```

## API Methods

### Connection Management

```typescript
// Test connection
const isConnected = await client.testConnection();

// Logout and clear session
await client.logout();
```

### Inbound Management

```typescript
// Get all inbounds
const inbounds = await client.getInbounds();

// Get specific inbound
const inbound = await client.getInbound(1);

// Create new inbound using templates
const success = await client.createVmessInbound({
  remark: "My VMESS Server",
  port: 10001,
  clients: [{ email: "user@example.com" }],
  network: "ws", // or "tcp", "grpc", "http"
  security: "tls", // or "none", "reality"
});

// Update inbound
const updated = await client.updateInbound(1, {
  enable: false,
  remark: "Updated Name",
});

// Delete inbound
const deleted = await client.deleteInbound(1);

// Reset statistics
await client.resetAllInboundsStats();
await client.resetInboundStats(1);
```

### Client Management

```typescript
// Find client by email
const clientInfo = await client.findClientByEmail("user@example.com");

// Find client by UUID
const clientInfo = await client.findClientById("uuid-here");

// Get all clients
const allClients = await client.getAllClients();

// Add client to inbound
const clientAdded = await client.addClient(1, {
  id: generateUUID(),
  email: "user@example.com",
  limitIp: 2,
  totalGB: 10,
  expiryTime: addDaysToTimestamp(30),
  enable: true,
});

// Update client
const clientUpdated = await client.updateClient(1, "client-uuid", {
  totalGB: 20,
  expiryTime: addDaysToTimestamp(60),
});

// Delete client
const clientDeleted = await client.deleteClient(1, "client-uuid");

// Bulk add clients
const bulkSuccess = await client.addMultipleClients(1, [
  { email: "user1@example.com", totalGB: 10 },
  { email: "user2@example.com", totalGB: 20 },
]);

// Get client usage statistics
const usage = await client.getClientUsage("user@example.com");
console.log(`Usage: ${usage.usage?.trafficUsedGB}GB / ${usage.usage?.trafficTotalGB}GB`);
```

### Server Monitoring

```typescript
// Get server status
const status = await client.getServerStatus();
console.log(`CPU: ${status?.cpu}%, Memory: ${status?.mem.current}MB`);

// Get online clients
const onlineClients = await client.getOnlineClients();

// Get inbounds summary
const summary = await client.getInboundsSummary();

// Get comprehensive panel info
const panelInfo = await client.getPanelInfo();
```

## Utility Functions

```typescript
import {
  formatBytes,
  formatDate,
  generateUUID,
  generateSecurePassword,
  addDaysToTimestamp,
  InboundTemplates,
} from '@/lib/3x-ui';

// Format bytes to human readable
console.log(formatBytes(1073741824)); // "1 GB"

// Format timestamps
console.log(formatDate(Date.now())); // "12/25/2023"

// Generate UUIDs and passwords
const uuid = generateUUID();
const password = generateSecurePassword(16);

// Date utilities
const thirtyDaysFromNow = addDaysToTimestamp(30);

// Inbound templates
const vmessTemplate = InboundTemplates.vmess("My Server", 10001);
const vlessTemplate = InboundTemplates.vless("My VLESS", 10002);
```

## Advanced Usage

### Custom Stream Settings

```typescript
import {
  createWebSocketStreamSettings,
  createGrpcStreamSettings,
  createTcpStreamSettings,
} from '@/lib/3x-ui';

// WebSocket with TLS
const wsSettings = createWebSocketStreamSettings(
  "/ws-path",
  "your-domain.com",
  "tls",
  "your-domain.com"
);

// gRPC with TLS
const grpcSettings = createGrpcStreamSettings(
  "grpc-service-name",
  "tls",
  "your-domain.com"
);

// Use in inbound creation
const inbound = await client.addInbound({
  remark: "Advanced WebSocket",
  port: 443,
  protocol: "vless",
  settings: { clients: [], decryption: "none", fallbacks: [] },
  streamSettings: wsSettings,
  // ... other options
});
```

### Error Handling

```typescript
import {
  ThreeXUIError,
  ThreeXUIAuthError,
  ThreeXUINetworkError,
} from '@/lib/3x-ui';

try {
  await client.getInbounds();
} catch (error) {
  if (error instanceof ThreeXUIAuthError) {
    console.log('Authentication failed');
  } else if (error instanceof ThreeXUINetworkError) {
    console.log('Network error occurred');
  } else if (error instanceof ThreeXUIError) {
    console.log('API error:', error.message);
  }
}
```

### Environment Variables Integration

```typescript
import { env } from '@/env';

const client = createThreeXUIClient({
  baseUrl: env.THREEXUI_BASE_URL,
  username: env.THREEXUI_USERNAME,
  password: env.THREEXUI_PASSWORD,
});
```

## Protocol Examples

### VMESS Configuration

```typescript
const vmessInbound = await client.createVmessInbound({
  remark: "VMESS-WS-TLS",
  port: 443,
  clients: [{ email: "user@example.com", id: generateUUID() }],
  network: "ws",
  security: "tls",
});
```

### VLESS with Reality

```typescript
const vlessInbound = await client.createVlessInbound({
  remark: "VLESS-TCP-Reality",
  port: 443,
  clients: [{ email: "user@example.com" }],
  network: "tcp",
  security: "reality",
  flow: "xtls-rprx-vision",
});
```

### Trojan

```typescript
const trojanInbound = await client.createTrojanInbound({
  remark: "Trojan-WS-TLS",
  port: 8443,
  clients: [{ 
    email: "user@example.com",
    password: generateSecurePassword(16)
  }],
  network: "ws",
  security: "tls",
});
```

## Performance Tips

1. **Use Caching**: Enable caching for frequently accessed data
2. **Batch Operations**: Use bulk methods for multiple clients
3. **Connection Pooling**: Reuse client instances
4. **Error Handling**: Implement proper retry logic for network issues

```typescript
// Efficient bulk operations
const clients = await client.getAllClients(); // Cached
const summary = await client.getInboundsSummary(); // Uses cached inbounds

// Batch client additions
await client.addMultipleClients(inboundId, multipleClients);
```

## TypeScript Support

The library is fully typed with Zod schemas for runtime validation:

```typescript
import type {
  Inbound,
  Client,
  ServerStatus,
  InboundOptions,
} from '@/lib/3x-ui';

// All API responses are typed
const inbound: Inbound = await client.getInbound(1);
const status: ServerStatus = await client.getServerStatus();
```

## Examples

See `src/lib/3x-ui/examples.ts` for comprehensive usage examples including:

- Basic connection and authentication
- Managing inbounds and clients
- Advanced configurations
- Bulk operations
- Monitoring and statistics
- Error handling

## Support

This library supports all major features of the 3x-ui panel:

- ✅ All inbound protocols (VMESS, VLESS, Trojan, Shadowsocks)
- ✅ All stream networks (TCP, WebSocket, gRPC, HTTP/2)
- ✅ All security options (None, TLS, Reality)
- ✅ Client management with limits and expiry
- ✅ Traffic statistics and monitoring
- ✅ Server status and resource monitoring
- ✅ Database operations and backups

## License

This library is part of your project and follows your project's license terms. 