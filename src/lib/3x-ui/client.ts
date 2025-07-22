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
  type OnlineClient,
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
      const getBodyLength = (body: unknown): number => {
        if (!body) return 0;
        if (typeof body === 'string') return body.length;
        if (body instanceof ArrayBuffer) return body.byteLength;
        if (body instanceof Uint8Array) return body.length;
        return -1; // Unknown type
      };

      this.log(`Making request to: ${url}`, {
        method: options.method ?? "GET",
        retries,
        hasBody: !!options.body,
        bodyLength: getBodyLength(options.body),
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

      // Always add common headers
      headers["User-Agent"] ??= "3x-ui-api-client/1.0.0";
      
      headers.Accept ??= "application/json, text/plain, */*";

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle session cookie from response
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        this.log("Set-Cookie header received", setCookie);
        
        // Parse cookies properly - split by comma but be careful of expires dates
        const cookies = setCookie.split(/,(?=\s*\w+=)/);
        
        // Look for common 3X-UI session cookie names
        const sessionCookie = cookies.find(cookie => {
          const trimmed = cookie.trim().toLowerCase();
          return trimmed.startsWith('session=') || 
                 trimmed.startsWith('3x-ui=') ||
                 trimmed.startsWith('xui=');
        });
        
        if (sessionCookie) {
          // Extract just the session cookie (remove path, expires, etc.)
          this.sessionCookie = sessionCookie.split(';')[0]?.trim() ?? null;
          this.log("Found 3X-UI session cookie", this.sessionCookie);
        } else {
          // Look for any other potential session cookies as fallback
          const fallbackCookie = cookies.find(cookie => {
            const trimmed = cookie.trim().toLowerCase();
            return trimmed.includes('session') || 
                   trimmed.includes('jsessionid') ||
                   trimmed.includes('connect.sid') ||
                   trimmed.includes('ui') ||
                   trimmed.includes('auth');
          });
          
          if (fallbackCookie) {
            this.sessionCookie = fallbackCookie.split(';')[0]?.trim() ?? null;
            this.log("Found fallback session cookie", this.sessionCookie);
          } else {
            this.log("No session cookie found in response");
            this.sessionCookie = null;
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        
        if (response.status === 401) {
          throw new ThreeXUIAuthError(`Authentication failed (401): ${errorText}`);
        }
        if (response.status === 403) {
          throw new ThreeXUIAuthError(`Access forbidden (403): ${errorText}`);
        }
        if (response.status === 404) {
          throw new ThreeXUIError(`API endpoint not found (404): ${url}`);
        }
        if (response.status >= 500) {
          throw new ThreeXUIError(`Server error (${response.status}): ${errorText}`);
        }
        
        throw new ThreeXUIError(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
          response.status
        );
      }

      // Get the response text first to handle empty responses
      const responseText = await response.text();
      this.log(`Response received`, { 
        status: response.status, 
        contentType: response.headers.get('content-type'),
        hasContent: responseText.length > 0
      });

      if (!responseText.trim()) {
        this.log("Empty response received");
        const contentType = response.headers.get('content-type') ?? '';
        
        // Some 3X-UI endpoints legitimately return empty responses
        if (contentType.includes('text/plain') || contentType.includes('text/html')) {
          this.log("Handling empty text response as empty data");
          // Return a basic success response for empty text responses
          const emptyResponse = { success: true, msg: "", obj: null };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return responseSchema.parse(emptyResponse) as z.infer<T>;
        }
        
        throw new ThreeXUIError("Empty response from server");
      }

      let data: unknown;
      try {
        data = JSON.parse(responseText) as z.infer<T>;
      } catch (parseError) {
        this.log("JSON parse error", { responseText, error: parseError });
        throw new ThreeXUIError(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      if (this.config.debug) {
        this.log(`Raw response data:`, data);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return responseSchema.parse(data) as z.infer<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ThreeXUIError || error instanceof z.ZodError) {
        throw error;
      }

      // Handle network errors with retry
      if (retries < this.config.maxRetries) {
        this.log(`Request failed, retrying (${retries + 1}/${this.config.maxRetries})`, {
          error: error instanceof Error ? error.message : String(error),
          endpoint
        });
        await this.delay(this.config.retryDelay * Math.pow(2, retries)); // Exponential backoff
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

      // First clear any existing session
      this.sessionCookie = null;

      const response = await this.makeRequest(
        "/login",
        LoginResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(loginData),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      this.log("Login response received", { 
        success: response.success, 
        message: response.msg,
        hasObj: response.obj !== undefined,
        objValue: response.obj
      });

      if (!response.success) {
        const errorMsg = response.msg || "Authentication failed";
        this.log("Authentication failed", errorMsg);
        throw new ThreeXUIAuthError(errorMsg);
      }

      // Verify we have a session cookie after successful login
      if (!this.sessionCookie) {
        this.log("Warning: Login succeeded but no session cookie received - this might still work");
        // Don't throw error here - some 3X-UI installations might work differently
        // The session might be handled server-side without cookies
      }

      this.log("Authentication successful with session cookie");
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
      this.log("No session cookie found, authenticating...");
      await this.authenticate();
    } else {
      this.log("Using existing session cookie");
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
        this.log("Auth error detected, clearing session and retrying once");
        this.sessionCookie = null;
        this.clearCache(); // Clear cache on auth failure
        
        try {
          await this.ensureAuthenticated();
          
          const data = await this.makeRequest(endpoint, responseSchema, options);
          
          if (cacheKey) {
            this.setCache(cacheKey, data, cacheTTL);
          }
          
          this.log("Request successful after re-authentication");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return data as z.infer<T>;
        } catch (retryError) {
          this.log("Retry after re-authentication failed", retryError);
          throw retryError;
        }
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
      this.log("Testing connection");
      // Clear any existing session for a clean test
      this.sessionCookie = null;
      await this.authenticate();
      this.log("Connection test successful");
      return true;
    } catch (error) {
      this.log("Connection test failed", error);
      return false;
    }
  }

  /**
   * Get all inbounds
   */
  async getInbounds(useCache = true): Promise<Inbound[]> {
        try {
      this.log("Fetching inbounds list");
      
      // Clear cache for fresh data after method change
      if (!useCache) {
        this.clearCache("/panel/api/inbounds/list");
      }
      
      const response = await this.makeAuthenticatedRequest(
        "/panel/api/inbounds/list",
        GetInboundsResponseSchema,
        { method: "GET" },
        useCache
      );

        this.log("Inbounds response received", { success: response.success, hasObj: !!response.obj });

      if (!response.success) {
        this.log("Inbounds request failed", response.msg);
        // Don't throw error, return empty array instead for better resilience
        return [];
      }

      if (!response.obj || !Array.isArray(response.obj)) {
        this.log("No inbounds found or invalid response format");
        return [];
      }

      // Parse raw inbounds to typed inbounds
      const parsedInbounds = response.obj
        .filter(inbound => inbound && typeof inbound === 'object')
        .map((rawInbound, index) => {
          try {
            return parseRawInbound(rawInbound);
          } catch (error) {
            this.log(`Failed to parse inbound at index ${index}`, error);
            return null;
          }
        })
        .filter((inbound): inbound is Inbound => inbound !== null);

      this.log(`Successfully parsed ${parsedInbounds.length} inbounds`);
      return parsedInbounds;
    } catch (error) {
      this.log("Error in getInbounds", error);
      // Return empty array instead of throwing for better resilience
      return [];
    }
  }

  /**
   * Get specific inbound by ID
   */
  async getInbound(id: number, useCache = true): Promise<Inbound | null> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/panel/api/inbounds/get/${id}`,
        GetInboundResponseSchema,
        { method: "GET" },
        useCache
      );

      if (!response.success || !response.obj) {
        return null;
      }

      return parseRawInbound(response.obj);
    } catch (error) {
      this.log(`Error fetching inbound ${id}`, error);
      return null;
    }
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
    try {
      const validatedClient = ClientSchema.parse(client);
      
      this.log(`Adding client ${validatedClient.email} to inbound ${inboundId}`, {
        inboundId,
        clientId: validatedClient.id,
        email: validatedClient.email
      });

      const requestBody = {
        id: inboundId,
        settings: JSON.stringify({ clients: [validatedClient] }),
      };

      this.log("AddClient request body:", requestBody);

      const response = await this.makeAuthenticatedRequest(
        `/panel/api/inbounds/addClient`,
        AddClientResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      this.log(`AddClient response:`, {
        success: response.success,
        message: response.msg,
        inboundId,
        email: validatedClient.email
      });

      if (!response.success) {
        this.log(`Failed to add client: ${response.msg}`, {
          inboundId,
          email: validatedClient.email,
          error: response.msg
        });
        return false;
      }

      // Clear related cache
      this.clearCache(`inbound:${inboundId}`);
      this.clearCache("clients");
      
      return true;
    } catch (error) {
      this.log(`Error in addClient:`, {
        inboundId,
        email: client.email,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
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
    try {
      const response = await this.makeAuthenticatedRequest(
        `/panel/api/inbounds/clientStat/${encodeURIComponent(clientEmail)}`,
        GetClientStatsResponseSchema,
        { method: "GET" },
        useCache
      );

      if (!response.success) {
        this.log(`Client stats request failed for ${clientEmail}`, response.msg);
        return null;
      }

      return response.obj ?? null;
    } catch (error) {
      this.log(`Error fetching client stats for ${clientEmail}`, error);
      return null;
    }
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

    return response.obj?.ips ?? [];
  }

  /**
   * Get online clients
   */
  async getOnlineClients(useCache = true): Promise<OnlineClients> {
    try {
      const response = await this.makeAuthenticatedRequest(
        "/panel/api/inbounds/onlines",
        GetOnlineClientsResponseSchema,
        { method: "POST" },
        useCache,
        60 // Cache for 1 minute only for online status
      );

      if (!response.success) {
        this.log("Online clients request failed", response.msg);
        return [];
      }

      const onlineData = response.obj ?? [];
      
      // Handle different response formats
      if (Array.isArray(onlineData)) {
        // If it's an array of strings (just usernames), convert to objects
        if (onlineData.length > 0 && typeof onlineData[0] === 'string') {
          this.log("Converting string array to online client objects");
          return (onlineData as string[]).map((username: string): OnlineClient => ({
            email: username,
            ip: "unknown",
            port: 0,
            protocol: "unknown",
            user: username,
            source: "unknown",
            reset: "",
          }));
        }
        
        // If it's already an array of objects, return as-is
        return onlineData as OnlineClient[];
      }

      return [];
    } catch (error) {
      this.log("Error fetching online clients", error);
      return [];
    }
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
    try {
      const response = await this.makeAuthenticatedRequest(
        "/panel/api/server/status",
        GetServerStatusResponseSchema,
        { method: "GET" },
        useCache,
        30 // Cache for 30 seconds only for server status
      );

      if (!response.success) {
        this.log("Server status request failed", response.msg);
        return null;
      }

      return response.obj ?? null;
    } catch (error) {
      this.log("Error fetching server status", error);
      return null;
    }
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
    try {
      const response = await this.makeAuthenticatedRequest(
        "/panel/api/server/getLogs",
        BaseResponseSchema,
        { method: "GET" }
      );

      if (!response.success) {
        this.log("Server logs request failed", response.msg);
        return `Error fetching logs: ${response.msg || "Unknown error"}`;
      }

      // Handle empty logs (no logs available)
      if (response.obj === null || response.obj === undefined) {
        return "No logs available";
      }

      return (response.obj as string) || "No logs available";
    } catch (error) {
      this.log("Error fetching server logs", error);
      return `Error fetching logs: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
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