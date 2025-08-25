"""
Application Configuration
Centralized configuration management using Pydantic settings.
"""

import os
from functools import lru_cache
from typing import List, Optional, Literal
from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(default="INFO", env="LOG_LEVEL")
    
    # Vector Database Configuration
    qdrant_url: str = Field(default="http://localhost:6333", env="QDRANT_URL")
    qdrant_api_key: Optional[str] = Field(default=None, env="QDRANT_API_KEY")
    qdrant_collection_name: str = Field(default="code_chunks", env="QDRANT_COLLECTION_NAME")
    
    # AI Model Configuration
    ollama_url: str = Field(default="http://localhost:11434", env="OLLAMA_URL")
    embedding_model: str = Field(default="all-MiniLM-L6-v2", env="EMBEDDING_MODEL")
    default_llm_model: str = Field(default="codellama:7b-code", env="DEFAULT_LLM_MODEL")
    
    # AI Processing Mode
    ai_mode: Literal["local", "online", "hybrid"] = Field(default="local", env="AI_MODE")
    preferred_provider: str = Field(default="ollama", env="PREFERRED_PROVIDER")
    fallback_provider: Optional[str] = Field(default=None, env="FALLBACK_PROVIDER")

    # Cloud API Keys (Optional - Free Tiers)
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    groq_api_key: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    google_api_key: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")
    together_api_key: Optional[str] = Field(default=None, env="TOGETHER_API_KEY")
    
    # Redis Configuration (Optional)
    redis_url: Optional[str] = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Indexing Configuration
    max_chunk_size: int = Field(default=500, env="MAX_CHUNK_SIZE")
    chunk_overlap: int = Field(default=50, env="CHUNK_OVERLAP")
    max_retrieval_count: int = Field(default=10, env="MAX_RETRIEVAL_COUNT")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    
    # Performance Configuration
    max_concurrent_requests: int = Field(default=50, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")
    max_context_length: int = Field(default=8192, env="MAX_CONTEXT_LENGTH")
    
    # File Processing Configuration
    supported_extensions: List[str] = Field(
        default=[
            ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".h", 
            ".hpp", ".rs", ".go", ".php", ".rb", ".cs", ".swift", ".kt", ".scala"
        ],
        env="SUPPORTED_EXTENSIONS"
    )
    
    ignore_patterns: List[str] = Field(
        default=[
            "node_modules/**", ".git/**", "*.min.js", "dist/**", "build/**",
            "venv/**", "__pycache__/**", "*.pyc", ".pytest_cache/**",
            "coverage/**", ".coverage", "*.log", "logs/**"
        ],
        env="IGNORE_PATTERNS"
    )
    
    # Security Configuration
    api_key: Optional[str] = Field(default=None, env="API_KEY")
    cors_origins: List[str] = Field(default=["*"], env="CORS_ORIGINS")
    
    # Storage Configuration
    cache_dir: str = Field(default="./cache", env="CACHE_DIR")
    logs_dir: str = Field(default="./logs", env="LOGS_DIR")
    
    @validator("supported_extensions", pre=True)
    def parse_extensions(cls, v):
        """Parse comma-separated extensions from environment variable."""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v
    
    @validator("ignore_patterns", pre=True)
    def parse_ignore_patterns(cls, v):
        """Parse comma-separated ignore patterns from environment variable."""
        if isinstance(v, str):
            return [pattern.strip() for pattern in v.split(",")]
        return v
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        """Parse comma-separated CORS origins from environment variable."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


# Enhanced Model provider configurations with latest models
MODEL_PROVIDERS = {
    "ollama": {
        "type": "local",
        "base_url": lambda settings: settings.ollama_url,
        "display_name": "Ollama (Local)",
        "description": "Local AI models running on your machine",
        "models": [
            {
                "id": "codellama:7b-code",
                "name": "CodeLlama 7B Code",
                "description": "Specialized for code generation and understanding",
                "context_length": 16384,
                "recommended": True
            },
            {
                "id": "deepseek-coder:6.7b",
                "name": "DeepSeek Coder 6.7B",
                "description": "Advanced coding model with multilingual support",
                "context_length": 16384,
                "recommended": True
            },
            {
                "id": "qwen2.5-coder:7b",
                "name": "Qwen2.5 Coder 7B",
                "description": "Latest Qwen model optimized for coding",
                "context_length": 32768,
                "recommended": True
            },
            {
                "id": "llama2:7b",
                "name": "Llama 2 7B",
                "description": "General purpose language model",
                "context_length": 4096,
                "recommended": False
            }
        ]
    },
    "openai": {
        "type": "online",
        "base_url": "https://api.openai.com/v1",
        "display_name": "OpenAI",
        "description": "Industry-leading AI models from OpenAI",
        "models": [
            {
                "id": "gpt-4o",
                "name": "GPT-4o",
                "description": "Latest multimodal model with enhanced reasoning",
                "context_length": 128000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.005, "output": 0.015}
            },
            {
                "id": "gpt-4-turbo",
                "name": "GPT-4 Turbo",
                "description": "Fast and capable model for complex tasks",
                "context_length": 128000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.01, "output": 0.03}
            },
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "description": "Fast and efficient for most coding tasks",
                "context_length": 16385,
                "recommended": False,
                "cost_per_1k_tokens": {"input": 0.0005, "output": 0.0015}
            }
        ]
    },
    "anthropic": {
        "type": "online",
        "base_url": "https://api.anthropic.com",
        "display_name": "Anthropic",
        "description": "Advanced AI models with strong reasoning capabilities",
        "models": [
            {
                "id": "claude-3-5-sonnet-20241022",
                "name": "Claude 3.5 Sonnet",
                "description": "Latest Claude model with enhanced coding abilities",
                "context_length": 200000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.003, "output": 0.015}
            },
            {
                "id": "claude-3-opus-20240229",
                "name": "Claude 3 Opus",
                "description": "Most capable model for complex reasoning",
                "context_length": 200000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.015, "output": 0.075}
            },
            {
                "id": "claude-3-haiku-20240307",
                "name": "Claude 3 Haiku",
                "description": "Fast and efficient for quick tasks",
                "context_length": 200000,
                "recommended": False,
                "cost_per_1k_tokens": {"input": 0.00025, "output": 0.00125}
            }
        ]
    },
    "google": {
        "type": "online",
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "display_name": "Google AI",
        "description": "Google's advanced AI models",
        "models": [
            {
                "id": "gemini-1.5-pro",
                "name": "Gemini 1.5 Pro",
                "description": "Advanced multimodal model with large context",
                "context_length": 2000000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.00125, "output": 0.005}
            },
            {
                "id": "gemini-1.5-flash",
                "name": "Gemini 1.5 Flash",
                "description": "Fast and efficient multimodal model",
                "context_length": 1000000,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.000075, "output": 0.0003}
            }
        ]
    },
    "groq": {
        "type": "online",
        "base_url": "https://api.groq.com/openai/v1",
        "display_name": "Groq",
        "description": "Ultra-fast inference with open-source models",
        "models": [
            {
                "id": "llama-3.1-70b-versatile",
                "name": "Llama 3.1 70B",
                "description": "Large model with excellent reasoning",
                "context_length": 131072,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.00059, "output": 0.00079}
            },
            {
                "id": "mixtral-8x7b-32768",
                "name": "Mixtral 8x7B",
                "description": "Mixture of experts model",
                "context_length": 32768,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.00024, "output": 0.00024}
            },
            {
                "id": "llama-3.1-8b-instant",
                "name": "Llama 3.1 8B Instant",
                "description": "Fast and efficient for quick tasks",
                "context_length": 131072,
                "recommended": False,
                "cost_per_1k_tokens": {"input": 0.00005, "output": 0.00008}
            }
        ]
    },
    "together": {
        "type": "online",
        "base_url": "https://api.together.xyz/v1",
        "display_name": "Together AI",
        "description": "Open-source models with competitive pricing",
        "models": [
            {
                "id": "meta-llama/Llama-3-70b-chat-hf",
                "name": "Llama 3 70B Chat",
                "description": "Large open-source model",
                "context_length": 8192,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.0009, "output": 0.0009}
            },
            {
                "id": "codellama/CodeLlama-34b-Instruct-hf",
                "name": "CodeLlama 34B Instruct",
                "description": "Large coding-specialized model",
                "context_length": 16384,
                "recommended": True,
                "cost_per_1k_tokens": {"input": 0.000776, "output": 0.000776}
            }
        ]
    }
}

# Embedding model configurations
EMBEDDING_MODELS = {
    "all-MiniLM-L6-v2": {
        "dimensions": 384,
        "max_seq_length": 256,
        "model_size": "80MB"
    },
    "all-mpnet-base-v2": {
        "dimensions": 768,
        "max_seq_length": 384,
        "model_size": "420MB"
    },
    "paraphrase-MiniLM-L3-v2": {
        "dimensions": 384,
        "max_seq_length": 128,
        "model_size": "61MB"
    }
}

# Language configurations for Tree-sitter
LANGUAGE_CONFIGS = {
    "python": {
        "extensions": [".py"],
        "tree_sitter_language": "python",
        "comment_patterns": ["#"],
        "docstring_patterns": ['"""', "'''"]
    },
    "javascript": {
        "extensions": [".js", ".jsx"],
        "tree_sitter_language": "javascript", 
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"]
    },
    "typescript": {
        "extensions": [".ts", ".tsx"],
        "tree_sitter_language": "typescript",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"]
    },
    "java": {
        "extensions": [".java"],
        "tree_sitter_language": "java",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"]
    },
    "cpp": {
        "extensions": [".cpp", ".c", ".h", ".hpp"],
        "tree_sitter_language": "cpp",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"]
    },
    "rust": {
        "extensions": [".rs"],
        "tree_sitter_language": "rust",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["///", "/**"]
    },
    "go": {
        "extensions": [".go"],
        "tree_sitter_language": "go",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["//"]
    }
}
