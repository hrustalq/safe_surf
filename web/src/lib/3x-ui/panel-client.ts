import { ThreeXUIClient, type ThreeXUIConfig } from "./client";
import { type InboundOptions, type Client, type ClientWithInbound } from "./schemas";

/**
 * Concrete implementation of the 3x-ui panel client
 * Extends the abstract base class with additional utility methods
 */
export class ThreeXUIPanelClient extends ThreeXUIClient {
  constructor(config: ThreeXUIConfig) {
    super(config);
  }

  /**
   * Find client by email across all inbounds
   */
  async findClientByEmail(email: string): Promise<ClientWithInbound | null> {
    const inbounds = await this.getInbounds();
    
    for (const inbound of inbounds) {
      const client = inbound.settings.clients.find(c => c.email === email);
      if (client) {
        return { inbound, client };
      }
    }

    return null;
  }

  /**
   * Find client by ID (UUID) across all inbounds
   */
  async findClientById(clientId: string): Promise<ClientWithInbound | null> {
    const inbounds = await this.getInbounds();
    
    for (const inbound of inbounds) {
      const client = inbound.settings.clients.find(c => c.id === clientId);
      if (client) {
        return { inbound, client };
      }
    }

    return null;
  }

  /**
   * Get all clients across all inbounds
   */
  async getAllClients(): Promise<ClientWithInbound[]> {
    const inbounds = await this.getInbounds();
    const allClients: ClientWithInbound[] = [];

    for (const inbound of inbounds) {
      for (const client of inbound.settings.clients) {
        allClients.push({ inbound, client });
      }
    }

    return allClients;
  }

  /**
   * Get inbound statistics summary
   */
  async getInboundsSummary(): Promise<{
    totalInbounds: number;
    totalClients: number;
    totalTraffic: { up: number; down: number };
    enabledInbounds: number;
    expiredInbounds: number;
  }> {
    const inbounds = await this.getInbounds();
    const now = Date.now();

    let totalClients = 0;
    let totalUp = 0;
    let totalDown = 0;
    let enabledInbounds = 0;
    let expiredInbounds = 0;

    for (const inbound of inbounds) {
      if (inbound.enable) enabledInbounds++;
      if (inbound.expiryTime > 0 && inbound.expiryTime < now) expiredInbounds++;
      
      totalUp += inbound.up || 0;
      totalDown += inbound.down || 0;
      totalClients += inbound.settings.clients.length;
    }

    return {
      totalInbounds: inbounds.length,
      totalClients,
      totalTraffic: { up: totalUp, down: totalDown },
      enabledInbounds,
      expiredInbounds,
    };
  }

  /**
   * Check if client has expired
   */
  isClientExpired(client: Client): boolean {
    if (!client.expiryTime) return false;
    return client.expiryTime > 0 && client.expiryTime < Date.now();
  }

  /**
   * Check if client has depleted traffic
   */
  isClientDepleted(client: Client, stats?: { up: number; down: number }): boolean {
    if (!client.totalGB || client.totalGB === 0) return false;
    
    const totalBytes = client.totalGB * 1024 * 1024 * 1024;
    const usedBytes = stats ? (stats.up + stats.down) : 0;
    
    return usedBytes >= totalBytes;
  }

  /**
   * Get expired clients across all inbounds
   */
  async getExpiredClients(): Promise<ClientWithInbound[]> {
    const allClients = await this.getAllClients();
    return allClients.filter(({ client }) => this.isClientExpired(client));
  }

  /**
   * Enable/disable inbound
   */
  async toggleInbound(id: number, enable: boolean): Promise<boolean> {
    const inbound = await this.getInbound(id);
    if (!inbound) throw new Error(`Inbound with ID ${id} not found`);

    return this.updateInbound(id, { enable });
  }

  /**
   * Enable/disable client
   */
  async toggleClient(inboundId: number, clientId: string, enable: boolean): Promise<boolean> {
    return this.updateClient(inboundId, clientId, { enable });
  }

  /**
   * Generate a random client ID (UUID v4)
   */
  generateClientId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a random password for Trojan/Shadowsocks
   */
  generatePassword(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create a basic VMESS inbound
   */
  async createVmessInbound(options: {
    remark: string;
    port: number;
    clients?: Array<{ email?: string; id?: string }>;
    network?: "tcp" | "ws" | "grpc" | "http";
    security?: "none" | "tls" | "reality";
  }): Promise<boolean> {
    const clients: Client[] = (options.clients ?? []).map(client => ({
      id: client.id ?? this.generateClientId(),
      email: client.email ?? `client_${Date.now()}@example.com`,
      limitIp: 0,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: "",
      subId: "",
      reset: 0,
      flow: "",
    }));

    const inboundOptions: InboundOptions = {
      remark: options.remark,
      port: options.port,
      protocol: "vmess",
      settings: {
        clients,
        decryption: "none",
        fallbacks: [],
      },
      streamSettings: {
        network: options.network ?? "tcp",
        security: options.security ?? "none",
        externalProxy: [],
      },
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
    };

    return this.addInbound(inboundOptions);
  }

  /**
   * Create a basic VLESS inbound
   */
  async createVlessInbound(options: {
    remark: string;
    port: number;
    clients?: Array<{ email?: string; id?: string }>;
    network?: "tcp" | "ws" | "grpc" | "http";
    security?: "none" | "tls" | "reality";
    flow?: string;
  }): Promise<boolean> {
    const clients: Client[] = (options.clients ?? []).map(client => ({
      id: client.id ?? this.generateClientId(),
      email: client.email ?? `client_${Date.now()}@example.com`,
      limitIp: 0,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: "",
      subId: "",
      reset: 0,
      flow: options.flow ?? "",
    }));

    const inboundOptions: InboundOptions = {
      remark: options.remark,
      port: options.port,
      protocol: "vless",
      settings: {
        clients,
        decryption: "none",
        fallbacks: [],
      },
      streamSettings: {
        network: options.network ?? "tcp",
        security: options.security ?? "none",
        externalProxy: [],
      },
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
    };

    return this.addInbound(inboundOptions);
  }

  /**
   * Create a basic Trojan inbound
   */
  async createTrojanInbound(options: {
    remark: string;
    port: number;
    clients?: Array<{ email?: string; password?: string }>;
    network?: "tcp" | "ws" | "grpc" | "http";
    security?: "none" | "tls" | "reality";
    flow?: string;
  }): Promise<boolean> {
    const clients: Client[] = (options.clients ?? []).map(client => ({
      id: this.generateClientId(), // Still need ID for database
      email: client.email ?? `client_${Date.now()}@example.com`,
      limitIp: 0,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: "",
      subId: "",
      reset: 0,
      flow: options.flow ?? "",
    }));

    const inboundOptions: InboundOptions = {
      remark: options.remark,
      port: options.port,
      protocol: "trojan",
      settings: {
        clients,
        decryption: "none",
        fallbacks: [],
      },
      streamSettings: {
        network: options.network ?? "tcp",
        security: options.security ?? "tls", // Trojan typically uses TLS
        externalProxy: [],
      },
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
    };

    return this.addInbound(inboundOptions);
  }

  /**
   * Get comprehensive panel information
   */
  async getPanelInfo(): Promise<{
    serverStatus: Awaited<ReturnType<ThreeXUIPanelClient["getServerStatus"]>>;
    inboundsSummary: Awaited<ReturnType<ThreeXUIPanelClient["getInboundsSummary"]>>;
    onlineClients: Awaited<ReturnType<ThreeXUIPanelClient["getOnlineClients"]>>;
    expiredClients: ClientWithInbound[];
    connectionStatus: boolean;
  }> {
    const [serverStatus, inboundsSummary, onlineClients, expiredClients, connectionStatus] = await Promise.all([
      this.getServerStatus().catch(() => null),
      this.getInboundsSummary().catch(() => null),
      this.getOnlineClients().catch(() => []),
      this.getExpiredClients().catch(() => []),
      this.testConnection(),
    ]);

    return {
      serverStatus,
      inboundsSummary: inboundsSummary ?? {
        totalInbounds: 0,
        totalClients: 0,
        totalTraffic: { up: 0, down: 0 },
        enabledInbounds: 0,
        expiredInbounds: 0,
      },
      onlineClients,
      expiredClients,
      connectionStatus,
    };
  }

  /**
   * Bulk operations: Add multiple clients to an inbound
   */
  async addMultipleClients(inboundId: number, clientsData: Array<Partial<Client> & { email: string }>): Promise<boolean> {
    const clients: Client[] = clientsData.map(clientData => ({
      id: clientData.id ?? this.generateClientId(),
      email: clientData.email,
      limitIp: clientData.limitIp ?? 0,
      totalGB: clientData.totalGB ?? 0,
      expiryTime: clientData.expiryTime ?? 0,
      enable: clientData.enable ?? true,
      tgId: clientData.tgId ?? "",
      subId: clientData.subId ?? "",
      reset: clientData.reset ?? 0,
      flow: clientData.flow ?? "",
    }));

    // Add clients one by one (3x-ui doesn't support bulk add in a single request)
    let allSuccess = true;
    for (const client of clients) {
      try {
        const success = await this.addClient(inboundId, client);
        if (!success) allSuccess = false;
      } catch (error) {
        this.log(`Failed to add client ${client.email}:`, error);
        allSuccess = false;
      }
    }

    return allSuccess;
  }

  /**
   * Get client usage statistics with calculated percentages
   */
  async getClientUsage(clientEmail: string): Promise<{
    stats: Awaited<ReturnType<ThreeXUIPanelClient["getClientStats"]>>;
    usage: {
      trafficUsedGB: number;
      trafficTotalGB: number;
      trafficUsedPercent: number;
      isExpired: boolean;
      isDepleted: boolean;
      daysUntilExpiry: number;
    } | null;
  }> {
    const stats = await this.getClientStats(clientEmail);
    
    if (!stats) {
      return { stats: null, usage: null };
    }

    const clientInfo = await this.findClientByEmail(clientEmail);
    const client = clientInfo?.client;

    if (!client) {
      return { stats, usage: null };
    }

    const trafficUsedBytes = (stats.up || 0) + (stats.down || 0);
    const trafficUsedGB = trafficUsedBytes / (1024 * 1024 * 1024);
    const trafficTotalGB = client.totalGB || 0;
    const trafficUsedPercent = trafficTotalGB > 0 ? (trafficUsedGB / trafficTotalGB) * 100 : 0;

    const isExpired = this.isClientExpired(client);
    const isDepleted = this.isClientDepleted(client, stats);

    const daysUntilExpiry = client.expiryTime > 0 
      ? Math.max(0, Math.ceil((client.expiryTime - Date.now()) / (1000 * 60 * 60 * 24)))
      : -1;

    return {
      stats,
      usage: {
        trafficUsedGB: Number(trafficUsedGB.toFixed(2)),
        trafficTotalGB,
        trafficUsedPercent: Number(trafficUsedPercent.toFixed(2)),
        isExpired,
        isDepleted,
        daysUntilExpiry,
      },
    };
  }
} 