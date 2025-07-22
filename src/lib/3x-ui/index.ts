// Export all schemas and types
export * from "./schemas";

// Export client classes and errors
export * from "./client";
export * from "./panel-client";

// Export utility functions
export * from "./utils";
export * from "./user-mapping";

// Re-export key types for convenience
export type {
  ThreeXUIConfig,
  ThreeXUIError,
  ThreeXUIAuthError,
  ThreeXUINetworkError,
} from "./client";

export type {
  LoginRequest,
  LoginResponse,
  BaseResponse,
  RawInbound,
  Inbound,
  InboundOptions,
  ParsedInboundSettings,
  Client,
  ClientOptions,
  ClientStats,
  ClientStatsEmbedded,
  ServerStatus,
  OnlineClient,
  OnlineClients,
  ClientIps,
  StreamSettings,
  VmessSettings,
  VlessSettings,
  TrojanSettings,
  ShadowsocksSettings,
  ClientWithInbound,
} from "./schemas";

export type {
  UserClientMapping,
} from "./user-mapping";

// Import for the factory function
import { ThreeXUIPanelClient } from "./panel-client";
import type { ThreeXUIConfig } from "./client";

// Main client class for easy import
export { ThreeXUIPanelClient as ThreeXUIClient } from "./panel-client";

// Utility constants
export const PROTOCOLS = ["vmess", "vless", "trojan", "shadowsocks"] as const;
export const NETWORKS = ["tcp", "kcp", "ws", "http", "domainsocket", "quic", "grpc"] as const;
export const SECURITIES = ["none", "tls", "reality"] as const;

// Version info
export const VERSION = "1.0.0";

/**
 * Create a new 3x-ui panel client instance
 * 
 * @param config Configuration for the 3x-ui panel client
 * @returns New ThreeXUIPanelClient instance
 * 
 * @example
 * ```typescript
 * import { createThreeXUIClient } from './lib/3x-ui';
 * 
 * const client = createThreeXUIClient({
 *   baseUrl: 'https://your-panel.com:2053',
 *   username: 'admin',
 *   password: 'password',
 *   debug: true,
 *   timeout: 30000,
 *   cacheTTL: 300,
 * });
 * 
 * // Test connection
 * const connected = await client.testConnection();
 * console.log('Connected:', connected);
 * 
 * // Get all inbounds
 * const inbounds = await client.getInbounds();
 * console.log('Inbounds:', inbounds);
 * ```
 */
export function createThreeXUIClient(config: ThreeXUIConfig): ThreeXUIPanelClient {
  return new ThreeXUIPanelClient(config);
}

// Default configurations for different use cases
export const DefaultConfigs = {
  /**
   * Development configuration with debug enabled
   */
  development: {
    debug: true,
    timeout: 15000,
    cacheTTL: 60,
    maxRetries: 2,
    retryDelay: 500,
  } as const,

  /**
   * Production configuration optimized for performance
   */
  production: {
    debug: false,
    timeout: 30000,
    cacheTTL: 300,
    maxRetries: 3,
    retryDelay: 1000,
  } as const,

  /**
   * High-performance configuration with aggressive caching
   */
  performance: {
    debug: false,
    timeout: 45000,
    cacheTTL: 600,
    maxRetries: 5,
    retryDelay: 2000,
  } as const,
} as const; 