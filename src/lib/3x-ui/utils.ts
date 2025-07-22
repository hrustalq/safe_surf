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
  const encodedRemark = remark ? encodeURIComponent(remark) : "";
  
  switch (protocol.toLowerCase()) {
    case "vmess": {
      return generateVmessUrl(config, server, port, remark);
    }
    
    case "vless": {
      return generateVlessUrl(config, server, port, remark);
    }
    
    case "trojan": {
      const params = new URLSearchParams({
        security: config.streamSettings?.security ?? config.security ?? "tls",
        type: config.streamSettings?.network ?? config.network ?? "tcp",
      });
      
      if (remark) params.set("name", remark);
      
      return `trojan://${config.password}@${server}:${port}?${params.toString()}`;
    }
    
    case "shadowsocks": {
      const auth = `${config.method}:${config.password}`;
      const encoded = Buffer.from(auth).toString('base64');
      return `ss://${encoded}@${server}:${port}#${encodedRemark}`;
    }
    
    default:
      throw new Error(`Unsupported protocol: ${protocol}`);
  }
}

/**
 * Generate VMESS configuration URL
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
  
  const vmessConfig: Record<string, string | number> = {
    v: "2",
    ps: remark ?? "",
    add: server,
    port: port.toString(),
    id: config.id,
    aid: config.alterId?.toString() ?? "0",
    scy: "auto",
    net: network,
    type: "none",
    host: "",
    path: "",
    tls: security === "tls" ? "tls" : "",
    sni: "",
    fp: "",
    alpn: "",
  };

  // Handle different network types
  if (network === "ws" && streamSettings?.wsSettings) {
    vmessConfig.path = streamSettings.wsSettings.path ?? "/";
    vmessConfig.host = streamSettings.wsSettings.host ?? "";
  } else if (network === "grpc" && streamSettings?.grpcSettings) {
    vmessConfig.path = streamSettings.grpcSettings.serviceName ?? "";
    vmessConfig.type = streamSettings.grpcSettings.multiMode ? "multi" : "gun";
  } else if (network === "http" && streamSettings?.httpSettings) {
    vmessConfig.path = streamSettings.httpSettings.path ?? "/";
    if (streamSettings.httpSettings.host && streamSettings.httpSettings.host.length > 0) {
      vmessConfig.host = streamSettings.httpSettings.host[0] ?? "";
    }
  }

  // Handle TLS settings
  if (security === "tls" && streamSettings?.tlsSettings) {
    vmessConfig.sni = streamSettings.tlsSettings.serverName ?? "";
    vmessConfig.fp = streamSettings.tlsSettings.fingerprint ?? "chrome";
    if (streamSettings.tlsSettings.alpn && streamSettings.tlsSettings.alpn.length > 0) {
      vmessConfig.alpn = streamSettings.tlsSettings.alpn.join(",");
    }
  }

  const encoded = Buffer.from(JSON.stringify(vmessConfig)).toString('base64');
  return `vmess://${encoded}`;
}

/**
 * Generate VLESS configuration URL
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
  
  // Basic parameters
  params.set("encryption", config.encryption ?? "none");
  params.set("type", network);
  params.set("security", security);
  
  // Add flow for XTLS
  if (config.flow) {
    params.set("flow", config.flow);
  }

  // Handle different network types
  if (network === "ws" && streamSettings?.wsSettings) {
    params.set("path", streamSettings.wsSettings.path ?? "/");
    if (streamSettings.wsSettings.host) {
      params.set("host", streamSettings.wsSettings.host);
    }
  } else if (network === "grpc" && streamSettings?.grpcSettings) {
    params.set("serviceName", streamSettings.grpcSettings.serviceName ?? "");
    params.set("mode", streamSettings.grpcSettings.multiMode ? "multi" : "gun");
  } else if (network === "http" && streamSettings?.httpSettings) {
    params.set("path", streamSettings.httpSettings.path ?? "/");
    if (streamSettings.httpSettings.host && streamSettings.httpSettings.host.length > 0) {
      params.set("host", streamSettings.httpSettings.host.join(","));
    }
  }

  // Handle TLS settings
  if (security === "tls" && streamSettings?.tlsSettings) {
    params.set("sni", streamSettings.tlsSettings.serverName ?? "");
    params.set("fp", streamSettings.tlsSettings.fingerprint ?? "chrome");
    if (streamSettings.tlsSettings.alpn && streamSettings.tlsSettings.alpn.length > 0) {
      params.set("alpn", streamSettings.tlsSettings.alpn.join("%2C"));
    }
  }

  // Handle Reality settings
  if (security === "reality" && streamSettings?.realitySettings) {
    const realitySettings = streamSettings.realitySettings;
    const settings = realitySettings.settings;
    
    if (settings?.publicKey) {
      params.set("pbk", settings.publicKey);
    }
    if (settings?.fingerprint) {
      params.set("fp", settings.fingerprint);
    }
    if (settings?.serverName) {
      params.set("sni", settings.serverName);
    }
    if (settings?.spiderX) {
      // Don't double-encode spiderX - it should be URL encoded once, not twice
      params.set("spx", settings.spiderX);
    }
    
    // Use the first shortId if available
    if (realitySettings.shortIds && realitySettings.shortIds.length > 0) {
      const shortId = realitySettings.shortIds[0];
      if (shortId) {
        params.set("sid", shortId);
      }
    }
  }

  // Add remark as fragment
  if (remark) {
    return `vless://${config.id}@${server}:${port}?${params.toString()}#${encodeURIComponent(remark)}`;
  }
  
  return `vless://${config.id}@${server}:${port}?${params.toString()}`;
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