import DigitalOcean from 'do-wrapper';
import { NodeSSH } from 'node-ssh';
import { env } from '~/env.js';

// DigitalOcean API client interface

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

export interface DORegion {
  name: string;
  slug: string;
  available: boolean;
}

export interface DOSize {
  slug: string;
  memory: number;
  vcpus: number;
  disk: number;
  price_monthly: number;
  price_hourly: number;
  available: boolean;
}

/**
 * Digital Ocean API client with SSH management capabilities
 * Follows the same patterns as the existing 3x-ui client
 */
export class DigitalOceanClient {
  private client: DigitalOcean;
  private ssh: NodeSSH;
  private readonly timeout: number;
  private readonly debug: boolean;

  constructor(config?: { 
    apiToken?: string;
    timeout?: number;
    debug?: boolean;
  }) {
    const apiToken = config?.apiToken ?? env.DIGITAL_OCEAN_API_TOKEN;
    if (!apiToken) {
      throw new Error('Digital Ocean API token is required');
    }

    this.client = new DigitalOcean(apiToken, 50);
    this.ssh = new NodeSSH();
    this.timeout = config?.timeout ?? 30000;
    this.debug = config?.debug ?? false;

    if (this.debug) {
      console.log('[DigitalOcean] Client initialized');
    }
  }

  /**
   * Create a new droplet
   */
  async createDroplet(config: DODropletConfig): Promise<DODroplet> {
    try {
      if (this.debug) {
        console.log('[DigitalOcean] Creating droplet:', config.name);
      }

      const response = (await this.client.droplets.create({
        ...config,
        backups: false,
        ipv6: false,
        private_networking: false,
        user_data: '',
        monitoring: false,
        tags: config.tags ?? [],
        ssh_keys: config.ssh_keys.map(key => parseInt(key)),
        volumes: [] as string[],
      })) as { 
        droplet: DODroplet; 
        links: Record<string, unknown>; 
        meta: Record<string, unknown>; 
      };
      
      if (!response.droplet) {
        throw new Error('Invalid response from Digital Ocean API');
      }

      return response.droplet;
    } catch (error) {
      console.error('[DigitalOcean] Failed to create droplet:', error);
      throw new Error(`Failed to create droplet: ${String(error)}`);
    }
  }

  /**
   * Get droplet by ID
   */
  async getDroplet(dropletId: number): Promise<DODroplet> {
    try {
      const response = (await this.client.droplets.getById(dropletId.toString())) as { 
        droplet: DODroplet; 
        links: Record<string, unknown>; 
        meta: Record<string, unknown>; 
      };
      
      if (!response.droplet) {
        throw new Error('Droplet not found');
      }

      return response.droplet;
    } catch (error) {
      console.error('[DigitalOcean] Failed to get droplet:', error);
      throw new Error(`Failed to get droplet: ${String(error)}`);
    }
  }

  /**
   * Delete droplet by ID
   */
  async deleteDroplet(dropletId: number): Promise<boolean> {
    try {
      if (this.debug) {
        console.log('[DigitalOcean] Deleting droplet:', dropletId);
      }

      await this.client.droplets.deleteById(dropletId.toString());
      return true;
    } catch (error) {
      console.error('[DigitalOcean] Failed to delete droplet:', error);
      return false;
    }
  }

  /**
   * Wait for droplet to become ready (active status with network)
   */
  async waitForDropletReady(
    dropletId: number, 
    timeout = 300000
  ): Promise<DODroplet> {
    const startTime = Date.now();
    
    if (this.debug) {
      console.log('[DigitalOcean] Waiting for droplet to be ready:', dropletId);
    }

    while (Date.now() - startTime < timeout) {
      const droplet = await this.getDroplet(dropletId);
      
      if (
        droplet.status === 'active' && 
        droplet.networks.v4.length > 0
      ) {
        if (this.debug) {
          console.log('[DigitalOcean] Droplet is ready:', droplet.id);
        }
        return droplet;
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Droplet did not become ready within timeout');
  }

  /**
   * Connect to droplet via SSH
   */
  async connectSSH(host: string, options?: {
    username?: string;
    port?: number;
    timeout?: number;
  }): Promise<void> {
    const privateKey = env.VPS_SSH_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('VPS SSH private key is not configured');
    }

    try {
      await this.ssh.connect({
        host,
        username: options?.username ?? 'root',
        port: options?.port ?? 22,
        privateKey,
        readyTimeout: options?.timeout ?? this.timeout,
      });

      if (this.debug) {
        console.log('[DigitalOcean] SSH connected to:', host);
      }
    } catch (error) {
      console.error('[DigitalOcean] SSH connection failed:', error);
      throw new Error(`SSH connection failed: ${String(error)}`);
    }
  }

  /**
   * Execute command over SSH
   */
  async executeCommand(command: string, options?: {
    cwd?: string;
    timeout?: number;
  }): Promise<string> {
    try {
      const result = await this.ssh.execCommand(command, {
        cwd: options?.cwd,
        execOptions: {
          timeout: options?.timeout ?? this.timeout,
        },
      });

      if (result.code !== 0) {
        throw new Error(`Command failed with code ${result.code}: ${result.stderr}`);
      }

      if (this.debug) {
        console.log('[DigitalOcean] Command executed successfully:', command);
      }

      return result.stdout;
    } catch (error) {
      console.error('[DigitalOcean] Command execution failed:', error);
      throw new Error(`SSH command execution failed: ${String(error)}`);
    }
  }

  /**
   * Disconnect SSH connection
   */
  async disconnectSSH(): Promise<void> {
    try {
      this.ssh.dispose();
      if (this.debug) {
        console.log('[DigitalOcean] SSH disconnected');
      }
    } catch (error) {
      console.error('[DigitalOcean] SSH disconnect error:', error);
    }
  }

  /**
   * Get available regions
   */
  async getRegions(): Promise<DORegion[]> {
    try {
      const response = (await this.client.regions.getAll('')) as { 
        regions: Array<{ 
          name: string; 
          slug: string; 
          available: boolean;
        }>; 
        links: Record<string, unknown>;
        meta: { total: number };
      };
      
      if (!response.regions) {
        throw new Error('Invalid response from Digital Ocean API');
      }

      return response.regions.map((region) => ({
        name: region.name,
        slug: region.slug,
        available: region.available,
      }));
    } catch (error) {
      console.error('[DigitalOcean] Failed to get regions:', error);
      throw new Error(`Failed to get regions: ${String(error)}`);
    }
  }

  /**
   * Get available droplet sizes
   */
  async getSizes(): Promise<DOSize[]> {
    try {
      const response = (await this.client.sizes.get('')) as { 
        sizes: Array<{
          slug: string;
          memory: number;
          vcpus: number;
          disk: number;
          price_monthly: number;
          price_hourly: number;
          available: boolean;
        }>;
        links: Record<string, unknown>;
        meta: { total: number };
      };
      
      if (!response.sizes) {
        throw new Error('Invalid response from Digital Ocean API');
      }

      return response.sizes.map((size) => ({
        slug: size.slug,
        memory: size.memory,
        vcpus: size.vcpus,
        disk: size.disk,
        price_monthly: size.price_monthly,
        price_hourly: size.price_hourly,
        available: size.available,
      }));
    } catch (error) {
      console.error('[DigitalOcean] Failed to get sizes:', error);
      throw new Error(`Failed to get sizes: ${String(error)}`);
    }
  }

  /**
   * Get available SSH keys
   */
  async getSSHKeys(): Promise<Array<{
    id: number;
    name: string;
    fingerprint: string;
    public_key: string;
  }>> {
    try {
      const response = (await this.client.keys.getAll('')) as { 
        ssh_keys: Array<{
          id: number;
          name: string;
          fingerprint: string;
          public_key: string;
        }>;
        links: Record<string, unknown>;
        meta: { total: number };
      };
      
      if (!response.ssh_keys) {
        throw new Error('Invalid response from Digital Ocean API');
      }

      return response.ssh_keys.map((key) => ({
        id: key.id,
        name: key.name,
        fingerprint: key.fingerprint,
        public_key: key.public_key,
      }));
    } catch (error) {
      console.error('[DigitalOcean] Failed to get SSH keys:', error);
      throw new Error(`Failed to get SSH keys: ${String(error)}`);
    }
  }

  /**
   * Check droplet health and metrics
   */
  async getDropletHealth(dropletId: number): Promise<{
    status: string;
    uptime: string;
    load: string;
    memory: string;
    disk: string;
  }> {
    const droplet = await this.getDroplet(dropletId);
    
    if (droplet.status !== 'active') {
      return {
        status: droplet.status,
        uptime: 'unknown',
        load: 'unknown',
        memory: 'unknown',
        disk: 'unknown',
      };
    }

    const publicIp = droplet.networks.v4.find(net => net.type === 'public')?.ip_address;
    if (!publicIp) {
      throw new Error('No public IP address found');
    }

    try {
      await this.connectSSH(publicIp);

      const [uptime, load, memory, disk] = await Promise.all([
        this.executeCommand('uptime -p').catch(() => 'unknown'),
        this.executeCommand('uptime | awk -F\'load average:\' \'{ print $2 }\'').catch(() => 'unknown'),
        this.executeCommand('free | grep Mem | awk \'{printf "%.1f", $3/$2 * 100.0}\'').then(r => r.trim() + '%').catch(() => 'unknown'),
        this.executeCommand('df -h / | tail -1 | awk \'{print $5}\'').then(r => r.trim()).catch(() => 'unknown'),
      ]);

      await this.disconnectSSH();

      return {
        status: droplet.status,
        uptime: uptime.trim(),
        load: load.trim(),
        memory,
        disk,
      };
    } catch (error) {
      await this.disconnectSSH();
      throw error;
    }
  }
}

/**
 * Create a configured Digital Ocean client instance
 */
export function createDigitalOceanClient(config?: {
  apiToken?: string;
  timeout?: number;
  debug?: boolean;
}): DigitalOceanClient {
  return new DigitalOceanClient(config);
} 