"""
Sentence Transformer Embedding Service
Generates embeddings for code chunks using pre-trained sentence transformer models.
"""

import os
import time
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import pickle
import logging

import numpy as np
from sentence_transformers import SentenceTransformer
import torch

from indexer.parsers.tree_sitter_parser import CodeChunk


logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating and managing code embeddings."""
    
    def __init__(
        self, 
        model_name: str = "all-MiniLM-L6-v2",
        cache_dir: Optional[str] = None,
        device: Optional[str] = None
    ):
        """
        Initialize the embedding service.
        
        Args:
            model_name: Name of the sentence transformer model
            cache_dir: Directory for caching embeddings
            device: Device to run the model on (cpu, cuda, mps)
        """
        self.model_name = model_name
        self.cache_dir = Path(cache_dir) if cache_dir else Path("./cache/embeddings")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine device
        if device is None:
            if torch.cuda.is_available():
                self.device = "cuda"
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                self.device = "mps"
            else:
                self.device = "cpu"
        else:
            self.device = device
        
        self.model: Optional[SentenceTransformer] = None
        self.embedding_dim: Optional[int] = None
        self._embedding_cache: Dict[str, np.ndarray] = {}
        
        logger.info(f"Initializing EmbeddingService with model: {model_name}, device: {self.device}")
    
    async def initialize(self):
        """Initialize the sentence transformer model."""
        try:
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            start_time = time.time()
            
            # Load model
            self.model = SentenceTransformer(self.model_name, device=self.device)
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            
            # Load embedding cache
            await self._load_cache()
            
            load_time = time.time() - start_time
            logger.info(f"✅ Model loaded successfully in {load_time:.2f}s, embedding dimension: {self.embedding_dim}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize embedding model: {e}")
            raise
    
    async def generate_embeddings(self, chunks: List[CodeChunk]) -> List[Tuple[str, np.ndarray]]:
        """
        Generate embeddings for a list of code chunks.
        
        Args:
            chunks: List of CodeChunk objects
            
        Returns:
            List of tuples (chunk_id, embedding)
        """
        if not self.model:
            raise RuntimeError("Model not initialized. Call initialize() first.")
        
        if not chunks:
            return []
        
        logger.info(f"Generating embeddings for {len(chunks)} code chunks")
        start_time = time.time()
        
        # Prepare texts and check cache
        texts_to_embed = []
        chunk_ids = []
        cached_embeddings = []
        
        for chunk in chunks:
            # Create embedding text from chunk
            embedding_text = self._create_embedding_text(chunk)
            text_hash = self._get_text_hash(embedding_text)
            
            # Check cache first
            if text_hash in self._embedding_cache:
                cached_embeddings.append((chunk.id, self._embedding_cache[text_hash]))
            else:
                texts_to_embed.append(embedding_text)
                chunk_ids.append((chunk.id, text_hash))
        
        logger.info(f"Found {len(cached_embeddings)} cached embeddings, generating {len(texts_to_embed)} new ones")
        
        # Generate new embeddings
        new_embeddings = []
        if texts_to_embed:
            try:
                # Generate embeddings in batches for memory efficiency
                batch_size = 32
                all_embeddings = []
                
                for i in range(0, len(texts_to_embed), batch_size):
                    batch_texts = texts_to_embed[i:i + batch_size]
                    batch_embeddings = self.model.encode(
                        batch_texts,
                        convert_to_numpy=True,
                        show_progress_bar=False,
                        batch_size=min(batch_size, len(batch_texts))
                    )
                    all_embeddings.extend(batch_embeddings)
                
                # Cache and prepare results
                for (chunk_id, text_hash), embedding in zip(chunk_ids, all_embeddings):
                    # Cache the embedding
                    self._embedding_cache[text_hash] = embedding
                    new_embeddings.append((chunk_id, embedding))
                
            except Exception as e:
                logger.error(f"Error generating embeddings: {e}")
                raise
        
        # Combine cached and new embeddings
        all_embeddings = cached_embeddings + new_embeddings
        
        # Save cache periodically
        if len(new_embeddings) > 0:
            await self._save_cache()
        
        generation_time = time.time() - start_time
        logger.info(f"✅ Generated {len(all_embeddings)} embeddings in {generation_time:.2f}s")
        
        return all_embeddings
    
    async def generate_query_embedding(self, query: str) -> np.ndarray:
        """
        Generate embedding for a search query.
        
        Args:
            query: Search query text
            
        Returns:
            Query embedding as numpy array
        """
        if not self.model:
            raise RuntimeError("Model not initialized. Call initialize() first.")
        
        try:
            # Check cache first
            query_hash = self._get_text_hash(query)
            if query_hash in self._embedding_cache:
                return self._embedding_cache[query_hash]
            
            # Generate embedding
            embedding = self.model.encode([query], convert_to_numpy=True)[0]
            
            # Cache the result
            self._embedding_cache[query_hash] = embedding
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating query embedding: {e}")
            raise
    
    def _create_embedding_text(self, chunk: CodeChunk) -> str:
        """
        Create text representation for embedding generation.
        
        Args:
            chunk: CodeChunk object
            
        Returns:
            Text representation optimized for embedding
        """
        parts = []
        
        # Add language context
        parts.append(f"Language: {chunk.language}")
        
        # Add structural context
        if chunk.function_name:
            parts.append(f"Function: {chunk.function_name}")
        if chunk.class_name:
            parts.append(f"Class: {chunk.class_name}")
        if chunk.module_name:
            parts.append(f"Module: {chunk.module_name}")
        
        # Add chunk type context
        parts.append(f"Type: {chunk.chunk_type.value}")
        
        # Add the actual code content
        parts.append("Code:")
        parts.append(chunk.content)
        
        # Add docstring if available
        if chunk.docstring:
            parts.append("Documentation:")
            parts.append(chunk.docstring)
        
        # Add context if available
        if chunk.context:
            parts.append("Context:")
            parts.append(chunk.context)
        
        return "\n".join(parts)
    
    def _get_text_hash(self, text: str) -> str:
        """Generate hash for text caching."""
        return hashlib.md5(text.encode('utf-8')).hexdigest()
    
    async def _load_cache(self):
        """Load embedding cache from disk."""
        cache_file = self.cache_dir / f"embeddings_{self.model_name.replace('/', '_')}.pkl"
        
        try:
            if cache_file.exists():
                with open(cache_file, 'rb') as f:
                    self._embedding_cache = pickle.load(f)
                logger.info(f"Loaded {len(self._embedding_cache)} cached embeddings")
            else:
                self._embedding_cache = {}
                logger.info("No embedding cache found, starting fresh")
                
        except Exception as e:
            logger.warning(f"Failed to load embedding cache: {e}")
            self._embedding_cache = {}
    
    async def _save_cache(self):
        """Save embedding cache to disk."""
        cache_file = self.cache_dir / f"embeddings_{self.model_name.replace('/', '_')}.pkl"
        
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump(self._embedding_cache, f)
            logger.debug(f"Saved {len(self._embedding_cache)} embeddings to cache")
            
        except Exception as e:
            logger.warning(f"Failed to save embedding cache: {e}")
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this model."""
        if self.embedding_dim is None:
            raise RuntimeError("Model not initialized")
        return self.embedding_dim
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "embedding_dimension": self.embedding_dim,
            "cache_size": len(self._embedding_cache),
            "cache_dir": str(self.cache_dir)
        }
    
    async def cleanup(self):
        """Cleanup resources and save cache."""
        try:
            await self._save_cache()
            if self.model:
                # Clear model from memory
                del self.model
                self.model = None
                
            # Clear cache from memory
            self._embedding_cache.clear()
            
            # Clear GPU memory if using CUDA
            if self.device == "cuda" and torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            logger.info("✅ EmbeddingService cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


# Utility functions for embedding similarity
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def batch_cosine_similarity(query_embedding: np.ndarray, embeddings: np.ndarray) -> np.ndarray:
    """Calculate cosine similarity between query and batch of embeddings."""
    # Normalize embeddings
    query_norm = query_embedding / np.linalg.norm(query_embedding)
    embeddings_norm = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    
    # Calculate similarities
    similarities = np.dot(embeddings_norm, query_norm)
    return similarities


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate Euclidean distance between two embeddings."""
    return np.linalg.norm(a - b)


def manhattan_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate Manhattan distance between two embeddings."""
    return np.sum(np.abs(a - b))
