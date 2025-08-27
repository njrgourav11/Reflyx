"""
Retrieval-Augmented Generation (RAG) Service
Combines semantic search with LLM generation for context-aware responses.
"""

import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

import numpy as np

from app.core.config import get_settings
from app.core.logging import get_logger, perf_logger
from app.services.llm_service import LLMService, ModelProvider
# from indexer.embeddings.sentence_transformer import EmbeddingService
# from indexer.vector_store.qdrant_client import QdrantVectorStore, format_search_results

# Mock classes for development
class EmbeddingService:
    def __init__(self, *args, **kwargs):
        pass

    async def embed_text(self, text: str):
        # Mock embedding - return random vector
        import random
        return [random.random() for _ in range(384)]

    async def embed_batch(self, texts: list):
        return [await self.embed_text(text) for text in texts]

class QdrantVectorStore:
    def __init__(self, *args, **kwargs):
        self.data = {}

    async def search(self, query_vector, limit=10):
        # Mock search results
        return [
            {"id": "mock1", "score": 0.9, "payload": {"text": "Mock result 1", "file": "example.py"}},
            {"id": "mock2", "score": 0.8, "payload": {"text": "Mock result 2", "file": "main.js"}}
        ]

    async def add_documents(self, documents):
        for doc in documents:
            self.data[doc.get("id", "unknown")] = doc
        return len(documents)

def format_search_results(results):
    return [
        {
            "content": result.get("payload", {}).get("text", ""),
            "file": result.get("payload", {}).get("file", "unknown"),
            "score": result.get("score", 0.0)
        }
        for result in results
    ]


logger = get_logger(__name__)
settings = get_settings()


@dataclass
class RAGResult:
    """Result from RAG pipeline."""
    response: str
    retrieved_chunks: List[Dict[str, Any]]
    processing_time: float
    model_used: str
    retrieval_score: float


class RAGService:
    """Service for retrieval-augmented generation."""
    
    def __init__(self):
        self.embedding_service: Optional[EmbeddingService] = None
        self.vector_store: Optional[QdrantVectorStore] = None
        self.llm_service: Optional[LLMService] = None
        
    async def initialize(self):
        """Initialize RAG service components."""
        try:
            logger.info("Initializing RAG service...")
            
            # Initialize embedding service
            self.embedding_service = EmbeddingService(
                model_name=settings.embedding_model,
                cache_dir=f"{settings.cache_dir}/embeddings"
            )
            await self.embedding_service.initialize()
            
            # Initialize vector store
            self.vector_store = QdrantVectorStore(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                collection_name=settings.qdrant_collection_name,
                embedding_dim=self.embedding_service.get_embedding_dimension()
            )
            await self.vector_store.initialize()
            
            # Initialize LLM service
            self.llm_service = LLMService()
            
            logger.info("✅ RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG service: {e}")
            raise
    
    async def query_codebase(
        self,
        query: str,
        max_results: int = 10,
        similarity_threshold: float = 0.7,
        language_filter: Optional[List[str]] = None,
        include_context: bool = True,
        model: Optional[str] = None,
        provider: Optional[ModelProvider] = None
    ) -> RAGResult:
        """
        Query the codebase using RAG pipeline.
        
        Args:
            query: Natural language query
            max_results: Maximum number of chunks to retrieve
            similarity_threshold: Minimum similarity score
            language_filter: Filter by programming languages
            include_context: Include surrounding code context
            model: Specific LLM model to use
            provider: LLM provider to use
            
        Returns:
            RAG result with response and metadata
        """
        start_time = time.time()
        
        try:
            # Step 1: Generate query embedding
            logger.debug(f"Generating embedding for query: {query[:100]}...")
            query_embedding = await self.embedding_service.generate_query_embedding(query)
            
            # Step 2: Retrieve similar chunks
            logger.debug("Retrieving similar code chunks...")
            filters = {}
            if language_filter:
                filters["language"] = language_filter
            
            search_results = await self.vector_store.search_similar(
                query_embedding=query_embedding,
                limit=max_results,
                score_threshold=similarity_threshold,
                filters=filters
            )
            
            retrieved_chunks = format_search_results(search_results)
            
            # Step 3: Build context from retrieved chunks
            context = self._build_context(retrieved_chunks, include_context)
            
            # Step 4: Generate response using LLM
            logger.debug("Generating LLM response...")
            enhanced_prompt = self._build_query_prompt(query, len(retrieved_chunks))
            
            response = await self.llm_service.generate_response(
                prompt=enhanced_prompt,
                context=context,
                model=model,
                provider=provider,
                temperature=0.1,
                max_tokens=2048
            )
            
            # Calculate metrics
            processing_time = time.time() - start_time
            retrieval_score = np.mean([chunk["similarity_score"] for chunk in retrieved_chunks]) if retrieved_chunks else 0.0
            model_used = f"{provider.value if provider else 'default'}:{model or 'default'}"
            
            # Log performance
            perf_logger.log_query_performance(
                query_type="codebase_query",
                duration=processing_time,
                results_count=len(retrieved_chunks)
            )
            
            return RAGResult(
                response=response,
                retrieved_chunks=retrieved_chunks,
                processing_time=processing_time,
                model_used=model_used,
                retrieval_score=retrieval_score
            )
            
        except Exception as e:
            logger.error(f"Error in RAG query pipeline: {e}")
            raise
    
    async def explain_code(
        self,
        code: str,
        language: str,
        file_path: Optional[str] = None,
        include_dependencies: bool = True,
        explanation_level: str = "detailed"
    ) -> RAGResult:
        """
        Explain code with contextual information.
        
        Args:
            code: Code snippet to explain
            language: Programming language
            file_path: File path for additional context
            include_dependencies: Include related code dependencies
            explanation_level: Level of explanation detail
            
        Returns:
            RAG result with explanation
        """
        start_time = time.time()
        
        try:
            # Generate embedding for the code
            code_embedding = await self.embedding_service.generate_query_embedding(
                f"Language: {language}\nCode:\n{code}"
            )
            
            # Find similar/related code chunks
            related_chunks = []
            if include_dependencies:
                search_results = await self.vector_store.search_similar(
                    query_embedding=code_embedding,
                    limit=5,
                    score_threshold=0.6,
                    filters={"language": [language]} if language else None
                )
                related_chunks = format_search_results(search_results)
            
            # Build context
            context = self._build_explanation_context(code, language, related_chunks, file_path)
            
            # Generate explanation
            prompt = self._build_explanation_prompt(code, language, explanation_level)
            
            response = await self.llm_service.generate_response(
                prompt=prompt,
                context=context,
                temperature=0.1,
                max_tokens=1500
            )
            
            processing_time = time.time() - start_time
            
            return RAGResult(
                response=response,
                retrieved_chunks=related_chunks,
                processing_time=processing_time,
                model_used="default",
                retrieval_score=np.mean([chunk["similarity_score"] for chunk in related_chunks]) if related_chunks else 0.0
            )
            
        except Exception as e:
            logger.error(f"Error in code explanation pipeline: {e}")
            raise
    
    async def generate_code(
        self,
        prompt: str,
        language: str,
        context: Optional[str] = None,
        style: str = "detailed",
        include_tests: bool = False,
        include_docs: bool = True
    ) -> RAGResult:
        """
        Generate code based on prompt with contextual examples.
        
        Args:
            prompt: Description of code to generate
            language: Target programming language
            context: Additional context or existing code
            style: Code generation style
            include_tests: Include unit tests
            include_docs: Include documentation
            
        Returns:
            RAG result with generated code
        """
        start_time = time.time()
        
        try:
            # Find similar code examples
            search_query = f"{prompt} {language} example"
            query_embedding = await self.embedding_service.generate_query_embedding(search_query)
            
            search_results = await self.vector_store.search_similar(
                query_embedding=query_embedding,
                limit=3,
                score_threshold=0.5,
                filters={"language": [language]}
            )
            
            example_chunks = format_search_results(search_results)
            
            # Build context with examples
            examples_context = self._build_generation_context(example_chunks, language)
            full_context = f"{context}\n\n{examples_context}" if context else examples_context
            
            # Generate code
            generation_prompt = self._build_generation_prompt(
                prompt, language, style, include_tests, include_docs
            )
            
            response = await self.llm_service.generate_response(
                prompt=generation_prompt,
                context=full_context,
                temperature=0.2,
                max_tokens=2048
            )
            
            processing_time = time.time() - start_time
            
            return RAGResult(
                response=response,
                retrieved_chunks=example_chunks,
                processing_time=processing_time,
                model_used="default",
                retrieval_score=np.mean([chunk["similarity_score"] for chunk in example_chunks]) if example_chunks else 0.0
            )
            
        except Exception as e:
            logger.error(f"Error in code generation pipeline: {e}")
            raise
    
    async def find_similar_code(
        self,
        code: str,
        language: Optional[str] = None,
        similarity_threshold: float = 0.8,
        max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find similar code patterns.
        
        Args:
            code: Code snippet to find similarities for
            language: Programming language filter
            similarity_threshold: Minimum similarity score
            max_results: Maximum number of results
            
        Returns:
            List of similar code chunks
        """
        try:
            # Generate embedding for the code
            code_embedding = await self.embedding_service.generate_query_embedding(
                f"Code:\n{code}"
            )
            
            # Search for similar chunks
            filters = {"language": [language]} if language else None
            
            search_results = await self.vector_store.search_similar(
                query_embedding=code_embedding,
                limit=max_results,
                score_threshold=similarity_threshold,
                filters=filters
            )
            
            return format_search_results(search_results)
            
        except Exception as e:
            logger.error(f"Error finding similar code: {e}")
            return []
    
    def _build_context(self, chunks: List[Dict[str, Any]], include_context: bool = True) -> str:
        """Build context string from retrieved chunks."""
        if not chunks:
            return ""
        
        context_parts = []
        
        for i, chunk in enumerate(chunks, 1):
            part = f"## Code Chunk {i} (Score: {chunk['similarity_score']:.3f})\n"
            part += f"**File:** {chunk['file_path']}\n"
            part += f"**Language:** {chunk['language']}\n"
            
            if chunk.get('function_name'):
                part += f"**Function:** {chunk['function_name']}\n"
            if chunk.get('class_name'):
                part += f"**Class:** {chunk['class_name']}\n"
            
            part += f"**Lines:** {chunk['line_start']}-{chunk['line_end']}\n\n"
            part += f"```{chunk['language']}\n{chunk['content']}\n```\n"
            
            if include_context and chunk.get('context'):
                part += f"\n**Context:**\n```{chunk['language']}\n{chunk['context']}\n```\n"
            
            context_parts.append(part)
        
        return "\n\n".join(context_parts)
    
    def _build_explanation_context(
        self, 
        code: str, 
        language: str, 
        related_chunks: List[Dict[str, Any]], 
        file_path: Optional[str]
    ) -> str:
        """Build context for code explanation."""
        context_parts = []
        
        if file_path:
            context_parts.append(f"**File Path:** {file_path}")
        
        if related_chunks:
            context_parts.append("**Related Code Examples:**")
            for chunk in related_chunks[:3]:  # Limit to top 3
                context_parts.append(
                    f"- {chunk['file_path']} ({chunk.get('function_name', 'unknown')})"
                )
        
        return "\n".join(context_parts)
    
    def _build_generation_context(self, example_chunks: List[Dict[str, Any]], language: str) -> str:
        """Build context for code generation with examples."""
        if not example_chunks:
            return f"Generate {language} code following best practices."
        
        context_parts = [f"Here are some {language} code examples for reference:"]
        
        for i, chunk in enumerate(example_chunks[:2], 1):  # Limit to 2 examples
            context_parts.append(f"\n**Example {i}:**")
            context_parts.append(f"```{language}\n{chunk['content']}\n```")
        
        return "\n".join(context_parts)
    
    def _build_query_prompt(self, query: str, num_chunks: int) -> str:
        """Build prompt for codebase queries."""
        return f"""Based on the provided code context, please answer the following question about the codebase:

**Question:** {query}

**Instructions:**
- Use the provided code chunks as your primary source of information
- Reference specific files, functions, or classes when relevant
- If the context doesn't contain enough information, clearly state what's missing
- Provide code examples from the context when helpful
- Be specific and accurate in your response

**Context:** {num_chunks} relevant code chunks are provided below."""
    
    def _build_explanation_prompt(self, code: str, language: str, level: str) -> str:
        """Build prompt for code explanation."""
        level_instructions = {
            "basic": "Provide a simple, high-level explanation suitable for beginners",
            "detailed": "Provide a comprehensive explanation with technical details",
            "expert": "Provide an in-depth analysis including performance, security, and architectural considerations"
        }
        
        instruction = level_instructions.get(level, level_instructions["detailed"])
        
        return f"""Please explain the following {language} code:

```{language}
{code}
```

**Instructions:**
- {instruction}
- Explain what the code does and how it works
- Identify key components, patterns, and techniques used
- Mention any potential issues or improvements
- Reference related code from the context if available"""
    
    def _build_generation_prompt(
        self, 
        prompt: str, 
        language: str, 
        style: str, 
        include_tests: bool, 
        include_docs: bool
    ) -> str:
        """Build prompt for code generation."""
        instructions = [
            f"Generate {language} code based on the following requirements:",
            f"**Requirements:** {prompt}",
            "",
            "**Guidelines:**"
        ]
        
        if style == "concise":
            instructions.append("- Write concise, minimal code")
        elif style == "detailed":
            instructions.append("- Write well-structured, readable code with comments")
        elif style == "production":
            instructions.append("- Write production-ready code with error handling and validation")
        
        instructions.extend([
            f"- Follow {language} best practices and conventions",
            "- Use appropriate data structures and algorithms",
            "- Include type hints/annotations where applicable"
        ])
        
        if include_docs:
            instructions.append("- Include comprehensive documentation/docstrings")
        
        if include_tests:
            instructions.append("- Include unit tests for the generated code")
        
        instructions.append("- Use examples from the context as reference when relevant")
        
        return "\n".join(instructions)
    
    async def health_check(self) -> Dict[str, bool]:
        """Check health of RAG service components."""
        health_status = {}
        
        try:
            # Check vector store
            health_status["vector_store"] = await self.vector_store.health_check() if self.vector_store else False
            
            # Check LLM service
            if self.llm_service:
                llm_health = await self.llm_service.health_check()
                health_status["llm_providers"] = llm_health
            else:
                health_status["llm_providers"] = {}
            
            # Check embedding service
            health_status["embedding_service"] = self.embedding_service is not None and self.embedding_service.model is not None
            
        except Exception as e:
            logger.error(f"Error in RAG health check: {e}")
            health_status["error"] = str(e)
        
        return health_status
    
    async def cleanup(self):
        """Cleanup RAG service resources."""
        try:
            if self.embedding_service:
                await self.embedding_service.cleanup()
            
            if self.vector_store:
                await self.vector_store.cleanup()
            
            if self.llm_service:
                await self.llm_service.cleanup()
            
            logger.info("✅ RAG service cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during RAG service cleanup: {e}")
