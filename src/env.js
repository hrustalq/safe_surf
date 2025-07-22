import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().url().optional(), // Your production domain URL (e.g., https://safe-surf.tech)
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Email Service (Optional - needed for password reset)
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    
    // Payment Service (Optional - needed for subscriptions)
    YOOKASSA_SHOP_ID: z.string().optional(),
    YOOKASSA_SECRET_KEY: z.string().optional(),

    // Digital Ocean Integration (Optional - needed for server provisioning)
    DIGITAL_OCEAN_API_TOKEN: z.string().optional(),

    // 3x-UI Panel Configuration (Optional - can be configured via database instead)
    // Either use environment variables OR configure panels via admin interface
    THREEXUI_BASE_URL: z.string().url().optional(),
    THREEXUI_USERNAME: z.string().optional(),
    THREEXUI_PASSWORD: z.string().optional(),
    THREEXUI_SECRET_KEY: z.string().optional(), // For request signing
    THREEXUI_SERVER_ADDRESS: z.string().optional(), // Server address for VPN configs

    // VPS SSH Configuration (Optional - needed for server provisioning)
    VPS_SSH_PRIVATE_KEY: z.string().optional(),
    VPS_SSH_PUBLIC_KEY: z.string().optional(),
    VPS_SSH_FINGERPRINT: z.string().optional(),

    // Security & Encryption (Optional - for enhanced security features)
    ENCRYPTION_KEY: z.string().length(64).optional(), // 32 bytes in hex
    JWT_SECRET: z.string().optional(),

    // External Services (Optional - for caching and rate limiting)
    REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Monitoring (Optional - for production monitoring)
    SENTRY_DSN: z.string().url().optional(),
    DATADOG_API_KEY: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    YOOKASSA_SHOP_ID: process.env.YOOKASSA_SHOP_ID,
    YOOKASSA_SECRET_KEY: process.env.YOOKASSA_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    // Digital Ocean
    DIGITAL_OCEAN_API_TOKEN: process.env.DIGITAL_OCEAN_API_TOKEN,

    // 3x-UI Panel
    THREEXUI_BASE_URL: process.env.THREEXUI_BASE_URL,
    THREEXUI_USERNAME: process.env.THREEXUI_USERNAME,
    THREEXUI_PASSWORD: process.env.THREEXUI_PASSWORD,
    THREEXUI_SECRET_KEY: process.env.THREEXUI_SECRET_KEY,
    THREEXUI_SERVER_ADDRESS: process.env.THREEXUI_SERVER_ADDRESS,

    // SSH
    VPS_SSH_PRIVATE_KEY: process.env.VPS_SSH_PRIVATE_KEY,
    VPS_SSH_PUBLIC_KEY: process.env.VPS_SSH_PUBLIC_KEY,
    VPS_SSH_FINGERPRINT: process.env.VPS_SSH_FINGERPRINT,

    // Security
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    JWT_SECRET: process.env.JWT_SECRET,

    // External Services
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    // Monitoring
    SENTRY_DSN: process.env.SENTRY_DSN,
    DATADOG_API_KEY: process.env.DATADOG_API_KEY,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
