-- V2Ray VPN Service Database Schema
-- PostgreSQL implementation following technical requirements

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    tier INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    reset_expires TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_tier ON users(tier);

-- User authentication methods
CREATE TABLE user_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('vmess', 'vless', 'shadowsocks', 'socks', 'http')),
    auth_id VARCHAR(255) NOT NULL, -- UUID for VMess/VLESS, password for others
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auth_type, auth_id)
);

-- Create indexes for user_auth table
CREATE INDEX idx_user_auth_user_id ON user_auth(user_id);
CREATE INDEX idx_user_auth_type ON user_auth(auth_type);
CREATE INDEX idx_user_auth_auth_id ON user_auth(auth_id);

-- Traffic quotas and usage
CREATE TABLE user_traffic (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    upload_bytes BIGINT DEFAULT 0,
    download_bytes BIGINT DEFAULT 0,
    quota_bytes BIGINT DEFAULT 0, -- 0 = unlimited
    PRIMARY KEY(user_id, period)
);

-- Create indexes for user_traffic table
CREATE INDEX idx_user_traffic_period ON user_traffic(period);
CREATE INDEX idx_user_traffic_quota ON user_traffic(quota_bytes);

-- Server configurations
CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    protocol VARCHAR(20) NOT NULL CHECK (protocol IN ('vmess', 'vless', 'shadowsocks', 'trojan', 'socks')),
    config JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    location VARCHAR(100),
    load_score DECIMAL(5,2) DEFAULT 0,
    health_score DECIMAL(5,2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for servers table
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_servers_protocol ON servers(protocol);
CREATE INDEX idx_servers_location ON servers(location);
CREATE INDEX idx_servers_health ON servers(health_score);
CREATE INDEX idx_servers_load ON servers(load_score);

-- User access rules
CREATE TABLE user_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    allowed BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_access_rules table
CREATE INDEX idx_user_access_user_id ON user_access_rules(user_id);
CREATE INDEX idx_user_access_server_id ON user_access_rules(server_id);
CREATE INDEX idx_user_access_allowed ON user_access_rules(allowed);

-- Connection logs
CREATE TABLE connection_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    server_id UUID REFERENCES servers(id),
    inbound_tag VARCHAR(50),
    outbound_tag VARCHAR(50),
    source_ip INET,
    destination VARCHAR(255),
    bytes_upload BIGINT,
    bytes_download BIGINT,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('active', 'closed', 'error', 'timeout'))
);

-- Create indexes for connection_logs table
CREATE INDEX idx_connection_logs_user_id ON connection_logs(user_id);
CREATE INDEX idx_connection_logs_server_id ON connection_logs(server_id);
CREATE INDEX idx_connection_logs_started_at ON connection_logs(started_at);
CREATE INDEX idx_connection_logs_status ON connection_logs(status);

-- System events
CREATE TABLE system_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for system_events table
CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_severity ON system_events(severity);
CREATE INDEX idx_system_events_created_at ON system_events(created_at);

-- V2Ray configuration states
CREATE TABLE v2ray_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_hash VARCHAR(64) UNIQUE NOT NULL,
    config_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP
);

-- Create indexes for v2ray_configs table
CREATE INDEX idx_v2ray_configs_hash ON v2ray_configs(config_hash);
CREATE INDEX idx_v2ray_configs_status ON v2ray_configs(status);
CREATE INDEX idx_v2ray_configs_created_at ON v2ray_configs(created_at);

-- Server health monitoring
CREATE TABLE server_health_checks (
    id BIGSERIAL PRIMARY KEY,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    latency_ms INTEGER,
    success_rate DECIMAL(5,2),
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for server_health_checks table
CREATE INDEX idx_server_health_server_id ON server_health_checks(server_id);
CREATE INDEX idx_server_health_checked_at ON server_health_checks(checked_at);

-- API keys for external access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- Create indexes for api_keys table
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create initial admin user (password: changeme)
INSERT INTO users (email, username, password_hash, tier) VALUES 
('admin@example.com', 'admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 999);

-- Create sample server configurations
INSERT INTO servers (name, address, port, protocol, config, location) VALUES
('US-East-1', '1.2.3.4', 443, 'vmess', '{"network": "ws", "path": "/ray", "security": "tls"}', 'New York, USA'),
('EU-West-1', '5.6.7.8', 443, 'vless', '{"network": "grpc", "security": "reality"}', 'London, UK'),
('Asia-SE-1', '9.10.11.12', 8388, 'shadowsocks', '{"cipher": "chacha20-ietf-poly1305"}', 'Singapore');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO v2ray_vpn;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO v2ray_vpn; 