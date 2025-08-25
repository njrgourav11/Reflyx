"""
Performance Monitoring Service
Tracks system performance, API usage, and provides optimization insights.
"""

import asyncio
import time
import psutil
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
from datetime import datetime, timedelta

from app.core.logging import get_logger


logger = get_logger(__name__)


@dataclass
class PerformanceMetric:
    """Individual performance metric."""
    timestamp: float
    metric_type: str
    value: float
    metadata: Dict[str, Any]


@dataclass
class SystemStats:
    """System resource statistics."""
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    memory_total_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float
    network_sent_mb: float
    network_recv_mb: float
    timestamp: float


@dataclass
class APIMetrics:
    """API performance metrics."""
    endpoint: str
    method: str
    response_time: float
    status_code: int
    timestamp: float
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None


@dataclass
class ModelPerformance:
    """AI model performance metrics."""
    provider: str
    model: str
    operation: str
    duration: float
    tokens_input: int
    tokens_output: int
    success: bool
    timestamp: float
    error: Optional[str] = None


class PerformanceMonitor:
    """Monitors and tracks system and application performance."""
    
    def __init__(self, max_metrics: int = 10000):
        self.max_metrics = max_metrics
        self.metrics: deque = deque(maxlen=max_metrics)
        self.system_stats: deque = deque(maxlen=1000)  # Last 1000 system snapshots
        self.api_metrics: deque = deque(maxlen=5000)   # Last 5000 API calls
        self.model_metrics: deque = deque(maxlen=2000) # Last 2000 model calls
        
        # Aggregated statistics
        self.hourly_stats: Dict[str, Dict] = defaultdict(dict)
        self.daily_stats: Dict[str, Dict] = defaultdict(dict)
        
        # Performance thresholds
        self.thresholds = {
            'cpu_warning': 80.0,
            'cpu_critical': 95.0,
            'memory_warning': 85.0,
            'memory_critical': 95.0,
            'disk_warning': 90.0,
            'disk_critical': 98.0,
            'api_response_warning': 5.0,  # seconds
            'api_response_critical': 10.0,
            'model_response_warning': 30.0,
            'model_response_critical': 60.0
        }
        
        # Monitoring task
        self.monitoring_task: Optional[asyncio.Task] = None
        self.is_monitoring = False
        
        # Network baseline (for calculating deltas)
        self.network_baseline = None
    
    async def start_monitoring(self, interval: float = 30.0):
        """Start continuous performance monitoring."""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        self.monitoring_task = asyncio.create_task(self._monitoring_loop(interval))
        logger.info(f"✅ Performance monitoring started (interval: {interval}s)")
    
    async def stop_monitoring(self):
        """Stop performance monitoring."""
        self.is_monitoring = False
        
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
        
        logger.info("🛑 Performance monitoring stopped")
    
    async def _monitoring_loop(self, interval: float):
        """Main monitoring loop."""
        try:
            while self.is_monitoring:
                await self._collect_system_stats()
                await self._update_aggregated_stats()
                await self._check_thresholds()
                await asyncio.sleep(interval)
                
        except asyncio.CancelledError:
            logger.info("Monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
    
    async def _collect_system_stats(self):
        """Collect current system statistics."""
        try:
            # CPU and Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Disk usage
            disk = psutil.disk_usage('/')
            
            # Network I/O
            network = psutil.net_io_counters()
            
            # Calculate network deltas
            if self.network_baseline is None:
                self.network_baseline = network
                network_sent_mb = 0
                network_recv_mb = 0
            else:
                network_sent_mb = (network.bytes_sent - self.network_baseline.bytes_sent) / (1024 * 1024)
                network_recv_mb = (network.bytes_recv - self.network_baseline.bytes_recv) / (1024 * 1024)
            
            stats = SystemStats(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_used_gb=memory.used / (1024**3),
                memory_total_gb=memory.total / (1024**3),
                disk_percent=disk.percent,
                disk_used_gb=disk.used / (1024**3),
                disk_total_gb=disk.total / (1024**3),
                network_sent_mb=network_sent_mb,
                network_recv_mb=network_recv_mb,
                timestamp=time.time()
            )
            
            self.system_stats.append(stats)
            
        except Exception as e:
            logger.error(f"Error collecting system stats: {e}")
    
    async def _update_aggregated_stats(self):
        """Update hourly and daily aggregated statistics."""
        try:
            current_time = datetime.now()
            hour_key = current_time.strftime("%Y-%m-%d-%H")
            day_key = current_time.strftime("%Y-%m-%d")
            
            # Update hourly stats
            if hour_key not in self.hourly_stats:
                self.hourly_stats[hour_key] = {
                    'api_calls': 0,
                    'model_calls': 0,
                    'avg_response_time': 0,
                    'errors': 0,
                    'total_tokens': 0
                }
            
            # Update daily stats
            if day_key not in self.daily_stats:
                self.daily_stats[day_key] = {
                    'api_calls': 0,
                    'model_calls': 0,
                    'avg_response_time': 0,
                    'errors': 0,
                    'total_tokens': 0,
                    'unique_users': set()
                }
            
            # Clean old stats (keep last 7 days)
            cutoff_date = current_time - timedelta(days=7)
            cutoff_day = cutoff_date.strftime("%Y-%m-%d")
            
            # Remove old daily stats
            old_days = [day for day in self.daily_stats.keys() if day < cutoff_day]
            for day in old_days:
                del self.daily_stats[day]
            
            # Remove old hourly stats (keep last 24 hours)
            cutoff_hour = (current_time - timedelta(hours=24)).strftime("%Y-%m-%d-%H")
            old_hours = [hour for hour in self.hourly_stats.keys() if hour < cutoff_hour]
            for hour in old_hours:
                del self.hourly_stats[hour]
                
        except Exception as e:
            logger.error(f"Error updating aggregated stats: {e}")
    
    async def _check_thresholds(self):
        """Check performance thresholds and log warnings."""
        if not self.system_stats:
            return
        
        latest_stats = self.system_stats[-1]
        
        # Check CPU
        if latest_stats.cpu_percent > self.thresholds['cpu_critical']:
            logger.critical(f"🚨 Critical CPU usage: {latest_stats.cpu_percent:.1f}%")
        elif latest_stats.cpu_percent > self.thresholds['cpu_warning']:
            logger.warning(f"⚠️ High CPU usage: {latest_stats.cpu_percent:.1f}%")
        
        # Check Memory
        if latest_stats.memory_percent > self.thresholds['memory_critical']:
            logger.critical(f"🚨 Critical memory usage: {latest_stats.memory_percent:.1f}%")
        elif latest_stats.memory_percent > self.thresholds['memory_warning']:
            logger.warning(f"⚠️ High memory usage: {latest_stats.memory_percent:.1f}%")
        
        # Check Disk
        if latest_stats.disk_percent > self.thresholds['disk_critical']:
            logger.critical(f"🚨 Critical disk usage: {latest_stats.disk_percent:.1f}%")
        elif latest_stats.disk_percent > self.thresholds['disk_warning']:
            logger.warning(f"⚠️ High disk usage: {latest_stats.disk_percent:.1f}%")
    
    def record_api_call(
        self,
        endpoint: str,
        method: str,
        response_time: float,
        status_code: int,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ):
        """Record API call metrics."""
        metric = APIMetrics(
            endpoint=endpoint,
            method=method,
            response_time=response_time,
            status_code=status_code,
            timestamp=time.time(),
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        self.api_metrics.append(metric)
        
        # Update aggregated stats
        current_time = datetime.now()
        hour_key = current_time.strftime("%Y-%m-%d-%H")
        day_key = current_time.strftime("%Y-%m-%d")
        
        if hour_key in self.hourly_stats:
            self.hourly_stats[hour_key]['api_calls'] += 1
            if status_code >= 400:
                self.hourly_stats[hour_key]['errors'] += 1
        
        if day_key in self.daily_stats:
            self.daily_stats[day_key]['api_calls'] += 1
            if status_code >= 400:
                self.daily_stats[day_key]['errors'] += 1
            if ip_address:
                self.daily_stats[day_key]['unique_users'].add(ip_address)
        
        # Check response time thresholds
        if response_time > self.thresholds['api_response_critical']:
            logger.critical(f"🚨 Critical API response time: {response_time:.2f}s for {method} {endpoint}")
        elif response_time > self.thresholds['api_response_warning']:
            logger.warning(f"⚠️ Slow API response: {response_time:.2f}s for {method} {endpoint}")
    
    def record_model_performance(
        self,
        provider: str,
        model: str,
        operation: str,
        duration: float,
        tokens_input: int = 0,
        tokens_output: int = 0,
        success: bool = True,
        error: Optional[str] = None
    ):
        """Record AI model performance metrics."""
        metric = ModelPerformance(
            provider=provider,
            model=model,
            operation=operation,
            duration=duration,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            success=success,
            timestamp=time.time(),
            error=error
        )
        
        self.model_metrics.append(metric)
        
        # Update aggregated stats
        current_time = datetime.now()
        hour_key = current_time.strftime("%Y-%m-%d-%H")
        day_key = current_time.strftime("%Y-%m-%d")
        
        total_tokens = tokens_input + tokens_output
        
        if hour_key in self.hourly_stats:
            self.hourly_stats[hour_key]['model_calls'] += 1
            self.hourly_stats[hour_key]['total_tokens'] += total_tokens
            if not success:
                self.hourly_stats[hour_key]['errors'] += 1
        
        if day_key in self.daily_stats:
            self.daily_stats[day_key]['model_calls'] += 1
            self.daily_stats[day_key]['total_tokens'] += total_tokens
            if not success:
                self.daily_stats[day_key]['errors'] += 1
        
        # Check model response time thresholds
        if duration > self.thresholds['model_response_critical']:
            logger.critical(f"🚨 Critical model response time: {duration:.2f}s for {provider}:{model}")
        elif duration > self.thresholds['model_response_warning']:
            logger.warning(f"⚠️ Slow model response: {duration:.2f}s for {provider}:{model}")
    
    def get_current_stats(self) -> Dict[str, Any]:
        """Get current performance statistics."""
        current_system = self.system_stats[-1] if self.system_stats else None
        
        # Recent API metrics (last 100 calls)
        recent_api_calls = list(self.api_metrics)[-100:]
        avg_response_time = sum(call.response_time for call in recent_api_calls) / len(recent_api_calls) if recent_api_calls else 0
        error_rate = sum(1 for call in recent_api_calls if call.status_code >= 400) / len(recent_api_calls) if recent_api_calls else 0
        
        # Recent model metrics (last 50 calls)
        recent_model_calls = list(self.model_metrics)[-50:]
        avg_model_time = sum(call.duration for call in recent_model_calls) / len(recent_model_calls) if recent_model_calls else 0
        model_success_rate = sum(1 for call in recent_model_calls if call.success) / len(recent_model_calls) if recent_model_calls else 1
        
        return {
            "system": asdict(current_system) if current_system else None,
            "api": {
                "total_calls": len(self.api_metrics),
                "avg_response_time": avg_response_time,
                "error_rate": error_rate,
                "recent_calls": len(recent_api_calls)
            },
            "models": {
                "total_calls": len(self.model_metrics),
                "avg_response_time": avg_model_time,
                "success_rate": model_success_rate,
                "recent_calls": len(recent_model_calls)
            },
            "aggregated": {
                "hourly": dict(self.hourly_stats),
                "daily": {k: {**v, 'unique_users': len(v['unique_users']) if 'unique_users' in v else 0} 
                         for k, v in self.daily_stats.items()}
            }
        }
    
    def get_performance_insights(self) -> List[str]:
        """Get performance optimization insights."""
        insights = []
        
        if not self.system_stats:
            return insights
        
        latest_stats = self.system_stats[-1]
        
        # System insights
        if latest_stats.cpu_percent > 70:
            insights.append("Consider scaling up CPU resources or optimizing CPU-intensive operations")
        
        if latest_stats.memory_percent > 80:
            insights.append("Memory usage is high - consider optimizing memory usage or adding more RAM")
        
        if latest_stats.disk_percent > 85:
            insights.append("Disk space is running low - consider cleanup or adding storage")
        
        # API insights
        if self.api_metrics:
            recent_calls = list(self.api_metrics)[-100:]
            slow_calls = [call for call in recent_calls if call.response_time > 3.0]
            
            if len(slow_calls) > len(recent_calls) * 0.1:  # More than 10% slow calls
                insights.append("API response times are slow - consider optimizing database queries or caching")
        
        # Model insights
        if self.model_metrics:
            recent_model_calls = list(self.model_metrics)[-50:]
            failed_calls = [call for call in recent_model_calls if not call.success]
            
            if len(failed_calls) > len(recent_model_calls) * 0.05:  # More than 5% failures
                insights.append("Model calls are failing frequently - check provider connectivity and API keys")
        
        return insights


# Global performance monitor instance
performance_monitor = PerformanceMonitor()


async def get_performance_monitor() -> PerformanceMonitor:
    """Get the global performance monitor instance."""
    return performance_monitor
