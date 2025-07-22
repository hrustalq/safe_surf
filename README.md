# SafeSurf VPN 🛡️

A modern, enterprise-grade VPN service platform built with Next.js, featuring automatic server provisioning, real-time traffic monitoring, and seamless 3x-UI panel integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-6.12-green.svg)

## ✨ Overview

SafeSurf is a comprehensive VPN service platform that provides:

- **User Management** - Registration, authentication, subscription management
- **VPN Server Integration** - Seamless integration with 3x-UI panels for VLESS/VMESS protocols
- **Real-time Monitoring** - Live traffic usage and connection status tracking  
- **Automated Provisioning** - Digital Ocean integration for automatic server deployment
- **Payment Processing** - YooKassa integration for subscription payments
- **Admin Dashboard** - Complete management interface for servers, users, and analytics

## 🚀 Features

### For Users
- **🆓 Free Trial** - 7-day trial with 2 devices and 5GB traffic
- **📱 Multi-Platform** - Support for iOS, Android, Windows, macOS, Linux
- **⚡ High Performance** - VLESS with Reality and VMESS with WebSocket protocols
- **🔒 Privacy Focused** - No-logs policy with advanced encryption
- **📊 Real-time Monitoring** - Live traffic usage and connection status
- **🌍 Global Servers** - Multiple server locations with load balancing

### For Administrators  
- **🎛️ Admin Dashboard** - Complete control panel for managing everything
- **🖥️ Server Management** - Add, monitor, and provision VPN servers
- **👥 User Management** - User accounts, subscriptions, and analytics
- **💰 Payment Integration** - Automated billing and subscription management
- **📈 Analytics** - Traffic statistics, revenue reports, and usage insights
- **🔧 Panel Integration** - Manage multiple 3x-UI panels from one interface

### Technical Features
- **🔄 Auto-Scaling** - Automatic server provisioning based on demand
- **📡 Load Balancing** - Distribute users across multiple servers
- **🔍 Traffic Monitoring** - Real-time traffic sync from 3x-UI panels
- **🛡️ Security** - Multi-factor auth, encryption, and security event logging
- **📧 Email Integration** - Password reset and notification emails
- **🎨 Modern UI** - Beautiful, responsive interface with dark/light modes

## 🏗️ Tech Stack

### Frontend
- **[Next.js 15.4](https://nextjs.org)** - React framework with App Router
- **[TypeScript 5.8](https://www.typescriptlang.org)** - Static type checking
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** - Modern React component library
- **[Lucide Icons](https://lucide.dev)** - Beautiful icon set
- **[Recharts](https://recharts.org)** - Charts and data visualization

### Backend
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Prisma](https://prisma.io)** - Next-generation ORM
- **[NextAuth.js](https://next-auth.js.org)** - Authentication for Next.js
- **[PostgreSQL](https://postgresql.org)** - Primary database (SQLite for dev)
- **[Zod](https://zod.dev)** - TypeScript-first schema validation

### VPN Integration
- **3x-UI Panels** - V2Ray panel management
- **VLESS Protocol** - With Reality and TLS security
- **VMESS Protocol** - With WebSocket and TLS transport
- **V2Ray Core** - High-performance proxy core

### External Services
- **[Digital Ocean](https://digitalocean.com)** - Server provisioning
- **[YooKassa](https://yookassa.ru)** - Payment processing
- **[Resend](https://resend.com)** - Email delivery service
- **[Upstash Redis](https://upstash.com)** - Serverless Redis for caching
- **[Sentry](https://sentry.io)** - Error monitoring (optional)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Database (PostgreSQL for production, SQLite for development)
- 3x-UI panel(s) for VPN functionality

### Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/safe_surf.git
   cd safe_surf
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment**
   ```bash
   # Minimal setup for development
   cp .env.minimal .env
   
   # Or full setup with all features
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Initialize database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin (create account first, then set role to ADMIN in database)

### Production Deployment

See our comprehensive [Deployment Guide](./docs/DEPLOYMENT.md) for production setup.

## ⚙️ Configuration

### Environment Configurations

SafeSurf offers flexible configuration options:

#### Minimal Setup (Development)
Only requires database and auth secret:
```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
```

#### Full Setup (Production)
Includes all services and integrations:
```bash
# Core
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."

# Authentication
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Email Service
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="..."

# Payment Service  
YOOKASSA_SHOP_ID="..."
YOOKASSA_SECRET_KEY="..."

# VPN Integration (Option 1: Environment)
THREEXUI_BASE_URL="https://your-server.com:2053"
THREEXUI_USERNAME="admin"  
THREEXUI_PASSWORD="..."

# Or Option 2: Database (Recommended)
# Configure panels via /admin/panels interface
```

### VPN Panel Configuration

You can configure 3x-UI panels in two ways:

1. **Environment Variables** (Simple)
   - Set `THREEXUI_BASE_URL`, `THREEXUI_USERNAME`, `THREEXUI_PASSWORD`
   - Good for single-panel setups

2. **Database Configuration** (Recommended)
   - Leave environment variables empty
   - Add panels via `/admin/panels` interface
   - Supports multiple panels, load balancing, runtime configuration

See [3x-UI Setup Guide](./docs/3X-UI_SETUP.md) for detailed configuration.

## 📚 Documentation

### User Guides
- [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md) - Complete environment configuration
- [3x-UI Integration Guide](./docs/3X-UI_SETUP.md) - VPN server setup and integration
- [Quick Start Guide](./docs/QUICKSTART.md) - Get up and running fast

### Technical Documentation
- [API Documentation](./docs/API.md) - tRPC API reference
- [Database Schema](./docs/DATABASE.md) - Prisma schema and relationships
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions

### Architecture
- [System Architecture](./docs/ARCHITECTURE.md) - High-level system design
- [Security Overview](./docs/SECURITY.md) - Security features and best practices
- [Performance Guide](./docs/PERFORMANCE.md) - Optimization and scaling

## 🔄 User Flow

### Registration & Onboarding
1. **User Registration** - Email/password or Google OAuth
2. **Trial Activation** - Automatic 7-day trial with 2 devices, 5GB
3. **VPN Setup** - Download client apps and import configurations
4. **First Connection** - Connect and start browsing securely

### Subscription Management  
1. **Plan Selection** - Choose from Basic, Premium, or Business plans
2. **Payment Processing** - Secure payment via YooKassa
3. **Instant Activation** - VPN configs generated immediately
4. **Usage Monitoring** - Real-time traffic and connection monitoring

### Admin Workflow
1. **Server Management** - Add 3x-UI panels and configure inbounds
2. **User Management** - Monitor users, subscriptions, and usage
3. **Analytics** - View revenue, traffic, and performance metrics
4. **Scaling** - Provision new servers as demand grows

## 🎯 Key Components

### Frontend Components
- **Landing Page** - Marketing site with pricing and features
- **Authentication** - Login/register with email and Google OAuth
- **Dashboard** - User dashboard with usage stats and connection status
- **Subscription Management** - Plan selection and payment processing
- **Admin Interface** - Complete admin panel for system management

### Backend Systems
- **User Management** - Registration, authentication, profile management
- **Subscription System** - Plans, billing, trial management
- **VPN Integration** - 3x-UI panel communication and config generation
- **Traffic Monitoring** - Real-time usage tracking and synchronization
- **Server Provisioning** - Automated Digital Ocean server deployment
- **Payment Processing** - YooKassa integration with webhook handling

### Database Schema
- **Users** - User accounts, authentication, and profiles
- **VPN Plans** - Subscription plans with features and pricing  
- **Subscriptions** - User subscriptions, status, and usage tracking
- **XUI Panels** - 3x-UI panel credentials and configuration
- **Traffic History** - Historical usage data and analytics
- **Security Events** - Login attempts and security monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-username/safe_surf.git
cd safe_surf
npm install
cp .env.minimal .env
npm run db:push
npm run dev
```

### Code Style
- TypeScript with strict mode
- ESLint + Prettier for code formatting
- Conventional commits for git messages
- tRPC for API endpoints
- Tailwind for styling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/) - The best full-stack TypeScript framework
- [3x-UI](https://github.com/MHSanaei/3x-ui) - Excellent V2Ray management panel
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library
- All the amazing open-source projects that make this possible

## 📞 Support

- **Documentation**: Check our [docs](./docs/) folder
- **Issues**: [GitHub Issues](https://github.com/your-username/safe_surf/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/safe_surf/discussions)

---

**SafeSurf VPN** - Secure, Fast, Private. Built with ❤️ using modern web technologies.
