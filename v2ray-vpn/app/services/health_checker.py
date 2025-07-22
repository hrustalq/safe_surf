import asyncio
import time
import logging
import socket
import httpx
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from ..models import Server, ServerHealthCheck, SystemEvent
from ..core.database import get_db

logger = logging.getLogger(__name__)


class ServerHealthChecker:
    """Server health checking service"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.checkers = {
            'vmess': self._check_vmess_server,
            'vless': self._check_vless_server,
            'shadowsocks': self._check_shadowsocks_server,
            'trojan': self._check_trojan_server,
            'socks': self._check_socks_server
        }
    
    async def check_all_servers(self) -> List[Dict]:
        """Check all active servers and update their health scores"""
        servers = self.db.query(Server).filter(Server.status == 'active').all()
        
        if not servers:
            logger.info("No active servers to check")
            return []
        
        logger.info(f"Checking health of {len(servers)} servers")
        
        # Create tasks for parallel checking
        tasks = []
        for server in servers:
            task = self._check_server_health(server)
            tasks.append(task)
        
        # Execute all health checks in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and update database
        health_results = []
        for i, result in enumerate(results):
            server = servers[i]
            
            if isinstance(result, Exception):
                logger.error(f"Health check failed for server {server.name}: {result}")
                health_result = {
                    'server_id': server.id,
                    'server_name': server.name,
                    'status': 'error',
                    'error': str(result),
                    'health_score': 0,
                    'latency_ms': None
                }
            else:
                health_result = result
            
            # Update server health score
            try:
                server.health_score = health_result['health_score']
                
                # Create health check record
                health_check = ServerHealthCheck(
                    server_id=server.id,
                    latency_ms=health_result.get('latency_ms'),
                    success_rate=health_result['health_score'],
                    error_message=health_result.get('error'),
                    checked_at=datetime.utcnow()
                )
                self.db.add(health_check)
                
                # Log critical health issues
                if health_result['health_score'] < 30:
                    self._log_health_event(
                        server,
                        'critical',
                        f"Server {server.name} health critically low: {health_result['health_score']}%",
                        health_result
                    )
                elif health_result['health_score'] < 50:
                    self._log_health_event(
                        server,
                        'warning',
                        f"Server {server.name} health degraded: {health_result['health_score']}%",
                        health_result
                    )
                
                health_results.append(health_result)
                
            except Exception as e:
                logger.error(f"Failed to update health for server {server.name}: {e}")
        
        # Commit all changes
        try:
            self.db.commit()
            logger.info(f"Health check completed for {len(health_results)} servers")
        except Exception as e:
            logger.error(f"Failed to commit health check results: {e}")
            self.db.rollback()
        
        return health_results
    
    async def _check_server_health(self, server: Server) -> Dict:
        """Check health of a single server"""
        try:
            checker_func = self.checkers.get(server.protocol)
            if not checker_func:
                return {
                    'server_id': server.id,
                    'server_name': server.name,
                    'status': 'unsupported',
                    'error': f"Unsupported protocol: {server.protocol}",
                    'health_score': 0,
                    'latency_ms': None
                }
            
            # Perform health check
            latency_ms, success = await checker_func(server)
            
            # Calculate health score based on latency and success
            health_score = self._calculate_health_score(latency_ms, success)
            
            return {
                'server_id': server.id,
                'server_name': server.name,
                'status': 'healthy' if success else 'unhealthy',
                'health_score': health_score,
                'latency_ms': latency_ms,
                'protocol': server.protocol,
                'location': server.location
            }
            
        except Exception as e:
            logger.error(f"Health check error for server {server.name}: {e}")
            return {
                'server_id': server.id,
                'server_name': server.name,
                'status': 'error',
                'error': str(e),
                'health_score': 0,
                'latency_ms': None
            }
    
    async def _check_vmess_server(self, server: Server) -> Tuple[Optional[int], bool]:
        """Check VMess server health"""
        return await self._check_tcp_connectivity(server.address, server.port)
    
    async def _check_vless_server(self, server: Server) -> Tuple[Optional[int], bool]:
        """Check VLESS server health"""
        return await self._check_tcp_connectivity(server.address, server.port)
    
    async def _check_shadowsocks_server(self, server: Server) -> Tuple[Optional[int], bool]:
        """Check Shadowsocks server health"""
        return await self._check_tcp_connectivity(server.address, server.port)
    
    async def _check_trojan_server(self, server: Server) -> Tuple[Optional[int], bool]:
        """Check Trojan server health"""
        return await self._check_tcp_connectivity(server.address, server.port)
    
    async def _check_socks_server(self, server: Server) -> Tuple[Optional[int], bool]:
        """Check SOCKS server health"""
        return await self._check_tcp_connectivity(server.address, server.port)
    
    async def _check_tcp_connectivity(self, host: str, port: int) -> Tuple[Optional[int], bool]:
        """Check TCP connectivity and measure latency"""
        try:
            start_time = time.time()
            
            # Create connection with timeout
            future = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(future, timeout=10.0)
            
            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Close connection
            writer.close()
            await writer.wait_closed()
            
            return latency_ms, True
            
        except asyncio.TimeoutError:
            logger.warning(f"Connection timeout to {host}:{port}")
            return None, False
        except Exception as e:
            logger.warning(f"Connection failed to {host}:{port}: {e}")
            return None, False
    
    async def _check_http_connectivity(self, url: str) -> Tuple[Optional[int], bool]:
        """Check HTTP/HTTPS connectivity and measure latency"""
        try:
            start_time = time.time()
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.head(url)
                
            latency_ms = int((time.time() - start_time) * 1000)
            success = 200 <= response.status_code < 400
            
            return latency_ms, success
            
        except httpx.TimeoutException:
            return None, False
        except Exception as e:
            logger.warning(f"HTTP check failed for {url}: {e}")
            return None, False
    
    def _calculate_health_score(self, latency_ms: Optional[int], success: bool) -> float:
        """Calculate health score based on latency and success"""
        if not success:
            return 0.0
        
        if latency_ms is None:
            return 0.0
        
        # Base score for successful connection
        base_score = 50.0
        
        # Latency-based scoring
        if latency_ms <= 50:  # Excellent
            latency_score = 50.0
        elif latency_ms <= 100:  # Good
            latency_score = 40.0
        elif latency_ms <= 200:  # Fair
            latency_score = 30.0
        elif latency_ms <= 500:  # Poor
            latency_score = 20.0
        else:  # Very poor
            latency_score = 10.0
        
        return min(base_score + latency_score, 100.0)
    
    def _log_health_event(self, server: Server, severity: str, message: str, metadata: Dict):
        """Log health-related system event"""
        try:
            event = SystemEvent(
                event_type='server_health',
                severity=severity,
                message=message,
                metadata={
                    'server_id': str(server.id),
                    'server_name': server.name,
                    'protocol': server.protocol,
                    'location': server.location,
                    **metadata
                }
            )
            self.db.add(event)
        except Exception as e:
            logger.error(f"Failed to log health event: {e}")


class LoadBalancer:
    """Load balancing service for server selection"""
    
    def __init__(self, strategy: str = 'weighted_random'):
        self.strategy = strategy
        self.strategies = {
            'round_robin': self._round_robin,
            'weighted_random': self._weighted_random,
            'least_connections': self._least_connections,
            'latency_based': self._latency_based,
            'health_based': self._health_based
        }
        self._round_robin_index = 0
    
    def select_server(self, available_servers: List[Server], user_tier: int = 0) -> Optional[Server]:
        """Select best server using configured strategy"""
        if not available_servers:
            return None
        
        # Filter servers by availability and health
        healthy_servers = [
            server for server in available_servers
            if server.is_available and server.health_score >= 50
        ]
        
        if not healthy_servers:
            # Fallback to any available server if no healthy ones
            healthy_servers = [server for server in available_servers if server.is_active]
        
        if not healthy_servers:
            return None
        
        # Apply tier-based filtering if needed
        if user_tier >= 2:  # Premium users get better servers
            premium_servers = [s for s in healthy_servers if s.health_score >= 80]
            if premium_servers:
                healthy_servers = premium_servers
        
        # Select using configured strategy
        strategy_func = self.strategies.get(self.strategy, self._weighted_random)
        return strategy_func(healthy_servers)
    
    def _round_robin(self, servers: List[Server]) -> Server:
        """Round-robin server selection"""
        server = servers[self._round_robin_index % len(servers)]
        self._round_robin_index += 1
        return server
    
    def _weighted_random(self, servers: List[Server]) -> Server:
        """Weighted random selection based on health scores"""
        import random
        
        # Calculate weights based on health scores
        weights = [float(server.health_score) for server in servers]
        total_weight = sum(weights)
        
        if total_weight == 0:
            return random.choice(servers)
        
        # Weighted random selection
        r = random.uniform(0, total_weight)
        cumulative = 0
        
        for i, weight in enumerate(weights):
            cumulative += weight
            if r <= cumulative:
                return servers[i]
        
        return servers[-1]  # Fallback
    
    def _least_connections(self, servers: List[Server]) -> Server:
        """Select server with least connections (based on load score)"""
        return min(servers, key=lambda s: float(s.load_score))
    
    def _latency_based(self, servers: List[Server]) -> Server:
        """Select server with best latency (requires recent health checks)"""
        # This would require access to recent health check data
        # For now, fall back to health-based selection
        return self._health_based(servers)
    
    def _health_based(self, servers: List[Server]) -> Server:
        """Select server with highest health score"""
        return max(servers, key=lambda s: float(s.health_score))


# Health checker service runner
async def run_health_checker():
    """Main health checker service loop"""
    logger.info("Starting health checker service")
    
    while True:
        try:
            db = next(get_db())
            health_checker = ServerHealthChecker(db)
            
            results = await health_checker.check_all_servers()
            logger.info(f"Health check completed: {len(results)} servers checked")
            
        except Exception as e:
            logger.error(f"Health checker error: {e}")
        finally:
            if 'db' in locals():
                db.close()
        
        # Wait for next check interval
        await asyncio.sleep(300)  # 5 minutes


if __name__ == "__main__":
    asyncio.run(run_health_checker()) 