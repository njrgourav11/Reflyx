"""
Structured Logging Configuration
Centralized logging setup with structured output and multiple handlers.
"""

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Optional

import structlog
from rich.console import Console
from rich.logging import RichHandler


def setup_logging(log_level: str = "INFO", logs_dir: Optional[str] = None):
    """
    Set up structured logging with both console and file output.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        logs_dir: Directory for log files (optional)
    """
    # Create logs directory if specified
    if logs_dir:
        logs_path = Path(logs_dir)
        logs_path.mkdir(parents=True, exist_ok=True)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Set up root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler with Rich formatting
    console = Console(stderr=True)
    console_handler = RichHandler(
        console=console,
        show_time=True,
        show_path=True,
        markup=True,
        rich_tracebacks=True
    )
    console_handler.setLevel(getattr(logging, log_level.upper()))
    
    # Console formatter
    console_formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler (if logs directory is specified)
    if logs_dir:
        # Main log file
        file_handler = logging.handlers.RotatingFileHandler(
            filename=logs_path / "ai_assistant.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding="utf-8"
        )
        file_handler.setLevel(logging.DEBUG)
        
        # File formatter with JSON structure
        file_formatter = logging.Formatter(
            fmt='{"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
            datefmt="%Y-%m-%dT%H:%M:%S"
        )
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)
        
        # Error log file
        error_handler = logging.handlers.RotatingFileHandler(
            filename=logs_path / "errors.log",
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=3,
            encoding="utf-8"
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(file_formatter)
        root_logger.addHandler(error_handler)
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("qdrant_client").setLevel(logging.WARNING)
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
    logging.getLogger("transformers").setLevel(logging.WARNING)
    logging.getLogger("torch").setLevel(logging.WARNING)
    
    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info(f"✅ Logging configured - Level: {log_level}")
    if logs_dir:
        logger.info(f"📁 Log files: {logs_path}")


class ContextLogger:
    """Context-aware logger for request tracking."""
    
    def __init__(self, logger_name: str):
        self.logger = structlog.get_logger(logger_name)
    
    def bind(self, **kwargs):
        """Bind context variables to logger."""
        return self.logger.bind(**kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message with context."""
        self.logger.debug(message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message with context."""
        self.logger.info(message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with context."""
        self.logger.warning(message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message with context."""
        self.logger.error(message, **kwargs)
    
    def exception(self, message: str, **kwargs):
        """Log exception with traceback."""
        self.logger.exception(message, **kwargs)


def get_logger(name: str) -> ContextLogger:
    """Get a context-aware logger instance."""
    return ContextLogger(name)


# Performance logging utilities
class PerformanceLogger:
    """Logger for performance metrics and timing."""
    
    def __init__(self):
        self.logger = get_logger("performance")
    
    def log_request_time(self, endpoint: str, method: str, duration: float, status_code: int):
        """Log API request performance."""
        self.logger.info(
            "API request completed",
            endpoint=endpoint,
            method=method,
            duration_ms=round(duration * 1000, 2),
            status_code=status_code
        )
    
    def log_indexing_performance(self, files_processed: int, duration: float, errors: int = 0):
        """Log indexing performance metrics."""
        self.logger.info(
            "Indexing completed",
            files_processed=files_processed,
            duration_seconds=round(duration, 2),
            files_per_second=round(files_processed / duration if duration > 0 else 0, 2),
            errors=errors
        )
    
    def log_query_performance(self, query_type: str, duration: float, results_count: int):
        """Log query performance metrics."""
        self.logger.info(
            "Query completed",
            query_type=query_type,
            duration_ms=round(duration * 1000, 2),
            results_count=results_count
        )
    
    def log_model_performance(self, model_name: str, operation: str, duration: float, tokens: int = 0):
        """Log AI model performance metrics."""
        self.logger.info(
            "Model operation completed",
            model_name=model_name,
            operation=operation,
            duration_ms=round(duration * 1000, 2),
            tokens=tokens,
            tokens_per_second=round(tokens / duration if duration > 0 and tokens > 0 else 0, 2)
        )


# Global performance logger instance
perf_logger = PerformanceLogger()
