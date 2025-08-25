"""
Large Language Model Service
Handles communication with local and cloud LLM providers.
"""

import asyncio
import json
import time
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, Union, Tuple
from enum import Enum
from dataclasses import dataclass

import httpx
from openai import AsyncOpenAI
import anthropic
import google.generativeai as genai

from app.core.config import get_settings, MODEL_PROVIDERS
from app.core.logging import get_logger, perf_logger


@dataclass
class ModelInfo:
    """Information about an AI model."""
    id: str
    name: str
    provider: str
    type: str  # "local" or "online"
    context_length: int
    recommended: bool
    description: str
    cost_per_1k_tokens: Optional[Dict[str, float]] = None


@dataclass
class ProviderStatus:
    """Status of an AI provider."""
    name: str
    available: bool
    models: List[ModelInfo]
    error: Optional[str] = None
    response_time: Optional[float] = None


logger = get_logger(__name__)
settings = get_settings()


class ModelProvider(Enum):
    """Supported LLM providers."""
    OLLAMA = "ollama"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"
    GOOGLE = "google"
    TOGETHER = "together"


class LLMService:
    """Enhanced service for dual-mode AI processing with multiple providers."""

    def __init__(self):
        self.providers = {}
        self.provider_status: Dict[str, ProviderStatus] = {}
        self.settings = get_settings()
        self.current_mode = self.settings.ai_mode
        self.preferred_provider = self.settings.preferred_provider
        self.fallback_provider = self.settings.fallback_provider
        self._initialize_providers()

    async def initialize(self):
        """Initialize all providers and check their status."""
        await self._check_all_providers_status()
        logger.info(f"✅ LLM Service initialized in {self.current_mode} mode")
        logger.info(f"🎯 Preferred provider: {self.preferred_provider}")
        if self.fallback_provider:
            logger.info(f"🔄 Fallback provider: {self.fallback_provider}")
    
    def _initialize_providers(self):
        """Initialize all available LLM providers."""
        try:
            # Ollama (local)
            if self.settings.ollama_url:
                self.providers[ModelProvider.OLLAMA] = {
                    "client": httpx.AsyncClient(base_url=self.settings.ollama_url, timeout=60.0),
                    "config": MODEL_PROVIDERS["ollama"],
                    "type": "local"
                }
                logger.info(f"✅ Ollama provider initialized: {self.settings.ollama_url}")

            # OpenAI
            if self.settings.openai_api_key:
                self.providers[ModelProvider.OPENAI] = {
                    "client": AsyncOpenAI(api_key=self.settings.openai_api_key),
                    "config": MODEL_PROVIDERS["openai"],
                    "type": "online"
                }
                logger.info("✅ OpenAI provider initialized")

            # Anthropic
            if self.settings.anthropic_api_key:
                self.providers[ModelProvider.ANTHROPIC] = {
                    "client": anthropic.AsyncAnthropic(api_key=self.settings.anthropic_api_key),
                    "config": MODEL_PROVIDERS["anthropic"],
                    "type": "online"
                }
                logger.info("✅ Anthropic provider initialized")

            # Google AI
            if self.settings.google_api_key:
                genai.configure(api_key=self.settings.google_api_key)
                self.providers[ModelProvider.GOOGLE] = {
                    "client": genai,
                    "config": MODEL_PROVIDERS["google"],
                    "type": "online"
                }
                logger.info("✅ Google AI provider initialized")

            # Groq
            if self.settings.groq_api_key:
                self.providers[ModelProvider.GROQ] = {
                    "client": AsyncOpenAI(
                        api_key=self.settings.groq_api_key,
                        base_url="https://api.groq.com/openai/v1"
                    ),
                    "config": MODEL_PROVIDERS["groq"],
                    "type": "online"
                }
                logger.info("✅ Groq provider initialized")

            # Together AI
            if self.settings.together_api_key:
                self.providers[ModelProvider.TOGETHER] = {
                    "client": AsyncOpenAI(
                        api_key=self.settings.together_api_key,
                        base_url="https://api.together.xyz/v1"
                    ),
                    "config": MODEL_PROVIDERS["together"],
                    "type": "online"
                }
                logger.info("✅ Together AI provider initialized")

        except Exception as e:
            logger.error(f"Error initializing LLM providers: {e}")

    async def _check_all_providers_status(self):
        """Check the status of all initialized providers."""
        for provider_enum, provider_data in self.providers.items():
            provider_name = provider_enum.value
            try:
                start_time = time.time()
                is_available = await self._check_provider_health(provider_enum)
                response_time = time.time() - start_time

                # Get model information
                models = []
                for model_config in provider_data["config"]["models"]:
                    model_info = ModelInfo(
                        id=model_config["id"],
                        name=model_config["name"],
                        provider=provider_name,
                        type=provider_data["type"],
                        context_length=model_config["context_length"],
                        recommended=model_config["recommended"],
                        description=model_config["description"],
                        cost_per_1k_tokens=model_config.get("cost_per_1k_tokens")
                    )
                    models.append(model_info)

                self.provider_status[provider_name] = ProviderStatus(
                    name=provider_name,
                    available=is_available,
                    models=models,
                    response_time=response_time
                )

                if is_available:
                    logger.info(f"✅ {provider_data['config']['display_name']} is available ({response_time:.2f}s)")
                else:
                    logger.warning(f"⚠️ {provider_data['config']['display_name']} is not available")

            except Exception as e:
                logger.error(f"❌ Error checking {provider_name}: {e}")
                self.provider_status[provider_name] = ProviderStatus(
                    name=provider_name,
                    available=False,
                    models=[],
                    error=str(e)
                )

    async def _check_provider_health(self, provider: ModelProvider) -> bool:
        """Check if a specific provider is healthy."""
        try:
            if provider == ModelProvider.OLLAMA:
                client = self.providers[provider]["client"]
                response = await client.get("/api/tags", timeout=5.0)
                return response.status_code == 200

            elif provider == ModelProvider.OPENAI:
                client = self.providers[provider]["client"]
                # Simple API call to check availability
                models = await client.models.list()
                return len(models.data) > 0

            elif provider == ModelProvider.ANTHROPIC:
                # For Anthropic, we assume it's available if API key is set
                # since there's no simple health check endpoint
                return True

            elif provider == ModelProvider.GOOGLE:
                # For Google AI, we assume it's available if API key is set
                return True

            elif provider in [ModelProvider.GROQ, ModelProvider.TOGETHER]:
                client = self.providers[provider]["client"]
                models = await client.models.list()
                return len(models.data) > 0

            return False

        except Exception as e:
            logger.debug(f"Health check failed for {provider.value}: {e}")
            return False

    def get_available_providers(self, mode: Optional[str] = None) -> List[ProviderStatus]:
        """Get list of available providers, optionally filtered by mode."""
        available_providers = []

        for provider_status in self.provider_status.values():
            if not provider_status.available:
                continue

            # Filter by mode if specified
            if mode:
                provider_config = MODEL_PROVIDERS.get(provider_status.name, {})
                if provider_config.get("type") != mode:
                    continue

            available_providers.append(provider_status)

        return available_providers

    def select_best_provider(self, preferred: Optional[str] = None) -> Tuple[Optional[ModelProvider], Optional[str]]:
        """Select the best available provider and model."""
        # Try preferred provider first
        if preferred and preferred in self.provider_status:
            status = self.provider_status[preferred]
            if status.available and status.models:
                # Get recommended model or first available
                recommended_model = next(
                    (m for m in status.models if m.recommended),
                    status.models[0]
                )
                provider_enum = ModelProvider(preferred)
                return provider_enum, recommended_model.id

        # Try current mode providers
        mode_filter = "local" if self.current_mode == "local" else "online" if self.current_mode == "online" else None
        available_providers = self.get_available_providers(mode_filter)

        if available_providers:
            # Sort by response time and recommendation
            best_provider = min(available_providers, key=lambda p: p.response_time or float('inf'))
            recommended_model = next(
                (m for m in best_provider.models if m.recommended),
                best_provider.models[0] if best_provider.models else None
            )

            if recommended_model:
                provider_enum = ModelProvider(best_provider.name)
                return provider_enum, recommended_model.id

        # Fallback to any available provider
        for provider_status in self.provider_status.values():
            if provider_status.available and provider_status.models:
                recommended_model = next(
                    (m for m in provider_status.models if m.recommended),
                    provider_status.models[0]
                )
                provider_enum = ModelProvider(provider_status.name)
                return provider_enum, recommended_model.id

        return None, None
    
    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[ModelProvider] = None,
        stream: bool = False,
        max_tokens: int = 2048,
        temperature: float = 0.1
    ) -> Union[str, AsyncGenerator[str, None]]:
        """
        Generate response from LLM.
        
        Args:
            prompt: User prompt/query
            context: Additional context (retrieved code chunks)
            model: Specific model to use
            provider: LLM provider to use
            stream: Whether to stream the response
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature
            
        Returns:
            Generated response (string or async generator for streaming)
        """
        # Select provider and model
        selected_provider = provider or self.default_provider
        if selected_provider not in self.providers:
            # Fallback to available provider
            available_providers = list(self.providers.keys())
            if not available_providers:
                raise RuntimeError("No LLM providers available")
            selected_provider = available_providers[0]
            logger.warning(f"Provider {provider} not available, using {selected_provider}")
        
        # Select model
        available_models = self.providers[selected_provider]["models"]
        selected_model = model or available_models[0]
        if selected_model not in available_models:
            selected_model = available_models[0]
            logger.warning(f"Model {model} not available, using {selected_model}")
        
        # Build messages
        messages = self._build_messages(prompt, context)
        
        logger.info(f"Generating response with {selected_provider.value}:{selected_model}")
        start_time = time.time()
        
        try:
            if stream:
                return self._generate_streaming_response(
                    selected_provider, selected_model, messages, max_tokens, temperature
                )
            else:
                response = await self._generate_single_response(
                    selected_provider, selected_model, messages, max_tokens, temperature
                )
                
                # Log performance
                duration = time.time() - start_time
                perf_logger.log_model_performance(
                    model_name=f"{selected_provider.value}:{selected_model}",
                    operation="generate",
                    duration=duration,
                    tokens=len(response.split())  # Rough token count
                )
                
                return response
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise
    
    def _build_messages(self, prompt: str, context: Optional[str] = None) -> List[Dict[str, str]]:
        """Build message array for LLM."""
        messages = [
            {
                "role": "system",
                "content": self._get_system_prompt()
            }
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Here is relevant code context:\n\n{context}"
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        return messages
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for the AI assistant."""
        return """You are an expert AI coding assistant with deep knowledge of multiple programming languages and software development practices.

Your capabilities include:
- Analyzing and explaining code with detailed context
- Generating high-quality, production-ready code
- Suggesting improvements and refactoring opportunities
- Finding similar code patterns and potential duplications
- Providing comprehensive documentation and comments

Guidelines:
- Always provide accurate, well-structured responses
- Include relevant code examples when helpful
- Explain complex concepts clearly
- Consider security, performance, and maintainability
- Use appropriate programming language conventions
- Be concise but thorough in explanations

When analyzing code:
- Consider the broader context and architecture
- Identify potential issues or improvements
- Explain the purpose and functionality clearly
- Suggest best practices and alternatives when relevant"""
    
    async def _generate_single_response(
        self,
        provider: ModelProvider,
        model: str,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Generate a single (non-streaming) response."""
        if provider == ModelProvider.OLLAMA:
            return await self._ollama_generate(model, messages, max_tokens, temperature)
        elif provider == ModelProvider.OPENAI:
            return await self._openai_generate(model, messages, max_tokens, temperature)
        elif provider == ModelProvider.ANTHROPIC:
            return await self._anthropic_generate(model, messages, max_tokens, temperature)
        elif provider == ModelProvider.GROQ:
            return await self._groq_generate(model, messages, max_tokens, temperature)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    async def _generate_streaming_response(
        self,
        provider: ModelProvider,
        model: str,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response."""
        if provider == ModelProvider.OLLAMA:
            async for chunk in self._ollama_stream(model, messages, max_tokens, temperature):
                yield chunk
        elif provider == ModelProvider.OPENAI:
            async for chunk in self._openai_stream(model, messages, max_tokens, temperature):
                yield chunk
        elif provider == ModelProvider.GROQ:
            async for chunk in self._groq_stream(model, messages, max_tokens, temperature):
                yield chunk
        else:
            # Fallback to non-streaming for unsupported providers
            response = await self._generate_single_response(
                provider, model, messages, max_tokens, temperature
            )
            yield response
    
    async def _ollama_generate(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> str:
        """Generate response using Ollama."""
        client = self.providers[ModelProvider.OLLAMA]["client"]
        
        # Convert messages to Ollama format
        prompt = self._messages_to_prompt(messages)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
                "top_p": 0.9,
                "stop": ["<|im_end|>", "<|endoftext|>"]
            }
        }
        
        response = await client.post("/api/generate", json=payload)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    
    async def _ollama_stream(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response using Ollama."""
        client = self.providers[ModelProvider.OLLAMA]["client"]
        
        prompt = self._messages_to_prompt(messages)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
                "top_p": 0.9,
                "stop": ["<|im_end|>", "<|endoftext|>"]
            }
        }
        
        async with client.stream("POST", "/api/generate", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
                        if data.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
    
    async def _openai_generate(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> str:
        """Generate response using OpenAI."""
        client = self.providers[ModelProvider.OPENAI]["client"]
        
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9
        )
        
        return response.choices[0].message.content
    
    async def _openai_stream(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response using OpenAI."""
        client = self.providers[ModelProvider.OPENAI]["client"]
        
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def _anthropic_generate(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> str:
        """Generate response using Anthropic."""
        client = self.providers[ModelProvider.ANTHROPIC]["client"]
        
        # Convert messages format for Anthropic
        system_message = ""
        user_messages = []
        
        for msg in messages:
            if msg["role"] == "system":
                system_message += msg["content"] + "\n"
            else:
                user_messages.append(msg)
        
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_message.strip(),
            messages=user_messages
        )
        
        return response.content[0].text
    
    async def _groq_generate(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> str:
        """Generate response using Groq."""
        client = self.providers[ModelProvider.GROQ]["client"]
        
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9
        )
        
        return response.choices[0].message.content
    
    async def _groq_stream(
        self, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response using Groq."""
        client = self.providers[ModelProvider.GROQ]["client"]
        
        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convert messages to a single prompt for models that don't support chat format."""
        prompt_parts = []
        
        for message in messages:
            role = message["role"]
            content = message["content"]
            
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
        
        prompt_parts.append("Assistant:")
        return "\n\n".join(prompt_parts)
    
    async def get_available_models(self) -> Dict[str, List[str]]:
        """Get available models for each provider."""
        available_models = {}
        
        for provider, config in self.providers.items():
            if provider == ModelProvider.OLLAMA:
                # Query Ollama for available models
                try:
                    client = config["client"]
                    response = await client.get("/api/tags")
                    if response.status_code == 200:
                        data = response.json()
                        models = [model["name"] for model in data.get("models", [])]
                        available_models[provider.value] = models
                    else:
                        available_models[provider.value] = config["models"]
                except:
                    available_models[provider.value] = config["models"]
            else:
                available_models[provider.value] = config["models"]
        
        return available_models
    
    async def health_check(self) -> Dict[str, bool]:
        """Check health of all LLM providers."""
        health_status = {}
        
        for provider, config in self.providers.items():
            try:
                if provider == ModelProvider.OLLAMA:
                    client = config["client"]
                    response = await client.get("/api/tags", timeout=5.0)
                    health_status[provider.value] = response.status_code == 200
                else:
                    # For cloud providers, assume healthy if API key is configured
                    health_status[provider.value] = True
                    
            except Exception as e:
                logger.debug(f"Health check failed for {provider.value}: {e}")
                health_status[provider.value] = False
        
        return health_status
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            for provider, config in self.providers.items():
                if "client" in config and hasattr(config["client"], "aclose"):
                    await config["client"].aclose()
            
            logger.info("✅ LLMService cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during LLMService cleanup: {e}")
