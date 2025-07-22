import { z } from "zod";
import {
  BaseResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  InboundOptionsSchema,
  ClientSchema,
  GetInboundsResponseSchema,
  GetInboundResponseSchema,
  AddInboundResponseSchema,
  UpdateInboundResponseSchema,
  AddClientResponseSchema,
  UpdateClientResponseSchema,
  GetClientStatsResponseSchema,
  GetServerStatusResponseSchema,
  GetOnlineClientsResponseSchema,
  GetClientIpsResponseSchema,
  SendBackupResponseSchema,
  parseRawInbound,
  type Inbound,
  type InboundOptions,
  type Client,
  type ClientStats,
  type ServerStatus,
  type OnlineClients,
} from "./schemas";

/**
 * Configuration interface for the 3x-ui API client
 */
export interface ThreeXUIConfig {
  /** Base URL of the 3x-ui panel (e.g., https://your-domain.com:2053) */
  baseUrl: string;
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Cache TTL in seconds (default: 300) */
  cacheTTL?: number;
  /** Max retry attempts (default: 3) */
  maxRetries?: number;
  /** Retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Error types for better error handling
 */
export class ThreeXUIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ThreeXUIError";
  }
}

export class ThreeXUIAuthError extends ThreeXUIError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "ThreeXUIAuthError";
  }
}

export class ThreeXUINetworkError extends ThreeXUIError {
  constructor(message: string, originalError?: unknown) {
    super(message, undefined, originalError);
    this.name = "ThreeXUINetworkError";
  }
}

/**
 * Abstract base class for 3x-ui panel API integration
 * Provides authentication, session management, caching, and error handling
 */
export abstract class ThreeXUIClient {
  protected readonly config: Required<ThreeXUIConfig>;
  protected sessionCookie: string | null = null;
  protected readonly cache = new Map<string, CacheEntry<unknown>>();
  protected isAuthenticating = false;
  protected authPromise: Promise<void> | null = null;

  constructor(config: ThreeXUIConfig) {
    this.config = {
      timeout: 30000,
      debug: false,
      cacheTTL: 300,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    // Validate base URL
    try {
      new URL(this.config.baseUrl);
    } catch {
      throw new ThreeXUIError("Invalid base URL provided");
    }

    this.log("ThreeXUIClient initialized", { baseUrl: this.config.baseUrl });
  }

  /**
   * Log messages if debug is enabled
   */
  protected log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(`[3x-ui] ${message}`, data ?? "");
    }
  }

  /**
   * Get from cache if valid
   */
  protected getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    this.log(`Cache hit for key: ${key}`);
    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  protected setCache<T>(key: string, data: T, ttl?: number): void {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.cacheTTL,
    };
    this.cache.set(key, cacheEntry);
    this.log(`Cached data for key: ${key}`);
  }

  /**
   * Clear cache by pattern or all
   */
  protected clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.log("Cleared all cache");
      return;
    }

    const keys = Array.from(this.cache.keys()).filter((key) =>
      key.includes(pattern)
    );
    keys.forEach((key) => this.cache.delete(key));
    this.log(`Cleared cache for pattern: ${pattern}`);
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async makeRequest<T extends z.ZodTypeAny>(
    endpoint: string,
    responseSchema: T,
    options: RequestInit = {},
    retries = 0
  ): Promise<z.infer<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      this.log(`Making request to: ${url}`, {
        method: options.method ?? "GET",
        retries,
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "3x-ui-api-client/1.0.0",
        ...(options.headers as Record<string, string>),
      };

      // Add session cookie if available
      if (this.sessionCookie) {
        headers.Cookie = this.sessionCookie;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle session cookie from response
      const setCookie = response.headers.get("set-cookie");
      if (setCookie?.includes("session")) {
        this.sessionCookie = setCookie.split(";")[0] ?? null;
        this.log("Updated session cookie");
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new ThreeXUIAuthError(`Authentication failed: ${response.status}`);
        }
        throw new ThreeXUIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as z.infer<T>;
      this.log(`Response received`, { status: response.status });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return responseSchema.parse(data) as z.infer<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ThreeXUIError || error instanceof z.ZodError) {
        throw error;
      }

      // Handle network errors with retry
      if (retries < this.config.maxRetries) {
        this.log(`Request failed, retrying (${retries + 1}/${this.config.maxRetries})`);
        await this.delay(this.config.retryDelay * (retries + 1));
        return this.makeRequest(endpoint, responseSchema, options, retries + 1);
      }

      throw new ThreeXUINetworkError(
        `Network request failed after ${this.config.maxRetries} retries`,
        error
      );
    }
  }

  /**
   * Delay utility for retries
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Authenticate with the panel
   */
  protected async authenticate(): Promise<void> {
    if (this.isAuthenticating && this.authPromise) {
      await this.authPromise;
      return;
    }

    this.isAuthenticating = true;
    this.authPromise = this._authenticate();

    try {
      await this.authPromise;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = null;
    }
  }

  private async _authenticate(): Promise<void> {
    try {
      this.log("Starting authentication");

      const loginData = LoginRequestSchema.parse({
        username: this.config.username,
        password: this.config.password,
      });

      const response = await this.makeRequest(
        "/login",
        LoginResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(loginData),
        }
      );

      if (!response.success) {
        throw new ThreeXUIAuthError(response.msg || "Authentication failed");
      }

      this.log("Authentication successful");
    } catch (error) {
      this.sessionCookie = null;
      this.log("Authentication failed", error);
      throw error;
    }
  }

  /**
   * Ensure authenticated before making requests
   */
  protected async ensureAuthenticated(): Promise<void> {
    if (!this.sessionCookie) {
      await this.authenticate();
    }
  }

  /**
   * Make authenticated request with auto-retry on auth failure
   */
  protected async makeAuthenticatedRequest<T extends z.ZodTypeAny>(
    endpoint: string,
    responseSchema: T,
    options: RequestInit = {},
    useCache = false,
    cacheTTL?: number
  ): Promise<z.infer<T>> {
    const cacheKey = useCache ? `${endpoint}:${JSON.stringify(options)}` : null;

    // Check cache first
    if (cacheKey) {
      const cached = this.getFromCache<z.infer<T>>(cacheKey);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (cached) return cached as z.infer<T>;
    }

    await this.ensureAuthenticated();

    try {
      const data = await this.makeRequest(endpoint, responseSchema, options);

      // Cache successful responses
      if (cacheKey) {
        this.setCache(cacheKey, data, cacheTTL);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data as z.infer<T>;
    } catch (error) {
      // If auth error, clear session and retry once
      if (error instanceof ThreeXUIAuthError) {
        this.log("Auth error, clearing session and retrying");
        this.sessionCookie = null;
        await this.ensureAuthenticated();
        
        const data = await this.makeRequest(endpoint, responseSchema, options);
        
        if (cacheKey) {
          this.setCache(cacheKey, data, cacheTTL);
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data as z.infer<T>;
      }
      throw error;
    }
  }

  // ===== PUBLIC API METHODS =====

  /**
   * Test connection to the panel
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all inbounds
   */
  async getInbounds(useCache = true): Promise<Inbound[]> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/inbounds/list",
      GetInboundsResponseSchema,
      { method: "POST" },
      useCache
    );

    if (!response.obj) {
      return [];
    }

    // Parse raw inbounds to typed inbounds
    return response.obj.map(parseRawInbound);
  }

  /**
   * Get specific inbound by ID
   */
  async getInbound(id: number, useCache = true): Promise<Inbound | null> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/get/${id}`,
      GetInboundResponseSchema,
      { method: "GET" },
      useCache
    );

    if (!response.obj) {
      return null;
    }

    return parseRawInbound(response.obj);
  }

  /**
   * Add new inbound
   */
  async addInbound(options: InboundOptions): Promise<boolean> {
    const validatedOptions = InboundOptionsSchema.parse(options);

    // Convert settings to JSON strings as expected by the API
    const requestData = {
      ...validatedOptions,
      settings: JSON.stringify(validatedOptions.settings),
      streamSettings: JSON.stringify(validatedOptions.streamSettings),
      sniffing: JSON.stringify(validatedOptions.sniffing),
      ...(validatedOptions.allocate && {
        allocate: JSON.stringify(validatedOptions.allocate),
      }),
    };

    const response = await this.makeAuthenticatedRequest(
      "/panel/api/inbounds/add",
      AddInboundResponseSchema,
      {
        method: "POST",
        body: JSON.stringify(requestData),
      }
    );

    // Clear inbounds cache after adding
    this.clearCache("inbounds");
    
    return response.success;
  }

  /**
   * Update inbound
   */
  async updateInbound(id: number, options: Partial<InboundOptions>): Promise<boolean> {
    const requestData: Record<string, unknown> = { id, ...options };
    
    // Convert settings to JSON strings if provided
    if (options.settings) {
      requestData.settings = JSON.stringify(options.settings);
    }
    if (options.streamSettings) {
      requestData.streamSettings = JSON.stringify(options.streamSettings);
    }
    if (options.sniffing) {
      requestData.sniffing = JSON.stringify(options.sniffing);
    }
    if (options.allocate) {
      requestData.allocate = JSON.stringify(options.allocate);
    }

    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/update/${id}`,
      UpdateInboundResponseSchema,
      {
        method: "POST",
        body: JSON.stringify(requestData),
      }
    );

    // Clear related cache
    this.clearCache("inbounds");
    this.clearCache(`inbound:${id}`);
    
    return response.success;
  }

  /**
   * Delete inbound
   */
  async deleteInbound(id: number): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/del/${id}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear related cache
    this.clearCache("inbounds");
    this.clearCache(`inbound:${id}`);
    
    return response.success;
  }

  /**
   * Reset all inbound statistics
   */
  async resetAllInboundsStats(): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/inbounds/resetAllTraffics",
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear stats cache
    this.clearCache("stats");
    
    return response.success;
  }

  /**
   * Reset specific inbound statistics
   */
  async resetInboundStats(id: number): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/resetAllClientTraffics/${id}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear stats cache
    this.clearCache("stats");
    this.clearCache(`inbound:${id}`);
    
    return response.success;
  }

  /**
   * Add client to inbound
   */
  async addClient(inboundId: number, client: Client): Promise<boolean> {
    const validatedClient = ClientSchema.parse(client);

    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/addClient`,
      AddClientResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({
          id: inboundId,
          settings: JSON.stringify({ clients: [validatedClient] }),
        }),
      }
    );

    // Clear related cache
    this.clearCache(`inbound:${inboundId}`);
    this.clearCache("clients");
    
    return response.success;
  }

  /**
   * Update client
   */
  async updateClient(inboundId: number, clientId: string, updates: Partial<Client>): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/updateClient/${clientId}`,
      UpdateClientResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({
          id: inboundId,
          settings: JSON.stringify(updates),
        }),
      }
    );

    // Clear related cache
    this.clearCache(`inbound:${inboundId}`);
    this.clearCache(`client:${clientId}`);
    
    return response.success;
  }

  /**
   * Delete client
   */
  async deleteClient(inboundId: number, clientId: string): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/${inboundId}/delClient/${clientId}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear related cache
    this.clearCache(`inbound:${inboundId}`);
    this.clearCache(`client:${clientId}`);
    
    return response.success;
  }

  /**
   * Reset client traffic statistics
   */
  async resetClientStats(inboundId: number, clientEmail: string): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/resetClientTraffic/${clientEmail}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear stats cache
    this.clearCache("stats");
    this.clearCache(`client:${clientEmail}`);
    
    return response.success;
  }

  /**
   * Reset client IPs
   */
  async resetClientIps(clientEmail: string): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/resetClientIps/${clientEmail}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    return response.success;
  }

  /**
   * Get client statistics
   */
  async getClientStats(clientEmail: string, useCache = true): Promise<ClientStats | null> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/clientStat/${clientEmail}`,
      GetClientStatsResponseSchema,
      { method: "GET" },
      useCache
    );

    return response.obj || null;
  }

  /**
   * Get client IPs
   */
  async getClientIps(clientEmail: string, useCache = true): Promise<string[]> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/clientIps/${clientEmail}`,
      GetClientIpsResponseSchema,
      { method: "GET" },
      useCache
    );

    return response.obj?.ips || [];
  }

  /**
   * Get online clients
   */
  async getOnlineClients(useCache = true): Promise<OnlineClients> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/inbounds/onlines",
      GetOnlineClientsResponseSchema,
      { method: "POST" },
      useCache,
      60 // Cache for 1 minute only for online status
    );

    return response.obj || [];
  }

  /**
   * Delete all depleted clients
   */
  async deleteDepletedClients(): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/inbounds/delDepletedClients",
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear clients cache
    this.clearCache("clients");
    this.clearCache("inbounds");
    
    return response.success;
  }

  /**
   * Delete depleted clients from specific inbound
   */
  async deleteInboundDepletedClients(inboundId: number): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      `/panel/api/inbounds/delDepletedClients/${inboundId}`,
      BaseResponseSchema,
      { method: "POST" }
    );

    // Clear related cache
    this.clearCache(`inbound:${inboundId}`);
    
    return response.success;
  }

  /**
   * Get server status
   */
  async getServerStatus(useCache = true): Promise<ServerStatus | null> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/server/status",
      GetServerStatusResponseSchema,
      { method: "POST" },
      useCache,
      30 // Cache for 30 seconds only for server status
    );

    return response.obj || null;
  }

  /**
   * Send backup via Telegram
   */
  async sendBackup(): Promise<boolean> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/server/sendBackup",
      SendBackupResponseSchema,
      { method: "POST" }
    );

    return response.success;
  }

  /**
   * Get server logs
   */
  async getServerLogs(): Promise<string> {
    const response = await this.makeAuthenticatedRequest(
      "/panel/api/server/getLogs",
      BaseResponseSchema,
      { method: "POST" }
    );

    return response.obj as string || "";
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      await this.makeAuthenticatedRequest("/logout", BaseResponseSchema, { method: "POST" });
    } catch {
      // Ignore errors during logout
    } finally {
      this.sessionCookie = null;
      this.clearCache();
      this.log("Logged out and cleared cache");
    }
  }
} 