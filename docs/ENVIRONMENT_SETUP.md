# Environment Setup Guide

This guide explains how to configure SafeSurf VPN for different environments and use cases.

## Overview

SafeSurf is designed with flexibility in mind. You can run it with minimal configuration for development or with full features for production.

## Configuration Files

- **`.env.minimal`** - Bare minimum for local development
- **`.env.example`** - Full configuration template with all options
- **`.env`** - Your actual configuration (create this file)

## Quick Start Options

### 1. Minimal Development Setup

Perfect for trying out SafeSurf or frontend development:

```bash
# Copy minimal config
cp .env.minimal .env

# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

**What works:**
- ✅ Complete UI and navigation
- ✅ Email/password authentication
- ✅ User registration with trial subscriptions
- ✅ Admin interface
- ✅ Dashboard and subscription management

**What doesn't work:**
- ❌ Google OAuth
- ❌ Password reset emails
- ❌ VPN configuration generation
- ❌ Payment processing

### 2. Full Development Setup

For complete feature development and testing:

```bash
# Copy full config template
cp .env.example .env

# Edit .env and configure the services you need
# See sections below for service-specific setup

# Install and start
npm install
npm run db:push
npm run db:seed
npm run dev
```

### 3. Production Setup

For live deployment with all features:

```bash
# Use full configuration
cp .env.example .env

# Configure all required services
# Set strong secrets and proper URLs
# Use PostgreSQL instead of SQLite

# Deploy to your hosting platform
```

## Service Configuration

### Authentication

#### Basic Auth (Always Required)
```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-super-secret-key-here"
```

#### Google OAuth (Optional)
```bash
# Get from: https://console.developers.google.com/
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

### Database

#### SQLite (Development)
```bash
DATABASE_URL="file:./dev.db"
```

#### PostgreSQL (Production)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/safesurf"
```

### Email Service

#### Resend (Recommended)
```bash
# Free: 3,000 emails/month
# Sign up: https://resend.com
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Payment Processing

#### YooKassa (Russian Market)
```bash
# Sign up: https://yookassa.ru
YOOKASSA_SHOP_ID="your-shop-id"
YOOKASSA_SECRET_KEY="your-secret-key"
```

### VPN Integration

You have two options for configuring 3x-UI panels:

#### Option 1: Environment Variables (Simple)
```bash
THREEXUI_BASE_URL="https://your-server.com:2053"
THREEXUI_USERNAME="admin"
THREEXUI_PASSWORD="your-admin-password"
```

#### Option 2: Database Configuration (Recommended)
1. Leave environment variables empty
2. Go to `/admin/panels` in your app
3. Add panels through the admin interface

**Benefits of database approach:**
- Multiple panels for load balancing
- Runtime configuration changes
- Better security (encrypted passwords)
- Per-panel settings

## Environment Validation

SafeSurf uses strict environment validation. The `src/env.js` file defines:

- **Required variables** - Must be set for the app to start
- **Optional variables** - Enable additional features when set
- **Type validation** - Ensures correct formats (URLs, emails, etc.)

### Skipping Validation

For Docker builds or CI/CD:

```bash
SKIP_ENV_VALIDATION=true npm run build
```

## Development Workflows

### Frontend Development
Use minimal config to focus on UI/UX without backend dependencies:
```bash
cp .env.minimal .env
npm run dev
```

### Backend Development
Add services incrementally as you work on features:
```bash
cp .env.minimal .env
# Add AUTH_GOOGLE_ID for OAuth testing
# Add RESEND_API_KEY for email testing
# Add 3x-UI config for VPN testing
```

### Integration Testing
Use full config with test/staging services:
```bash
cp .env.example .env
# Configure with staging/test API keys
# Use test 3x-UI panel
# Use development payment gateway
```

## Production Checklist

Before deploying to production:

### Security
- [ ] Generate strong `AUTH_SECRET`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Set up proper SSL certificates
- [ ] Configure firewall rules
- [ ] Use database-stored 3x-UI panels (not env vars)

### Services
- [ ] Configure email service (Resend)
- [ ] Set up payment processing (YooKassa)
- [ ] Configure 3x-UI panels
- [ ] Set up monitoring (Sentry, DataDog)

### Performance
- [ ] Configure Redis for caching
- [ ] Set up CDN for static assets
- [ ] Configure Upstash for rate limiting
- [ ] Optimize database queries

## Troubleshooting

### Environment Validation Errors
```bash
# Check which variables are missing
npm run build

# Temporarily skip validation
SKIP_ENV_VALIDATION=true npm run build
```

### Database Issues
```bash
# Reset database schema
npm run db:reset

# Apply pending migrations
npm run db:push

# Seed with test data
npm run db:seed
```

### 3x-UI Connection Issues
```bash
# Test connection from admin interface
# Go to /admin/panels and test your panel

# Check logs for connection errors
# Look for "3x-ui credentials not configured" messages
```

## Environment Variables Reference

### Core (Minimal)
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Authentication secret key

### Authentication
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret

### Email
- `RESEND_API_KEY` - Resend email service API key
- `RESEND_FROM_EMAIL` - From address for emails

### Payments
- `YOOKASSA_SHOP_ID` - YooKassa shop identifier
- `YOOKASSA_SECRET_KEY` - YooKassa secret key

### VPN Integration
- `THREEXUI_BASE_URL` - 3x-UI panel URL
- `THREEXUI_USERNAME` - 3x-UI admin username
- `THREEXUI_PASSWORD` - 3x-UI admin password
- `THREEXUI_SECRET_KEY` - Optional signing key

### Infrastructure
- `DIGITAL_OCEAN_API_TOKEN` - For server provisioning
- `VPS_SSH_PRIVATE_KEY` - SSH private key
- `VPS_SSH_PUBLIC_KEY` - SSH public key
- `VPS_SSH_FINGERPRINT` - SSH fingerprint

### Advanced
- `ENCRYPTION_KEY` - Data encryption key (64 chars hex)
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `SENTRY_DSN` - Sentry error tracking URL
- `DATADOG_API_KEY` - DataDog monitoring key

## Need Help?

- Check the [3x-UI Setup Guide](./3X-UI_SETUP.md) for VPN configuration
- See [Deployment Guide](./DEPLOYMENT.md) for production setup
- Review the [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues