import { type StreamSettings, type InboundOptions } from "./schemas";

/**
 * Utility functions for 3x-ui panel operations
 */

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Convert GB to bytes
 */
export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

/**
 * Convert bytes to GB
 */
export function bytesToGb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  if (!timestamp || timestamp === 0) return "Never";
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format timestamp to readable datetime
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp || timestamp === 0) return "Never";
  return new Date(timestamp).toLocaleString();
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryTime: number): number {
  if (!expiryTime || expiryTime === 0) return -1;
  const now = Date.now();
  const diff = expiryTime - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Check if timestamp is expired
 */
export function isExpired(expiryTime: number): boolean {
  if (!expiryTime || expiryTime === 0) return false;
  return expiryTime < Date.now();
}

/**
 * Generate random port number within safe range
 */
export function generateRandomPort(min = 10000, max = 65535): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate secure random password
 */
export function generateSecurePassword(length = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generate Reality settings for VLESS
 */
export function generateRealitySettings(dest: string, serverNames: string[]) {
  return {
    show: false,
    xver: 0,
    dest,
    serverNames,
    privateKey: generateSecurePassword(44).replace(/[^a-zA-Z0-9]/g, 'a'),
    minClient: "",
    maxClient: "",
    maxTimediff: 0,
    shortIds: [generateSecurePassword(16).substring(0, 8)],
    settings: {
      publicKey: "",
      fingerprint: "chrome",
      serverName: serverNames[0] ?? "",
      spiderX: "",
    },
  };
}

/**
 * Generate TLS settings
 */
export function generateTLSSettings(serverName: string, allowInsecure = false) {
  return {
    serverName,
    rejectUnknownSni: false,
    allowInsecure,
    minVersion: "1.2",
    maxVersion: "1.3",
    cipherSuites: "",
    certificates: [],
    alpn: ["h2", "http/1.1"],
    settings: {
      allowInsecure,
      fingerprint: "",
    },
  };
}

/**
 * Create default TCP stream settings
 */
export function createTcpStreamSettings(security: "none" | "tls" | "reality" = "none", serverName?: string): StreamSettings {
  const settings: StreamSettings = {
    network: "tcp",
    security,
    externalProxy: [],
    tcpSettings: {
      acceptProxyProtocol: false,
      header: {
        type: "none",
      },
    },
  };

  if (security === "tls" && serverName) {
    settings.tlsSettings = generateTLSSettings(serverName);
  } else if (security === "reality" && serverName) {
    settings.realitySettings = generateRealitySettings(`${serverName}:443`, [serverName]);
  }

  return settings;
}

/**
 * Create WebSocket stream settings
 */
export function createWebSocketStreamSettings(
  path = "/",
  host = "",
  security: "none" | "tls" | "reality" = "none",
  serverName?: string
): StreamSettings {
  const settings: StreamSettings = {
    network: "ws",
    security,
    externalProxy: [],
    wsSettings: {
      acceptProxyProtocol: false,
      path,
      host,
      headers: {},
    },
  };

  if (security === "tls" && serverName) {
    settings.tlsSettings = generateTLSSettings(serverName);
  }

  return settings;
}

/**
 * Create gRPC stream settings
 */
export function createGrpcStreamSettings(
  serviceName = "",
  security: "none" | "tls" | "reality" = "none",
  serverName?: string
): StreamSettings {
  const settings: StreamSettings = {
    network: "grpc",
    security,
    externalProxy: [],
    grpcSettings: {
      serviceName,
      multiMode: false,
    },
  };

  if (security === "tls" && serverName) {
    settings.tlsSettings = generateTLSSettings(serverName);
  }

  return settings;
}

/**
 * Create HTTP/2 stream settings
 */
export function createHttpStreamSettings(
  host: string[] = [],
  path = "/",
  security: "none" | "tls" = "none",
  serverName?: string
): StreamSettings {
  const settings: StreamSettings = {
    network: "http",
    security,
    externalProxy: [],
    httpSettings: {
      host,
      path,
    },
  };

  if (security === "tls" && serverName) {
    settings.tlsSettings = generateTLSSettings(serverName);
  }

  return settings;
}

/**
 * Validate port number
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Types for stream settings data
interface StreamSettingsData {
  network: string;
  security: string;
  realitySettings?: {
    settings?: {
      publicKey?: string;
      fingerprint?: string;
      serverName?: string;
      spiderX?: string;
    };
    serverNames?: string[];
    shortIds?: string[];
    dest?: string;
  };
  tlsSettings?: {
    serverName?: string;
    fingerprint?: string;
    alpn?: string[];
    allowInsecure?: boolean;
  };
  wsSettings?: {
    path?: string;
    host?: string;
    headers?: Record<string, string>;
  };
  tcpSettings?: {
    header?: {
      type?: string;
    };
  };
  grpcSettings?: {
    serviceName?: string;
    multiMode?: boolean;
  };
  httpSettings?: {
    host?: string[];
    path?: string;
  };
}

// Types for client configuration
interface ClientConfig {
  id: string;
  flow?: string;
  encryption?: string;
  streamSettings?: StreamSettingsData;
  
  // Legacy support
  network?: string;
  security?: string;
  alterId?: number;
  method?: string;
  password?: string;
}

/**
 * Generate client configuration URL for different protocols
 */
export function generateClientUrl(
  protocol: string,
  config: ClientConfig,
  server: string,
  port: number,
  remark?: string
): string {
  // Don't pre-encode remark here - let each protocol handler do its own encoding
  
  switch (protocol.toLowerCase()) {
    case "vmess": {
      return generateVmessUrl(config, server, port, remark);
    }
    
    case "vless": {
      return generateVlessUrl(config, server, port, remark);
    }
    
    case "trojan": {
      const streamSettings = config.streamSettings;
      const network = streamSettings?.network ?? config.network ?? "tcp";
      const security = streamSettings?.security ?? config.security ?? "tls";
      
      const params = new URLSearchParams();
      params.set("security", security);
      params.set("type", network);
      
      // Handle network-specific parameters
      if (network === "ws" && streamSettings?.wsSettings) {
        params.set("path", encodeURIComponent(streamSettings.wsSettings.path ?? "/"));
        if (streamSettings.wsSettings.host) {
          params.set("host", streamSettings.wsSettings.host);
        }
      } else if (network === "grpc" && streamSettings?.grpcSettings) {
        params.set("serviceName", streamSettings.grpcSettings.serviceName ?? "");
        params.set("mode", streamSettings.grpcSettings.multiMode ? "multi" : "gun");
      }
      
      // Handle TLS settings
      if (security === "tls" && streamSettings?.tlsSettings) {
        if (streamSettings.tlsSettings.serverName) {
          params.set("sni", streamSettings.tlsSettings.serverName);
        }
        if (streamSettings.tlsSettings.fingerprint) {
          params.set("fp", streamSettings.tlsSettings.fingerprint);
        }
      }
      
      const baseUrl = `trojan://${config.password}@${server}:${port}`;
      const queryString = params.toString();
      
      if (remark) {
        return `${baseUrl}?${queryString}#${encodeURIComponent(remark)}`;
      }
      
      return `${baseUrl}?${queryString}`;
    }
    
    case "shadowsocks": {
      const auth = `${config.method}:${config.password}`;
      const encoded = Buffer.from(auth, 'utf8').toString('base64');
      
      // Handle SIP002 format if plugin is needed
      if (config.streamSettings?.wsSettings) {
        const params = new URLSearchParams();
        params.set('plugin', 'v2ray-plugin');
        params.set('obfs', 'websocket');
        if (config.streamSettings.wsSettings.host) {
          params.set('obfs-host', config.streamSettings.wsSettings.host);
        }
        if (config.streamSettings.wsSettings.path) {
          params.set('path', config.streamSettings.wsSettings.path);
        }
        if (config.streamSettings.security === 'tls') {
          params.set('tls', 'true');
        }
        
        return `ss://${encoded}@${server}:${port}/?${params.toString()}#${remark ? encodeURIComponent(remark) : ''}`;
      }
      
      return `ss://${encoded}@${server}:${port}#${remark ? encodeURIComponent(remark) : ''}`;
    }
    
    default:
      throw new Error(`Unsupported protocol: ${protocol}`);
  }
}

/**
 * Generate VMESS configuration URL
 * Based on VMess JSON format from docs/HOW_TO_FORM_CONNECTION.md
 */
function generateVmessUrl(
  config: ClientConfig,
  server: string,
  port: number,
  remark?: string
): string {
  const streamSettings = config.streamSettings;
  const network = streamSettings?.network ?? config.network ?? "tcp";
  const security = streamSettings?.security ?? config.security ?? "none";
  
  // VMess JSON config according to the documentation - using proper types
  const vmessConfig: Record<string, string | number> = {
    v: "2",                                    // Version (required)
    ps: remark ?? "",                          // Remark/Name (required)
    add: server,                               // Server address (required)
    port: port,                                // Port (required as number, not string!)
    id: config.id,                            // User UUID (required)
    scy: "auto",                              // Encryption (optional)
    net: network,                             // Network type (required)
    tls: security === "tls" ? "tls" : "",     // Security layer (empty string for none)
    type: "none",                             // Header type (required)
    host: "",                                 // Host header (conditional)
    path: "",                                 // Path (conditional)
    sni: "",                                  // Server Name Indication
    fp: "",                                   // Fingerprint
    alpn: "",                                 // ALPN
  };

  // Handle different network types according to documentation
  switch (network) {
    case "ws":
      if (streamSettings?.wsSettings) {
        vmessConfig.path = streamSettings.wsSettings.path ?? "/";
        vmessConfig.host = streamSettings.wsSettings.host ?? "";
      }
      break;
      
    case "grpc":
      if (streamSettings?.grpcSettings) {
        vmessConfig.path = streamSettings.grpcSettings.serviceName ?? "";
        vmessConfig.type = streamSettings.grpcSettings.multiMode ? "multi" : "gun";
      }
      break;
      
    case "h2":
    case "http":
      if (streamSettings?.httpSettings) {
        vmessConfig.path = streamSettings.httpSettings.path ?? "/";
        if (streamSettings.httpSettings.host && streamSettings.httpSettings.host.length > 0) {
          vmessConfig.host = streamSettings.httpSettings.host.join(",");
        }
      }
      break;
      
    case "kcp":
      // mKCP settings from stream settings
      if (streamSettings?.tcpSettings?.header?.type) {
        vmessConfig.type = streamSettings.tcpSettings.header.type;
      }
      break;
      
    case "quic":
      // QUIC settings would go here if supported
      break;
      
    case "tcp":
    default:
      // TCP header type
      if (streamSettings?.tcpSettings?.header?.type) {
        vmessConfig.type = streamSettings.tcpSettings.header.type;
      }
      break;
  }

  // Handle TLS settings
  if (security === "tls" && streamSettings?.tlsSettings) {
    vmessConfig.sni = streamSettings.tlsSettings.serverName ?? "";
    vmessConfig.fp = streamSettings.tlsSettings.fingerprint ?? "chrome"; // Default to chrome
    if (streamSettings.tlsSettings.alpn && streamSettings.tlsSettings.alpn.length > 0) {
      vmessConfig.alpn = streamSettings.tlsSettings.alpn.join(",");
    }
  }

  // Generate pretty-printed JSON like in the working example
  const jsonString = JSON.stringify(vmessConfig, null, 2); // Pretty print with 2 spaces
  const encoded = Buffer.from(jsonString, 'utf8').toString('base64');
  return `vmess://${encoded}`;
}

/**
 * Generate VLESS configuration URL
 * Based on VLESS URI format from docs/HOW_TO_FORM_CONNECTION.md
 */
function generateVlessUrl(
  config: ClientConfig,
  server: string,
  port: number,
  remark?: string
): string {
  const streamSettings = config.streamSettings;
  const network = streamSettings?.network ?? config.network ?? "tcp";
  const security = streamSettings?.security ?? config.security ?? "none";
  
  const params = new URLSearchParams();
  
  // Basic parameters - NOTE: encryption is NOT added for VLESS (it's implicit as "none")
  params.set("type", network);                           // Network type
  params.set("security", security);                      // Security layer

  // Handle different network types according to documentation
  switch (network) {
    case "ws":
      if (streamSettings?.wsSettings) {
        const path = streamSettings.wsSettings.path ?? "/";
        params.set("path", path); // Don't double-encode
        if (streamSettings.wsSettings.host) {
          params.set("host", streamSettings.wsSettings.host);
        }
      }
      break;
      
    case "grpc":
      if (streamSettings?.grpcSettings) {
        params.set("serviceName", streamSettings.grpcSettings.serviceName ?? "");
        params.set("mode", streamSettings.grpcSettings.multiMode ? "multi" : "gun");
      }
      break;
      
    case "h2":
    case "http":
      if (streamSettings?.httpSettings) {
        const path = streamSettings.httpSettings.path ?? "/";
        params.set("path", path); // Don't double-encode
        if (streamSettings.httpSettings.host && streamSettings.httpSettings.host.length > 0) {
          params.set("host", streamSettings.httpSettings.host.join(","));
        }
      }
      break;
      
    case "kcp":
      // mKCP header type
      if (streamSettings?.tcpSettings?.header?.type) {
        params.set("headerType", streamSettings.tcpSettings.header.type);
      }
      break;
      
    case "quic":
      // QUIC settings
      if (streamSettings?.realitySettings) { // Using reality settings for QUIC security
        params.set("quicSecurity", "none"); // Default
        if (streamSettings.realitySettings.settings?.publicKey) {
          params.set("key", streamSettings.realitySettings.settings.publicKey);
        }
      }
      break;
  }

  // Handle TLS settings
  if (security === "tls" && streamSettings?.tlsSettings) {
    if (streamSettings.tlsSettings.fingerprint) {
      params.set("fp", streamSettings.tlsSettings.fingerprint);
    }
    if (streamSettings.tlsSettings.alpn && streamSettings.tlsSettings.alpn.length > 0) {
      // Join ALPN values with encoded commas - URLSearchParams will handle the encoding
      params.set("alpn", streamSettings.tlsSettings.alpn.join(","));
    }
    if (streamSettings.tlsSettings.serverName) {
      params.set("sni", streamSettings.tlsSettings.serverName);
    }
  }

  // Handle XTLS settings (for high performance)
  if (security === "xtls" && streamSettings?.tlsSettings) {
    if (streamSettings.tlsSettings.fingerprint) {
      params.set("fp", streamSettings.tlsSettings.fingerprint);
    }
    if (streamSettings.tlsSettings.alpn && streamSettings.tlsSettings.alpn.length > 0) {
      params.set("alpn", streamSettings.tlsSettings.alpn.join(","));
    }
    if (streamSettings.tlsSettings.serverName) {
      params.set("sni", streamSettings.tlsSettings.serverName);
    }
  }

  // Handle Reality settings (advanced obfuscation)
  if (security === "reality" && streamSettings?.realitySettings) {
    const realitySettings = streamSettings.realitySettings;
    const settings = realitySettings.settings;
    
    if (settings?.publicKey) {
      params.set("pbk", settings.publicKey);
    }
    if (settings?.fingerprint) {
      params.set("fp", settings.fingerprint);
    }
    
    // SNI should come from serverNames array, not settings.serverName (which is often empty)
    if (realitySettings.serverNames && realitySettings.serverNames.length > 0) {
      const serverName = realitySettings.serverNames[0];
      if (serverName) {
        params.set("sni", serverName);
      }
    } else if (settings?.serverName) {
      params.set("sni", settings.serverName);
    }
    
    // Use the first shortId if available
    if (realitySettings.shortIds && realitySettings.shortIds.length > 0) {
      const shortId = realitySettings.shortIds[0];
      if (shortId) {
        params.set("sid", shortId);
      }
    }
    
    // SpiderX - don't encode manually as URLSearchParams will encode it
    if (settings?.spiderX) {
      params.set("spx", settings.spiderX); // Let URLSearchParams handle encoding
    }
  }

  // Add flow for XTLS/Vision at the END (to match panel order)
  if (config.flow) {
    params.set("flow", config.flow);
  }

  // Build final URL with proper encoding
  const baseUrl = `vless://${config.id}@${server}:${port}`;
  const queryString = params.toString();
  
  if (remark) {
    return `${baseUrl}?${queryString}#${encodeURIComponent(remark)}`;
  }
  
  return `${baseUrl}?${queryString}`;
}

// Types for parsed URL result
interface ParsedUrlResult {
  protocol: string;
  config: Record<string, unknown>;
}

/**
 * Parse client configuration URL
 */
export function parseClientUrl(url: string): ParsedUrlResult {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.slice(0, -1); // Remove trailing :
    
    switch (protocol.toLowerCase()) {
      case "vmess": {
        const decoded = Buffer.from(urlObj.hostname, 'base64').toString();
        return { protocol, config: JSON.parse(decoded) as Record<string, unknown> };
      }
      
      case "vless": {
        const params = Object.fromEntries(urlObj.searchParams.entries());
        return {
          protocol,
          config: {
            id: urlObj.username,
            server: urlObj.hostname,
            port: parseInt(urlObj.port),
            ...params,
          },
        };
      }
      
      case "trojan": {
        const params = Object.fromEntries(urlObj.searchParams.entries());
        return {
          protocol,
          config: {
            password: urlObj.username,
            server: urlObj.hostname,
            port: parseInt(urlObj.port),
            ...params,
          },
        };
      }
      
      case "ss": {
        const decoded = Buffer.from(urlObj.username, 'base64').toString();
        const [method, password] = decoded.split(':');
        return {
          protocol,
          config: {
            method,
            password,
            server: urlObj.hostname,
            port: parseInt(urlObj.port),
          },
        };
      }
      
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculate usage percentage
 */
export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, (used / total) * 100);
}

/**
 * Get status color based on usage percentage
 */
export function getUsageStatusColor(percentage: number): "green" | "yellow" | "red" {
  if (percentage < 70) return "green";
  if (percentage < 90) return "yellow";
  return "red";
}

/**
 * Clean and validate remark (name)
 */
export function cleanRemark(remark: string): string {
  return remark
    .trim()
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .substring(0, 50); // Limit length
}

/**
 * Convert expiry date to timestamp
 */
export function dateToTimestamp(date: Date): number {
  return date.getTime();
}

/**
 * Add days to current date and return timestamp
 */
export function addDaysToTimestamp(days: number): number {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.getTime();
}

/**
 * Default inbound template generators
 */
export const InboundTemplates = {
  vmess: (remark: string, port: number): Partial<InboundOptions> => ({
    remark: cleanRemark(remark),
    port,
    protocol: "vmess",
    settings: {
      clients: [],
      decryption: "none",
      fallbacks: [],
    },
    streamSettings: createTcpStreamSettings(),
    sniffing: {
      enabled: true,
      destOverride: ["http", "tls"],
      metadataOnly: false,
      routeOnly: false,
    },
    enable: true,
    listen: "",
    expiryTime: 0,
    tag: "",
  }),

  vless: (remark: string, port: number): Partial<InboundOptions> => ({
    remark: cleanRemark(remark),
    port,
    protocol: "vless",
    settings: {
      clients: [],
      decryption: "none",
      fallbacks: [],
    },
    streamSettings: createTcpStreamSettings(),
    sniffing: {
      enabled: true,
      destOverride: ["http", "tls"],
      metadataOnly: false,
      routeOnly: false,
    },
    enable: true,
    listen: "",
    expiryTime: 0,
    tag: "",
  }),

  trojan: (remark: string, port: number): Partial<InboundOptions> => ({
    remark: cleanRemark(remark),
    port,
    protocol: "trojan",
    settings: {
      clients: [],
      decryption: "none",
      fallbacks: [],
    },
    streamSettings: createTcpStreamSettings("tls"),
    sniffing: {
      enabled: true,
      destOverride: ["http", "tls"],
      metadataOnly: false,
      routeOnly: false,
    },
    enable: true,
    listen: "",
    expiryTime: 0,
    tag: "",
  }),

  shadowsocks: (remark: string, port: number): Partial<InboundOptions> => ({
    remark: cleanRemark(remark),
    port,
    protocol: "shadowsocks",
    settings: {
      clients: [],
      decryption: "none",
      fallbacks: [],
    },
    streamSettings: createTcpStreamSettings(),
    sniffing: {
      enabled: true,
      destOverride: ["http", "tls"],
      metadataOnly: false,
      routeOnly: false,
    },
    enable: true,
    listen: "",
    expiryTime: 0,
    tag: "",
  }),
}; 