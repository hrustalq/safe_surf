import { z } from "zod";

// Base response schema for all API responses
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  obj: z.any().optional(),
});

// Authentication schemas
export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const LoginResponseSchema = BaseResponseSchema.extend({
  obj: z
    .object({
      session: z.string().optional(),
      token: z.string().optional(),
    })
    .optional(),
});

// Client configuration schemas for different protocols
export const VmessSettingsSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  alterId: z.number().int().min(0).max(65535).default(0),
  security: z.enum(["auto", "none", "chacha20-poly1305", "aes-128-gcm"]).default("auto"),
});

export const VlessSettingsSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  flow: z.enum(["", "xtls-rprx-vision", "xtls-rprx-vision-udp443"]).default(""),
  encryption: z.enum(["none"]).default("none"),
});

export const TrojanSettingsSchema = z.object({
  password: z.string().min(1, "Password is required"),
  flow: z.enum(["", "xtls-rprx-vision", "xtls-rprx-vision-udp443"]).default(""),
});

export const ShadowsocksSettingsSchema = z.object({
  password: z.string().min(1, "Password is required"),
  method: z.enum([
    "aes-128-gcm",
    "aes-256-gcm", 
    "chacha20-ietf-poly1305",
    "xchacha20-ietf-poly1305",
    "2022-blake3-aes-128-gcm",
    "2022-blake3-aes-256-gcm",
    "2022-blake3-chacha20-poly1305"
  ]).default("chacha20-ietf-poly1305"),
});

// Stream settings schemas
export const TcpSettingsSchema = z.object({
  acceptProxyProtocol: z.boolean().default(false),
  header: z.object({
    type: z.enum(["none", "http"]).default("none"),
    request: z.object({
      version: z.string().default("1.1"),
      method: z.string().default("GET"),
      path: z.array(z.string()).default(["/"]),
      headers: z.record(z.array(z.string())).default({}),
    }).optional(),
    response: z.object({
      version: z.string().default("1.1"),
      status: z.string().default("200"),
      reason: z.string().default("OK"),
      headers: z.record(z.array(z.string())).default({}),
    }).optional(),
  }),
});

export const WebsocketSettingsSchema = z.object({
  acceptProxyProtocol: z.boolean().default(false),
  path: z.string().default("/"),
  host: z.string().default(""),
  headers: z.record(z.string()).default({}),
});

export const HttpSettingsSchema = z.object({
  host: z.array(z.string()).default([]),
  path: z.string().default("/"),
});

export const GrpcSettingsSchema = z.object({
  serviceName: z.string().default(""),
  multiMode: z.boolean().default(false),
});

export const StreamSettingsSchema = z.object({
  network: z.enum(["tcp", "kcp", "ws", "http", "domainsocket", "quic", "grpc"]).default("tcp"),
  security: z.enum(["none", "tls", "reality"]).default("none"),
  externalProxy: z.array(z.object({
    forceTls: z.enum(["none", "tls", "same"]).default("same"),
    dest: z.string(),
    port: z.number().int().min(1).max(65535),
    remark: z.string().default(""),
  })).default([]),
  tcpSettings: TcpSettingsSchema.optional(),
  kcpSettings: z.object({
    mtu: z.number().int().min(576).max(1460).default(1350),
    tti: z.number().int().min(10).max(100).default(50),
    uplinkCapacity: z.number().int().min(0).default(5),
    downlinkCapacity: z.number().int().min(0).default(20),
    congestion: z.boolean().default(false),
    readBufferSize: z.number().int().min(1).default(2),
    writeBufferSize: z.number().int().min(1).default(2),
    header: z.object({
      type: z.enum(["none", "srtp", "utp", "wechat-video", "dtls", "wireguard"]).default("none"),
    }),
  }).optional(),
  wsSettings: WebsocketSettingsSchema.optional(),
  httpSettings: HttpSettingsSchema.optional(),
  dsSettings: z.object({
    path: z.string(),
  }).optional(),
  quicSettings: z.object({
    security: z.string().default("none"),
    key: z.string().default(""),
    header: z.object({
      type: z.string().default("none"),
    }),
  }).optional(),
  grpcSettings: GrpcSettingsSchema.optional(),
  tlsSettings: z.object({
    serverName: z.string().default(""),
    rejectUnknownSni: z.boolean().default(false),
    allowInsecure: z.boolean().default(false),
    minVersion: z.string().default("1.2"),
    maxVersion: z.string().default("1.3"),
    cipherSuites: z.string().default(""),
    certificates: z.array(z.object({
      certificateFile: z.string().default(""),
      keyFile: z.string().default(""),
      certificate: z.array(z.string()).default([]),
      key: z.array(z.string()).default([]),
      usage: z.enum(["encipherment", "verify", "issue"]).default("encipherment"),
      ocspStapling: z.number().int().default(3600),
      oneTimeLoading: z.boolean().default(false),
      buildChain: z.boolean().default(false),
    })).default([]),
    alpn: z.array(z.string()).default([]),
    settings: z.object({
      allowInsecure: z.boolean().default(false),
      fingerprint: z.string().default(""),
    }).default({}),
  }).optional(),
  realitySettings: z.object({
    show: z.boolean().default(false),
    xver: z.number().int().min(0).max(2).default(0),
    dest: z.string().default(""),
    serverNames: z.array(z.string()).default([]),
    privateKey: z.string().default(""),
    minClient: z.string().default(""),
    maxClient: z.string().default(""),
    maxTimediff: z.number().int().min(0).default(0),
    shortIds: z.array(z.string()).default([]),
    settings: z.object({
      publicKey: z.string().default(""),
      fingerprint: z.string().default(""),
      serverName: z.string().default(""),
      spiderX: z.string().default(""),
    }).default({}),
  }).optional(),
});

// Sniffing settings
export const SniffingSchema = z.object({
  enabled: z.boolean().default(false),
  destOverride: z.array(z.enum(["http", "tls", "quic", "fakedns"])).default(["http", "tls"]),
  metadataOnly: z.boolean().default(false),
  routeOnly: z.boolean().default(false),
});

// Allocate settings
export const AllocateSchema = z.object({
  strategy: z.enum(["always", "random"]).default("always"),
  refresh: z.number().int().min(1).default(5),
  concurrency: z.number().int().min(1).default(3),
});

// Client schema - this is the parsed client object
export const ClientSchema = z.object({
  id: z.string().uuid("Invalid client ID format"),
  flow: z.string().default(""),
  email: z.string().email("Invalid email format").optional(),
  limitIp: z.number().int().min(0).default(0),
  totalGB: z.number().int().min(0).default(0),
  expiryTime: z.number().int().min(0).default(0),
  enable: z.boolean().default(true),
  tgId: z.string().default(""),
  subId: z.string().default(""),
  reset: z.number().int().min(0).default(0),
});

// Client options for different protocols
export const ClientOptionsSchema = z.discriminatedUnion("protocol", [
  z.object({
    protocol: z.literal("vmess"),
    settings: VmessSettingsSchema,
  }),
  z.object({
    protocol: z.literal("vless"),
    settings: VlessSettingsSchema,
  }),
  z.object({
    protocol: z.literal("trojan"),
    settings: TrojanSettingsSchema,
  }),
  z.object({
    protocol: z.literal("shadowsocks"),
    settings: ShadowsocksSettingsSchema,
  }),
]);

// Parsed inbound settings (after JSON parsing)
export const ParsedInboundSettingsSchema = z.object({
  clients: z.array(ClientSchema).default([]),
  decryption: z.string().default("none"),
  fallbacks: z.array(z.record(z.unknown())).default([]),
});

// Client statistics embedded in inbound
export const ClientStatsEmbeddedSchema = z.object({
  id: z.number().int().positive(),
  inboundId: z.number().int().positive(),
  enable: z.boolean().default(true),
  email: z.string().email().default(""),
  up: z.number().int().min(0).default(0),
  down: z.number().int().min(0).default(0),
  expiryTime: z.number().int().min(0).default(0),
  total: z.number().int().min(0).default(0),
  reset: z.number().int().min(0).default(0),
});

// Raw inbound schema (as received from API)
export const RawInboundSchema = z.object({
  id: z.number().int().positive().optional(),
  up: z.number().int().min(0).default(0),
  down: z.number().int().min(0).default(0),
  total: z.number().int().min(0).default(0),
  remark: z.string().min(1, "Remark is required"),
  enable: z.boolean().default(true),
  expiryTime: z.number().int().min(0).default(0),
  clientStats: z.array(ClientStatsEmbeddedSchema).default([]),
  listen: z.string().ip().default(""),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(["vmess", "vless", "trojan", "shadowsocks", "dokodemo-door", "socks", "http"]),
  settings: z.string(),
  streamSettings: z.string(),
  tag: z.string().default(""),
  sniffing: z.string(),
  allocate: z.string().optional(),
});

// Parsed inbound schema (with parsed JSON fields)
export const InboundSchema = z.object({
  id: z.number().int().positive().optional(),
  up: z.number().int().min(0).default(0),
  down: z.number().int().min(0).default(0),
  total: z.number().int().min(0).default(0),
  remark: z.string().min(1, "Remark is required"),
  enable: z.boolean().default(true),
  expiryTime: z.number().int().min(0).default(0),
  clientStats: z.array(ClientStatsEmbeddedSchema).default([]),
  listen: z.string().ip().default(""),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(["vmess", "vless", "trojan", "shadowsocks", "dokodemo-door", "socks", "http"]),
  settings: ParsedInboundSettingsSchema,
  streamSettings: StreamSettingsSchema,
  tag: z.string().default(""),
  sniffing: SniffingSchema,
  allocate: AllocateSchema.optional(),
});

// Inbound options for creation/update
export const InboundOptionsSchema = z.object({
  remark: z.string().min(1, "Remark is required"),
  enable: z.boolean().default(true),
  listen: z.string().ip().default(""),
  port: z.number().int().min(1).max(65535),
  protocol: z.enum(["vmess", "vless", "trojan", "shadowsocks", "dokodemo-door", "socks", "http"]),
  expiryTime: z.number().int().min(0).default(0),
  settings: ParsedInboundSettingsSchema,
  streamSettings: StreamSettingsSchema,
  tag: z.string().default(""),
  sniffing: SniffingSchema.default({}),
  allocate: AllocateSchema.optional(),
});

// Client statistics schema
export const ClientStatsSchema = z.object({
  id: z.number().int().positive(),
  inboundId: z.number().int().positive(),
  enable: z.boolean(),
  email: z.string().email(),
  up: z.number().int().min(0),
  down: z.number().int().min(0),
  expiryTime: z.number().int().min(0),
  total: z.number().int().min(0),
  reset: z.number().int().min(0),
});

// Server status schema
export const ServerStatusSchema = z.object({
  cpu: z.number().min(0).max(100),
  mem: z.object({
    current: z.number().min(0),
    total: z.number().min(0),
  }),
  swap: z.object({
    current: z.number().min(0),
    total: z.number().min(0),
  }),
  disk: z.object({
    current: z.number().min(0),
    total: z.number().min(0),
  }),
  xray: z.object({
    state: z.enum(["running", "stopped", "error"]),
    errorMsg: z.string().default(""),
    version: z.string(),
  }),
  uptime: z.number().int().min(0),
  loads: z.array(z.number()),
  tcpCount: z.number().int().min(0),
  udpCount: z.number().int().min(0),
  netIO: z.object({
    up: z.number().min(0),
    down: z.number().min(0),
  }),
  netTraffic: z.object({
    sent: z.number().min(0),
    recv: z.number().min(0),
  }),
});

// Online clients schema
export const OnlineClientSchema = z.object({
  email: z.string().email(),
  ip: z.string().ip(),
  port: z.number().int().min(1).max(65535),
  protocol: z.string(),
  user: z.string(),
  source: z.string().ip(),
  reset: z.string(),
});

export const OnlineClientsSchema = z.array(OnlineClientSchema);

// Client IPs schema
export const ClientIpsSchema = z.object({
  email: z.string().email(),
  ips: z.array(z.string().ip()),
});

// Database backup schema
export const BackupSchema = z.object({
  filename: z.string(),
  size: z.number().int().min(0),
  time: z.string(),
});

// API request/response schemas
export const GetInboundsResponseSchema = BaseResponseSchema.extend({
  obj: z.array(RawInboundSchema),
});

export const GetInboundResponseSchema = BaseResponseSchema.extend({
  obj: RawInboundSchema,
});

export const AddInboundRequestSchema = InboundOptionsSchema;

export const AddInboundResponseSchema = BaseResponseSchema;

export const UpdateInboundRequestSchema = InboundOptionsSchema.partial().extend({
  id: z.number().int().positive(),
});

export const UpdateInboundResponseSchema = BaseResponseSchema;

export const AddClientRequestSchema = z.object({
  inboundId: z.number().int().positive(),
  clients: z.array(ClientSchema),
});

export const AddClientResponseSchema = BaseResponseSchema;

export const UpdateClientRequestSchema = ClientSchema.partial().extend({
  clientId: z.string().uuid(),
});

export const UpdateClientResponseSchema = BaseResponseSchema;

export const GetClientStatsResponseSchema = BaseResponseSchema.extend({
  obj: ClientStatsSchema,
});

export const GetServerStatusResponseSchema = BaseResponseSchema.extend({
  obj: ServerStatusSchema,
});

export const GetOnlineClientsResponseSchema = BaseResponseSchema.extend({
  obj: OnlineClientsSchema,
});

export const GetClientIpsResponseSchema = BaseResponseSchema.extend({
  obj: ClientIpsSchema,
});

export const SendBackupResponseSchema = BaseResponseSchema;

// Helper function to parse raw inbound to typed inbound
export function parseRawInbound(rawInbound: z.infer<typeof RawInboundSchema>): z.infer<typeof InboundSchema> {
  try {
    const settings = ParsedInboundSettingsSchema.parse(JSON.parse(rawInbound.settings));
    const streamSettings = StreamSettingsSchema.parse(JSON.parse(rawInbound.streamSettings));
    const sniffing = SniffingSchema.parse(JSON.parse(rawInbound.sniffing));
    const allocate = rawInbound.allocate ? AllocateSchema.parse(JSON.parse(rawInbound.allocate)) : undefined;

    return {
      ...rawInbound,
      settings,
      streamSettings,
      sniffing,
      allocate,
    };
  } catch (error) {
    throw new Error(`Failed to parse inbound data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Type definitions
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type RawInbound = z.infer<typeof RawInboundSchema>;
export type Inbound = z.infer<typeof InboundSchema>;
export type InboundOptions = z.infer<typeof InboundOptionsSchema>;
export type ParsedInboundSettings = z.infer<typeof ParsedInboundSettingsSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type ClientOptions = z.infer<typeof ClientOptionsSchema>;
export type ClientStats = z.infer<typeof ClientStatsSchema>;
export type ClientStatsEmbedded = z.infer<typeof ClientStatsEmbeddedSchema>;
export type ServerStatus = z.infer<typeof ServerStatusSchema>;
export type OnlineClient = z.infer<typeof OnlineClientSchema>;
export type OnlineClients = z.infer<typeof OnlineClientsSchema>;
export type ClientIps = z.infer<typeof ClientIpsSchema>;
export type StreamSettings = z.infer<typeof StreamSettingsSchema>;
export type VmessSettings = z.infer<typeof VmessSettingsSchema>;
export type VlessSettings = z.infer<typeof VlessSettingsSchema>;
export type TrojanSettings = z.infer<typeof TrojanSettingsSchema>;
export type ShadowsocksSettings = z.infer<typeof ShadowsocksSettingsSchema>;

// Client with inbound info type for utility methods
export type ClientWithInbound = {
  inbound: Inbound;
  client: Client;
}; 