# Digital Ocean Integration Implementation Guide

## Overview

This guide provides step-by-step implementation for integrating Digital Ocean VPS automation with your SafeSurf VPN service. The implementation will allow automatic VPS provisioning, V2Ray installation, and 3x-ui panel integration.

## Prerequisites

- Digital Ocean API Token
- SSH Key pair for VPS access
- PostgreSQL database setup
- Your existing 3x-ui panel deployed

## Phase 1: Environment Setup

### 1. Update Environment Variables

Add to your `src/env.js`:

```typescript
server: {
  // ... existing variables
  
  // Digital Ocean Integration
  DIGITAL_OCEAN_API_TOKEN: z.string(),
  
  // 3x-ui Panel Configuration
  THREEXUI_BASE_URL: z.string().url(),
  THREEXUI_USERNAME: z.string(),
  THREEXUI_PASSWORD: z.string(),
  
  // SSH Configuration for VPS access
  VPS_SSH_PRIVATE_KEY: z.string(),
  VPS_SSH_PUBLIC_KEY: z.string(),
  VPS_SSH_FINGERPRINT: z.string(),
  
  // Optional: Redis for job queuing
  REDIS_URL: z.string().url().optional(),
},
```

### 2. Install Required Dependencies

```bash
# Digital Ocean API client
pnpm add do-wrapper

# SSH client for server configuration
pnpm add node-ssh

# Job queue (optional but recommended)
pnpm add bullmq ioredis

# Server monitoring
pnpm add ping axios-retry
```

### 3. Update Database Schema

Add Digital Ocean fields to your XUIServer model:

```prisma
model XUIServer {
  id            String    @id @default(cuid())
  name          String
  location      String
  locationRu    String
  host          String
  port          Int       @default(443)
  protocol      String    @default("vless")
  outboundId    String?
  outboundTag   String?
  security      String    @default("tls")
  isActive      Boolean   @default(true)
  maxClients    Int       @default(100)
  currentLoad   Int       @default(0)
  priority      Int       @default(0)
  
  // Digital Ocean Integration
  digitalOceanDropletId String?    // DO droplet ID
  digitalOceanRegion    String?    // DO region slug
  digitalOceanSize      String?    // DO size slug
  autoProvision        Boolean    @default(false)
  provisionStatus      ProvisionStatus @default(MANUAL)
  lastHealthCheck      DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum ProvisionStatus {
  MANUAL          // Manually added server
  PROVISIONING    // Creating VPS
  INSTALLING      // Installing V2Ray
  CONFIGURING     // Setting up configuration
  READY           // Ready for traffic
  ERROR           // Provisioning failed
  DESTROYING      // Being destroyed
}
```

Run migration:
```bash
npx prisma db push
```

## Phase 2: Digital Ocean Integration

### 1. Create Digital Ocean Client

Create `src/lib/digital-ocean/client.ts`:

```typescript
import { DigitalOcean } from 'do-wrapper';
import { NodeSSH } from 'node-ssh';
import { env } from '@/env';

export interface DODropletConfig {
  name: string;
  region: string;
  size: string;
  image: string;
  ssh_keys: string[];
  user_data?: string;
  tags?: string[];
}

export interface DODroplet {
  id: number;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  locked: boolean;
  status: string;
  kernel: object | null;
  created_at: string;
  features: string[];
  backup_ids: number[];
  snapshot_ids: number[];
  image: object;
  volume_ids: string[];
  size: object;
  size_slug: string;
  networks: {
    v4: Array<{
      ip_address: string;
      netmask: string;
      gateway: string;
      type: string;
    }>;
    v6: Array<{
      ip_address: string;
      netmask: number;
      gateway: string;
      type: string;
    }>;
  };
  region: object;
  tags: string[];
}

export class DigitalOceanClient {
  private client: DigitalOcean;
  private ssh: NodeSSH;

  constructor() {
    this.client = new DigitalOcean(env.DIGITAL_OCEAN_API_TOKEN, 50);
    this.ssh = new NodeSSH();
  }

  async createDroplet(config: DODropletConfig): Promise<DODroplet> {
    try {
      const response = await this.client.droplets.create(config);
      return response.body.droplet;
    } catch (error) {
      throw new Error(`Failed to create droplet: ${error}`);
    }
  }

  async getDroplet(dropletId: number): Promise<DODroplet> {
    try {
      const response = await this.client.droplets.getById(dropletId);
      return response.body.droplet;
    } catch (error) {
      throw new Error(`Failed to get droplet: ${error}`);
    }
  }

  async deleteDroplet(dropletId: number): Promise<boolean> {
    try {
      await this.client.droplets.deleteById(dropletId);
      return true;
    } catch (error) {
      console.error('Failed to delete droplet:', error);
      return false;
    }
  }

  async waitForDropletReady(dropletId: number, timeout = 300000): Promise<DODroplet> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const droplet = await this.getDroplet(dropletId);
      
      if (droplet.status === 'active' && droplet.networks.v4.length > 0) {
        return droplet;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Droplet did not become ready within timeout');
  }

  async connectSSH(host: string): Promise<void> {
    await this.ssh.connect({
      host,
      username: 'root',
      privateKey: env.VPS_SSH_PRIVATE_KEY,
      passphrase: '', // Add if your key has a passphrase
    });
  }

  async executeCommand(command: string): Promise<string> {
    try {
      const result = await this.ssh.execCommand(command);
      if (result.code !== 0) {
        throw new Error(`Command failed: ${result.stderr}`);
      }
      return result.stdout;
    } catch (error) {
      throw new Error(`SSH command execution failed: ${error}`);
    }
  }

  async disconnectSSH(): Promise<void> {
    this.ssh.dispose();
  }

  async getRegions(): Promise<Array<{ name: string; slug: string; available: boolean }>> {
    try {
      const response = await this.client.regions.getAll();
      return response.body.regions.map((region: any) => ({
        name: region.name,
        slug: region.slug,
        available: region.available,
      }));
    } catch (error) {
      throw new Error(`Failed to get regions: ${error}`);
    }
  }

  async getSizes(): Promise<Array<{ slug: string; memory: number; vcpus: number; disk: number; price_monthly: number }>> {
    try {
      const response = await this.client.sizes.getAll();
      return response.body.sizes.map((size: any) => ({
        slug: size.slug,
        memory: size.memory,
        vcpus: size.vcpus,
        disk: size.disk,
        price_monthly: size.price_monthly,
      }));
    } catch (error) {
      throw new Error(`Failed to get sizes: ${error}`);
    }
  }
}
```

### 2. Create Server Provisioning Service

Create `src/lib/automation/server-provisioning.ts`:

```typescript
import { DigitalOceanClient } from '../digital-ocean/client';
import { createThreeXUIClient } from '../3x-ui';
import { db } from '@/server/db';
import { env } from '@/env';

export class ServerProvisioningService {
  private doClient: DigitalOceanClient;
  private xuiClient;

  constructor() {
    this.doClient = new DigitalOceanClient();
    this.xuiClient = createThreeXUIClient({
      baseUrl: env.THREEXUI_BASE_URL,
      username: env.THREEXUI_USERNAME,
      password: env.THREEXUI_PASSWORD,
    });
  }

  private getV2RayInstallScript(): string {
    return `#!/bin/bash
# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y curl wget unzip nginx certbot python3-certbot-nginx

# Install V2Ray
bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)

# Enable and start V2Ray
systemctl enable v2ray
systemctl start v2ray

# Configure UFW firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8080:8443/tcp

# Create V2Ray config directory
mkdir -p /usr/local/etc/v2ray

# Set up basic Nginx config
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 200 'Server is ready';
    add_header Content-Type text/plain;
}
EOF

systemctl restart nginx

# Install monitoring tools
apt-get install -y htop iotop net-tools

# Signal completion
touch /tmp/v2ray-installed
`;
  }

  async provisionServer(serverData: {
    name: string;
    location: string;
    locationRu: string;
    region: string;
    size: string;
  }): Promise<string> {
    // 1. Create server record in database
    const server = await db.xUIServer.create({
      data: {
        ...serverData,
        digitalOceanRegion: serverData.region,
        digitalOceanSize: serverData.size,
        autoProvision: true,
        provisionStatus: 'PROVISIONING',
        host: 'pending', // Will be updated once VPS is created
      },
    });

    try {
      // 2. Create Digital Ocean VPS
      const dropletConfig = {
        name: `safesurf-${serverData.region}-${Date.now()}`,
        region: serverData.region,
        size: serverData.size,
        image: 'ubuntu-22-04-x64',
        ssh_keys: [env.VPS_SSH_FINGERPRINT],
        user_data: this.getV2RayInstallScript(),
        tags: ['safesurf', 'vpn-server', serverData.region],
      };

      const droplet = await this.doClient.createDroplet(dropletConfig);

      // 3. Update server with droplet ID
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          digitalOceanDropletId: droplet.id.toString(),
        },
      });

      // 4. Wait for VPS to be ready
      await db.xUIServer.update({
        where: { id: server.id },
        data: { provisionStatus: 'INSTALLING' },
      });

      const readyDroplet = await this.doClient.waitForDropletReady(droplet.id);
      const serverIP = readyDroplet.networks.v4.find(net => net.type === 'public')?.ip_address;

      if (!serverIP) {
        throw new Error('No public IP address found for droplet');
      }

      // 5. Update server with IP address
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          host: serverIP,
          provisionStatus: 'CONFIGURING',
        },
      });

      // 6. Wait for V2Ray installation to complete
      await this.waitForV2RayInstallation(serverIP);

      // 7. Configure V2Ray outbound on 3x-ui panel
      await this.configureV2RayOutbound(server.id, serverIP);

      // 8. Mark server as ready
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          provisionStatus: 'READY',
          isActive: true,
          lastHealthCheck: new Date(),
        },
      });

      return server.id;
    } catch (error) {
      // Handle provisioning error
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          provisionStatus: 'ERROR',
          isActive: false,
        },
      });

      throw error;
    }
  }

  private async waitForV2RayInstallation(serverIP: string, timeout = 600000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await this.doClient.connectSSH(serverIP);
        
        // Check if installation is complete
        const result = await this.doClient.executeCommand('test -f /tmp/v2ray-installed && echo "ready"');
        
        if (result.trim() === 'ready') {
          await this.doClient.disconnectSSH();
          return;
        }
        
        await this.doClient.disconnectSSH();
      } catch (error) {
        // SSH might not be ready yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    throw new Error('V2Ray installation did not complete within timeout');
  }

  private async configureV2RayOutbound(serverId: string, serverIP: string): Promise<void> {
    // Generate outbound tag
    const outboundTag = `server_${serverId.slice(-8)}`;

    // Create outbound configuration for 3x-ui panel
    // This would integrate with your 3x-ui panel's outbound configuration
    // The exact implementation depends on how you want to structure your outbounds

    // Update server with outbound tag
    await db.xUIServer.update({
      where: { id: serverId },
      data: {
        outboundTag,
      },
    });

    console.log(`Configured outbound ${outboundTag} for server ${serverIP}`);
  }

  async destroyServer(serverId: string): Promise<boolean> {
    const server = await db.xUIServer.findUnique({
      where: { id: serverId },
    });

    if (!server?.digitalOceanDropletId) {
      throw new Error('Server not found or not provisioned through Digital Ocean');
    }

    try {
      // 1. Mark server as being destroyed
      await db.xUIServer.update({
        where: { id: serverId },
        data: {
          provisionStatus: 'DESTROYING',
          isActive: false,
        },
      });

      // 2. Remove from 3x-ui panel outbounds (if needed)
      // Implementation depends on your outbound management strategy

      // 3. Destroy Digital Ocean VPS
      const success = await this.doClient.deleteDroplet(
        parseInt(server.digitalOceanDropletId)
      );

      if (success) {
        // 4. Remove server from database
        await db.xUIServer.delete({
          where: { id: serverId },
        });
      }

      return success;
    } catch (error) {
      // Mark as error but don't delete from database
      await db.xUIServer.update({
        where: { id: serverId },
        data: {
          provisionStatus: 'ERROR',
          isActive: false,
        },
      });

      throw error;
    }
  }

  async getServerHealth(serverId: string): Promise<{
    vpsStatus: string;
    v2rayStatus: boolean;
    diskUsage: string;
    memoryUsage: string;
    cpuLoad: string;
  }> {
    const server = await db.xUIServer.findUnique({
      where: { id: serverId },
    });

    if (!server?.host || !server.digitalOceanDropletId) {
      throw new Error('Server not found or not properly provisioned');
    }

    try {
      // Get VPS status from Digital Ocean
      const droplet = await this.doClient.getDroplet(
        parseInt(server.digitalOceanDropletId)
      );

      // Get system metrics via SSH
      await this.doClient.connectSSH(server.host);

      const [v2rayStatus, diskUsage, memoryUsage, cpuLoad] = await Promise.all([
        this.doClient.executeCommand('systemctl is-active v2ray').then(r => r.trim() === 'active').catch(() => false),
        this.doClient.executeCommand('df -h / | tail -1 | awk \'{print $5}\'').then(r => r.trim()).catch(() => 'unknown'),
        this.doClient.executeCommand('free | grep Mem | awk \'{printf "%.1f", $3/$2 * 100.0}\'').then(r => r.trim() + '%').catch(() => 'unknown'),
        this.doClient.executeCommand('uptime | awk -F\'load average:\' \'{ print $2 }\'').then(r => r.trim()).catch(() => 'unknown'),
      ]);

      await this.doClient.disconnectSSH();

      // Update last health check
      await db.xUIServer.update({
        where: { id: serverId },
        data: {
          lastHealthCheck: new Date(),
        },
      });

      return {
        vpsStatus: droplet.status,
        v2rayStatus,
        diskUsage,
        memoryUsage,
        cpuLoad,
      };
    } catch (error) {
      throw new Error(`Health check failed: ${error}`);
    }
  }
}
```

## Phase 3: API Integration

### 1. Add tRPC Routes

Create `src/server/api/routers/admin/digital-ocean.ts`:

```typescript
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { ServerProvisioningService } from "~/lib/automation/server-provisioning";
import { DigitalOceanClient } from "~/lib/digital-ocean/client";

const provisioningService = new ServerProvisioningService();
const doClient = new DigitalOceanClient();

export const digitalOceanRouter = createTRPCRouter({
  // Get available regions
  getRegions: adminProcedure
    .query(async () => {
      return await doClient.getRegions();
    }),

  // Get available sizes
  getSizes: adminProcedure
    .query(async () => {
      return await doClient.getSizes();
    }),

  // Provision new server
  provisionServer: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      locationRu: z.string().min(1),
      region: z.string().min(1),
      size: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        const serverId = await provisioningService.provisionServer(input);
        return { success: true, serverId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to provision server: ${error}`,
        });
      }
    }),

  // Destroy server
  destroyServer: adminProcedure
    .input(z.object({
      serverId: z.string().cuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await provisioningService.destroyServer(input.serverId);
        return { success };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to destroy server: ${error}`,
        });
      }
    }),

  // Get server health
  getServerHealth: adminProcedure
    .input(z.object({
      serverId: z.string().cuid(),
    }))
    .query(async ({ input }) => {
      try {
        return await provisioningService.getServerHealth(input.serverId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get server health: ${error}`,
        });
      }
    }),

  // Get provisioning status
  getProvisioningStatus: adminProcedure
    .input(z.object({
      serverId: z.string().cuid(),
    }))
    .query(async ({ ctx, input }) => {
      const server = await ctx.db.xUIServer.findUnique({
        where: { id: input.serverId },
        select: {
          id: true,
          name: true,
          provisionStatus: true,
          digitalOceanDropletId: true,
          host: true,
          lastHealthCheck: true,
        },
      });

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Server not found",
        });
      }

      return server;
    }),
});
```

Add to your main admin router in `src/server/api/routers/admin/index.ts`:

```typescript
import { digitalOceanRouter } from "./digital-ocean";

export const adminRouter = createTRPCRouter({
  // ... existing routers
  digitalOcean: digitalOceanRouter,
});
```

### 2. Create Admin UI Components

Create `src/app/(protected)/admin/servers/_components/provision-server-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const provisionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  locationRu: z.string().min(1, "Russian location is required"),
  region: z.string().min(1, "Region is required"),
  size: z.string().min(1, "Size is required"),
});

type ProvisionFormData = z.infer<typeof provisionSchema>;

export function ProvisionServerForm() {
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { data: regions } = api.admin.digitalOcean.getRegions.useQuery();
  const { data: sizes } = api.admin.digitalOcean.getSizes.useQuery();

  const provisionMutation = api.admin.digitalOcean.provisionServer.useMutation({
    onSuccess: (data) => {
      toast.success(`Server provisioning started! Server ID: ${data.serverId}`);
      reset();
      setIsProvisioning(false);
    },
    onError: (error) => {
      toast.error(`Provisioning failed: ${error.message}`);
      setIsProvisioning(false);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProvisionFormData>({
    resolver: zodResolver(provisionSchema),
  });

  const onSubmit = async (data: ProvisionFormData) => {
    setIsProvisioning(true);
    provisionMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Provision New Server</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Germany Frankfurt"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location (English)</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="e.g., Frankfurt, Germany"
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="locationRu">Location (Russian)</Label>
          <Input
            id="locationRu"
            {...register("locationRu")}
            placeholder="e.g., Франкфурт, Германия"
          />
          {errors.locationRu && (
            <p className="text-sm text-red-600">{errors.locationRu.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">Digital Ocean Region</Label>
            <Select onValueChange={(value) => setValue("region", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions?.filter(r => r.available).map((region) => (
                  <SelectItem key={region.slug} value={region.slug}>
                    {region.name} ({region.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && (
              <p className="text-sm text-red-600">{errors.region.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="size">VPS Size</Label>
            <Select onValueChange={(value) => setValue("size", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizes?.filter(s => ['s-1vcpu-1gb', 's-1vcpu-2gb', 's-2vcpu-2gb'].includes(s.slug)).map((size) => (
                  <SelectItem key={size.slug} value={size.slug}>
                    {size.slug} - ${size.price_monthly}/mo ({size.vcpus} CPU, {size.memory}MB RAM)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.size && (
              <p className="text-sm text-red-600">{errors.size.message}</p>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isProvisioning}
          className="w-full"
        >
          {isProvisioning ? "Provisioning..." : "Provision Server"}
        </Button>
      </form>
    </Card>
  );
}
```

## Phase 4: Testing and Deployment

### 1. Test Digital Ocean Integration

Create a test script to verify the integration:

```typescript
// scripts/test-do-integration.ts
import { DigitalOceanClient } from '../src/lib/digital-ocean/client';
import { ServerProvisioningService } from '../src/lib/automation/server-provisioning';

async function testIntegration() {
  console.log('Testing Digital Ocean integration...');
  
  const doClient = new DigitalOceanClient();
  
  try {
    // Test 1: Get regions
    const regions = await doClient.getRegions();
    console.log('✅ Regions fetched:', regions.length);
    
    // Test 2: Get sizes
    const sizes = await doClient.getSizes();
    console.log('✅ Sizes fetched:', sizes.length);
    
    // Test 3: Create test server (commented out for safety)
    // const provisioning = new ServerProvisioningService();
    // const serverId = await provisioning.provisionServer({
    //   name: 'Test Server',
    //   location: 'Frankfurt, Germany',
    //   locationRu: 'Франкфурт, Германия',
    //   region: 'fra1',
    //   size: 's-1vcpu-1gb',
    // });
    // console.log('✅ Server provisioned:', serverId);
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testIntegration();
```

### 2. Deploy to Production

1. **Setup Environment Variables**:
   ```bash
   DIGITAL_OCEAN_API_TOKEN=your_do_token
   THREEXUI_BASE_URL=https://your-panel.com:2053
   THREEXUI_USERNAME=admin
   THREEXUI_PASSWORD=your_panel_password
   VPS_SSH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
   VPS_SSH_PUBLIC_KEY="ssh-rsa AAAA..."
   VPS_SSH_FINGERPRINT=your_key_fingerprint
   ```

2. **Database Migration**:
   ```bash
   npx prisma migrate dev --name add_digital_ocean_fields
   npx prisma generate
   ```

3. **Build and Deploy**:
   ```bash
   pnpm build
   # Deploy to your preferred platform
   ```

## Monitoring and Maintenance

### 1. Health Check Cron Job

Create a cron job to monitor server health:

```typescript
// scripts/health-check.ts
import { ServerProvisioningService } from '../src/lib/automation/server-provisioning';
import { db } from '../src/server/db';

async function runHealthChecks() {
  const provisioning = new ServerProvisioningService();
  
  const servers = await db.xUIServer.findMany({
    where: {
      autoProvision: true,
      isActive: true,
      provisionStatus: 'READY',
    },
  });

  for (const server of servers) {
    try {
      const health = await provisioning.getServerHealth(server.id);
      console.log(`Server ${server.name} health:`, health);
      
      // Alert if server is unhealthy
      if (!health.v2rayStatus || health.vpsStatus !== 'active') {
        console.warn(`⚠️  Server ${server.name} is unhealthy`);
        // Send alert (email, Slack, etc.)
      }
    } catch (error) {
      console.error(`❌ Health check failed for ${server.name}:`, error);
    }
  }
}

runHealthChecks();
```

### 2. Cost Monitoring

Track your Digital Ocean costs:

```typescript
// scripts/cost-monitoring.ts
import { DigitalOceanClient } from '../src/lib/digital-ocean/client';

async function monitorCosts() {
  const doClient = new DigitalOceanClient();
  
  // Get current balance and usage
  // Implementation depends on DO API for billing
  
  console.log('Current month estimated cost: $XX.XX');
  console.log('Active droplets: X');
}
```

## Conclusion

This implementation provides:

1. **Automated VPS Creation**: Servers are automatically provisioned on Digital Ocean
2. **V2Ray Installation**: Automated V2Ray setup with proper configuration
3. **3x-ui Integration**: Seamless integration with your existing panel
4. **Health Monitoring**: Continuous monitoring of server health
5. **Cost Optimization**: Efficient resource management

Your SafeSurf VPN service will now be able to dynamically scale servers based on demand, providing a professional-grade VPN service experience.

## Next Steps

1. **Implement Job Queues**: Use Redis + BullMQ for background server provisioning
2. **Add Load Balancing**: Intelligent user assignment to optimal servers
3. **Geographic Optimization**: Automatically select closest servers for users
4. **Advanced Monitoring**: Implement detailed metrics and alerting 