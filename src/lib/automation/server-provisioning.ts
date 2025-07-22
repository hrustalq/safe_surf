import { DigitalOceanClient } from '../digital-ocean/client';
import { createThreeXUIClient } from '../3x-ui';
import { db } from '~/server/db';
import { env } from '~/env.js';
import type { ProvisionStatus } from '@prisma/client';

export interface ProvisionServerConfig {
  name: string;
  location: string;
  locationRu: string;
  region: string;
  size: string;
}

export interface ServerHealth {
  vpsStatus: string;
  v2rayStatus: boolean;
  diskUsage: string;
  memoryUsage: string;
  cpuLoad: string;
  lastCheck: Date;
}

/**
 * Server provisioning service for automated VPS creation and V2Ray setup
 * Follows the same patterns as existing service implementations
 */
export class ServerProvisioningService {
  private doClient: DigitalOceanClient;
  private xuiClient: ReturnType<typeof createThreeXUIClient> | null = null;
  private readonly debug: boolean;

  constructor(config?: { debug?: boolean }) {
    this.doClient = new DigitalOceanClient({
      debug: config?.debug ?? false,
    });
    this.debug = config?.debug ?? false;

    // Initialize 3x-ui client if configuration is available
    if (env.THREEXUI_BASE_URL && env.THREEXUI_USERNAME && env.THREEXUI_PASSWORD) {
      this.xuiClient = createThreeXUIClient({
        baseUrl: env.THREEXUI_BASE_URL,
        username: env.THREEXUI_USERNAME,
        password: env.THREEXUI_PASSWORD,
        debug: this.debug,
      });
    }
  }

  /**
   * Get V2Ray installation script for Ubuntu 22.04
   */
  private getV2RayInstallScript(): string {
    return `#!/bin/bash
# SafeSurf VPN Server Setup Script
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y curl wget unzip nginx certbot python3-certbot-nginx htop iotop net-tools

# Configure UFW firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow required ports
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8080:8443/tcp comment 'V2Ray Range'

# Enable UFW
ufw --force enable

# Install V2Ray
bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)

# Create V2Ray config directory
mkdir -p /usr/local/etc/v2ray

# Create basic V2Ray configuration
cat > /usr/local/etc/v2ray/config.json << 'EOF'
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [{
    "port": 8443,
    "protocol": "vless",
    "settings": {
      "clients": [],
      "decryption": "none",
      "fallbacks": [{
        "dest": 80
      }]
    },
    "streamSettings": {
      "network": "tcp",
      "security": "none"
    }
  }],
  "outbounds": [{
    "protocol": "freedom",
    "settings": {},
    "tag": "direct"
  }]
}
EOF

# Create log directory
mkdir -p /var/log/v2ray
chown nobody:nogroup /var/log/v2ray

# Enable and start V2Ray
systemctl enable v2ray
systemctl start v2ray

# Configure Nginx default site
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    location / {
        return 200 'SafeSurf VPN Server Ready';
        add_header Content-Type text/plain;
    }
    
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Configure SSH security
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Create non-root user
useradd -m -s /bin/bash safesurf
usermod -aG sudo safesurf

# Install fail2ban for security
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Install automatic updates
apt-get install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades

# Create completion marker
touch /tmp/v2ray-installed
echo "$(date): V2Ray installation completed" > /tmp/install-log

# Final system cleanup
apt-get autoremove -y
apt-get autoclean

echo "SafeSurf VPN Server setup completed successfully!"
`;
  }

  /**
   * Provision a new server with automated setup
   */
  async provisionServer(config: ProvisionServerConfig): Promise<string> {
    if (this.debug) {
      console.log('[Provisioning] Starting server provisioning:', config.name);
    }

    // 1. Create server record in database
    const server = await db.xUIServer.create({
      data: {
        name: config.name,
        location: config.location,
        locationRu: config.locationRu,
        digitalOceanRegion: config.region,
        digitalOceanSize: config.size,
        autoProvision: true,
        provisionStatus: 'PROVISIONING',
        host: 'pending', // Will be updated once VPS is created
      },
    });

    try {
      // 2. Get SSH key fingerprint for VPS creation
      const sshFingerprint = env.VPS_SSH_FINGERPRINT;
      if (!sshFingerprint) {
        throw new Error('VPS SSH fingerprint is not configured');
      }

      // 3. Create Digital Ocean VPS
      const dropletConfig = {
        name: `safesurf-${config.region}-${Date.now()}`,
        region: config.region,
        size: config.size,
        image: 'ubuntu-22-04-x64',
        ssh_keys: [sshFingerprint],
        user_data: this.getV2RayInstallScript(),
        tags: ['safesurf', 'vpn-server', config.region],
      };

      const droplet = await this.doClient.createDroplet(dropletConfig);

      // 4. Update server with droplet ID
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          digitalOceanDropletId: droplet.id.toString(),
          provisionStatus: 'INSTALLING',
        },
      });

      if (this.debug) {
        console.log('[Provisioning] VPS created, waiting for ready state:', droplet.id);
      }

      // 5. Wait for VPS to be ready
      const readyDroplet = await this.doClient.waitForDropletReady(droplet.id);
      const serverIP = readyDroplet.networks.v4.find(net => net.type === 'public')?.ip_address;

      if (!serverIP) {
        throw new Error('No public IP address found for droplet');
      }

      // 6. Update server with IP address
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          host: serverIP,
          provisionStatus: 'CONFIGURING',
        },
      });

      if (this.debug) {
        console.log('[Provisioning] VPS ready with IP:', serverIP);
      }

      // 7. Wait for V2Ray installation to complete
      await this.waitForV2RayInstallation(serverIP);

      // 8. Configure server as ready
      const outboundTag = `server_${server.id.slice(-8)}`;
      
      await db.xUIServer.update({
        where: { id: server.id },
        data: {
          provisionStatus: 'READY',
          isActive: true,
          outboundTag,
          lastHealthCheck: new Date(),
        },
      });

      if (this.debug) {
        console.log('[Provisioning] Server provisioned successfully:', server.id);
      }

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

      console.error('[Provisioning] Server provisioning failed:', error);
      throw error;
    }
  }

  /**
   * Wait for V2Ray installation to complete on the server
   */
  private async waitForV2RayInstallation(serverIP: string, timeout = 600000): Promise<void> {
    const startTime = Date.now();
    
    if (this.debug) {
      console.log('[Provisioning] Waiting for V2Ray installation on:', serverIP);
    }

    while (Date.now() - startTime < timeout) {
      try {
        await this.doClient.connectSSH(serverIP);
        
        // Check if installation is complete
        const result = await this.doClient.executeCommand('test -f /tmp/v2ray-installed && echo "ready"');
        
        if (result.trim() === 'ready') {
          await this.doClient.disconnectSSH();
          if (this.debug) {
            console.log('[Provisioning] V2Ray installation completed');
          }
          return;
        }
        
        await this.doClient.disconnectSSH();
      } catch {
        // SSH might not be ready yet, continue waiting
        if (this.debug) {
          console.log('[Provisioning] Waiting for SSH to be ready...');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }
    
    throw new Error('V2Ray installation did not complete within timeout');
  }

  /**
   * Destroy a provisioned server
   */
  async destroyServer(serverId: string): Promise<boolean> {
    const server = await db.xUIServer.findUnique({
      where: { id: serverId },
    });

    if (!server?.digitalOceanDropletId) {
      throw new Error('Server not found or not provisioned through Digital Ocean');
    }

    try {
      if (this.debug) {
        console.log('[Provisioning] Destroying server:', serverId);
      }

      // 1. Mark server as being destroyed
      await db.xUIServer.update({
        where: { id: serverId },
        data: {
          provisionStatus: 'DESTROYING',
          isActive: false,
        },
      });

			if (!server.digitalOceanDropletId) {
				throw new Error('Server not found or not provisioned through Digital Ocean');
			}

      // 2. Destroy Digital Ocean VPS
      const success = await this.doClient.deleteDroplet(
        parseInt(server.digitalOceanDropletId)
      );

      if (success) {
        // 3. Remove server from database
        await db.xUIServer.delete({
          where: { id: serverId },
        });

        if (this.debug) {
          console.log('[Provisioning] Server destroyed successfully:', serverId);
        }
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

      console.error('[Provisioning] Server destruction failed:', error);
      throw error;
    }
  }

  /**
   * Get server health metrics
   */
  async getServerHealth(serverId: string): Promise<ServerHealth> {
    const server = await db.xUIServer.findUnique({
      where: { id: serverId },
    });

    if (!server?.host || !server.digitalOceanDropletId) {
      throw new Error('Server not found or not properly provisioned');
    }

    try {
      if (this.debug) {
        console.log('[Provisioning] Checking server health:', server.host);
      }

      // Get VPS status from Digital Ocean
      const droplet = await this.doClient.getDroplet(
        parseInt(server.digitalOceanDropletId)
      );

      // Get system metrics via SSH
      await this.doClient.connectSSH(server.host);

      const [v2rayStatus, diskUsage, memoryUsage, cpuLoad] = await Promise.all([
        this.doClient.executeCommand('systemctl is-active v2ray')
          .then(r => r.trim() === 'active')
          .catch(() => false),
        this.doClient.executeCommand('df -h / | tail -1 | awk \'{print $5}\'')
          .then(r => r.trim())
          .catch(() => 'unknown'),
        this.doClient.executeCommand('free | grep Mem | awk \'{printf "%.1f", $3/$2 * 100.0}\'')
          .then(r => r.trim() + '%')
          .catch(() => 'unknown'),
        this.doClient.executeCommand('uptime | awk -F\'load average:\' \'{ print $2 }\'')
          .then(r => r.trim())
          .catch(() => 'unknown'),
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
        lastCheck: new Date(),
      };
    } catch (error) {
      await this.doClient.disconnectSSH().catch(() => {
        // Do nothing
      });
      console.error('[Provisioning] Health check failed:', error);
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get provisioning status for a server
   */
  async getProvisioningStatus(serverId: string): Promise<{
    id: string;
    name: string;
    provisionStatus: ProvisionStatus;
    digitalOceanDropletId: string | null;
    host: string;
    lastHealthCheck: Date | null;
  }> {
    const server = await db.xUIServer.findUnique({
      where: { id: serverId },
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
      throw new Error('Server not found');
    }

    return server;
  }

  /**
   * List all servers with their provisioning status
   */
  async listProvisionedServers(): Promise<Array<{
    id: string;
    name: string;
    location: string;
    locationRu: string;
    host: string;
    provisionStatus: ProvisionStatus;
    isActive: boolean;
    digitalOceanRegion: string | null;
    digitalOceanSize: string | null;
    lastHealthCheck: Date | null;
    createdAt: Date;
  }>> {
    return await db.xUIServer.findMany({
      where: {
        autoProvision: true,
      },
      select: {
        id: true,
        name: true,
        location: true,
        locationRu: true,
        host: true,
        provisionStatus: true,
        isActive: true,
        digitalOceanRegion: true,
        digitalOceanSize: true,
        lastHealthCheck: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

/**
 * Create a configured server provisioning service instance
 */
export function createServerProvisioningService(config?: {
  debug?: boolean;
}): ServerProvisioningService {
  return new ServerProvisioningService(config);
} 