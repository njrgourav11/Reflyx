"""
Qdrant Vector Database Client
Handles vector storage, indexing, and semantic search operations.
"""

import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import uuid

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import (
    Distance, VectorParams, CreateCollection, PointStruct,
    Filter, FieldCondition, Match, SearchRequest, UpdateResult
)

from indexer.parsers.tree_sitter_parser import CodeChunk


logger = logging.getLogger(__name__)


class QdrantVectorStore:
    """Qdrant vector database client for code chunk storage and retrieval."""
    
    def __init__(
        self,
        url: str = "http://localhost:6333",
        api_key: Optional[str] = None,
        collection_name: str = "code_chunks",
        embedding_dim: int = 384
    ):
        """
        Initialize Qdrant client.
        
        Args:
            url: Qdrant server URL
            api_key: API key for authentication (optional)
            collection_name: Name of the collection to use
            embedding_dim: Dimension of embeddings
        """
        self.url = url
        self.api_key = api_key
        self.collection_name = collection_name
        self.embedding_dim = embedding_dim
        
        self.client: Optional[QdrantClient] = None
        self._collection_exists = False
        
        logger.info(f"Initializing QdrantVectorStore: {url}, collection: {collection_name}")
    
    async def initialize(self):
        """Initialize connection to Qdrant and create collection if needed."""
        try:
            logger.info("Connecting to Qdrant...")
            
            # Initialize client
            self.client = QdrantClient(
                url=self.url,
                api_key=self.api_key,
                timeout=30
            )
            
            # Test connection
            collections = self.client.get_collections()
            logger.info(f"✅ Connected to Qdrant, found {len(collections.collections)} collections")
            
            # Create collection if it doesn't exist
            await self._ensure_collection_exists()
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Qdrant client: {e}")
            raise
    
    async def _ensure_collection_exists(self):
        """Ensure the collection exists, create if not."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name in collection_names:
                logger.info(f"Collection '{self.collection_name}' already exists")
                self._collection_exists = True
                
                # Verify collection configuration
                collection_info = self.client.get_collection(self.collection_name)
                if collection_info.config.params.vectors.size != self.embedding_dim:
                    logger.warning(
                        f"Collection dimension mismatch: expected {self.embedding_dim}, "
                        f"got {collection_info.config.params.vectors.size}"
                    )
            else:
                # Create collection
                logger.info(f"Creating collection '{self.collection_name}' with dimension {self.embedding_dim}")
                
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dim,
                        distance=Distance.COSINE
                    )
                )
                
                # Create payload indexes for efficient filtering
                await self._create_payload_indexes()
                
                self._collection_exists = True
                logger.info(f"✅ Collection '{self.collection_name}' created successfully")
                
        except Exception as e:
            logger.error(f"Error ensuring collection exists: {e}")
            raise
    
    async def _create_payload_indexes(self):
        """Create indexes on payload fields for efficient filtering."""
        try:
            indexes = [
                ("language", models.PayloadSchemaType.KEYWORD),
                ("file_path", models.PayloadSchemaType.KEYWORD),
                ("function_name", models.PayloadSchemaType.KEYWORD),
                ("class_name", models.PayloadSchemaType.KEYWORD),
                ("chunk_type", models.PayloadSchemaType.KEYWORD),
                ("last_modified", models.PayloadSchemaType.DATETIME),
                ("complexity_score", models.PayloadSchemaType.FLOAT)
            ]
            
            for field_name, field_type in indexes:
                try:
                    self.client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name=field_name,
                        field_schema=field_type
                    )
                    logger.debug(f"Created index for field: {field_name}")
                except Exception as e:
                    # Index might already exist
                    logger.debug(f"Index creation for {field_name} failed (might exist): {e}")
                    
        except Exception as e:
            logger.warning(f"Error creating payload indexes: {e}")
    
    async def store_chunks(self, chunks_with_embeddings: List[Tuple[CodeChunk, np.ndarray]]) -> bool:
        """
        Store code chunks with their embeddings in Qdrant.
        
        Args:
            chunks_with_embeddings: List of (CodeChunk, embedding) tuples
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client or not self._collection_exists:
            raise RuntimeError("Client not initialized or collection doesn't exist")
        
        if not chunks_with_embeddings:
            return True
        
        logger.info(f"Storing {len(chunks_with_embeddings)} chunks in Qdrant")
        start_time = time.time()
        
        try:
            # Prepare points for insertion
            points = []
            
            for chunk, embedding in chunks_with_embeddings:
                # Create payload with metadata
                payload = {
                    "chunk_id": chunk.id,
                    "content": chunk.content,
                    "language": chunk.language,
                    "file_path": chunk.file_path,
                    "line_start": chunk.line_start,
                    "line_end": chunk.line_end,
                    "chunk_type": chunk.chunk_type.value,
                    "complexity_score": chunk.complexity_score,
                    "last_modified": datetime.utcnow().isoformat(),
                    "function_name": chunk.function_name,
                    "class_name": chunk.class_name,
                    "module_name": chunk.module_name,
                    "docstring": chunk.docstring,
                    "context": chunk.context,
                    "dependencies": chunk.dependencies
                }
                
                # Create point
                point = PointStruct(
                    id=str(uuid.uuid4()),  # Generate unique ID
                    vector=embedding.tolist(),
                    payload=payload
                )
                points.append(point)
            
            # Insert points in batches
            batch_size = 100
            for i in range(0, len(points), batch_size):
                batch = points[i:i + batch_size]
                
                result = self.client.upsert(
                    collection_name=self.collection_name,
                    points=batch
                )
                
                if result.status != models.UpdateStatus.COMPLETED:
                    logger.error(f"Failed to insert batch {i//batch_size + 1}")
                    return False
            
            storage_time = time.time() - start_time
            logger.info(f"✅ Stored {len(chunks_with_embeddings)} chunks in {storage_time:.2f}s")
            return True
            
        except Exception as e:
            logger.error(f"Error storing chunks: {e}")
            return False
    
    async def search_similar(
        self,
        query_embedding: np.ndarray,
        limit: int = 10,
        score_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar code chunks.
        
        Args:
            query_embedding: Query embedding vector
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            filters: Optional filters for search
            
        Returns:
            List of search results with metadata
        """
        if not self.client or not self._collection_exists:
            raise RuntimeError("Client not initialized or collection doesn't exist")
        
        logger.debug(f"Searching for similar chunks, limit: {limit}, threshold: {score_threshold}")
        start_time = time.time()
        
        try:
            # Build filter conditions
            filter_conditions = None
            if filters:
                conditions = []
                
                for field, value in filters.items():
                    if isinstance(value, list):
                        # Multiple values (OR condition)
                        for v in value:
                            conditions.append(
                                FieldCondition(key=field, match=Match(value=v))
                            )
                    else:
                        # Single value
                        conditions.append(
                            FieldCondition(key=field, match=Match(value=value))
                        )
                
                if conditions:
                    filter_conditions = Filter(should=conditions)
            
            # Perform search
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding.tolist(),
                query_filter=filter_conditions,
                limit=limit,
                score_threshold=score_threshold,
                with_payload=True,
                with_vectors=False
            )
            
            # Process results
            results = []
            for scored_point in search_result:
                result = {
                    "id": scored_point.id,
                    "score": scored_point.score,
                    "payload": scored_point.payload
                }
                results.append(result)
            
            search_time = time.time() - start_time
            logger.debug(f"Found {len(results)} similar chunks in {search_time:.3f}s")
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching similar chunks: {e}")
            return []
    
    async def delete_by_file_path(self, file_path: str) -> bool:
        """
        Delete all chunks from a specific file.
        
        Args:
            file_path: Path of the file to delete chunks for
            
        Returns:
            True if successful, False otherwise
        """
        if not self.client or not self._collection_exists:
            raise RuntimeError("Client not initialized or collection doesn't exist")
        
        try:
            logger.info(f"Deleting chunks for file: {file_path}")
            
            # Delete points with matching file_path
            result = self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=Filter(
                        must=[
                            FieldCondition(
                                key="file_path",
                                match=Match(value=file_path)
                            )
                        ]
                    )
                )
            )
            
            if result.status == models.UpdateStatus.COMPLETED:
                logger.info(f"✅ Deleted chunks for file: {file_path}")
                return True
            else:
                logger.error(f"Failed to delete chunks for file: {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting chunks for file {file_path}: {e}")
            return False
    
    async def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection."""
        if not self.client or not self._collection_exists:
            raise RuntimeError("Client not initialized or collection doesn't exist")
        
        try:
            collection_info = self.client.get_collection(self.collection_name)
            
            return {
                "name": self.collection_name,
                "vectors_count": collection_info.vectors_count,
                "indexed_vectors_count": collection_info.indexed_vectors_count,
                "points_count": collection_info.points_count,
                "segments_count": collection_info.segments_count,
                "config": {
                    "vector_size": collection_info.config.params.vectors.size,
                    "distance": collection_info.config.params.vectors.distance.value
                },
                "status": collection_info.status.value
            }
            
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return {}
    
    async def health_check(self) -> bool:
        """Check if Qdrant is healthy and accessible."""
        try:
            if not self.client:
                return False
                
            # Try to get collections (simple health check)
            collections = self.client.get_collections()
            return True
            
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return False
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            if self.client:
                # Close client connection
                self.client.close()
                self.client = None
                
            logger.info("✅ QdrantVectorStore cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


# Utility functions for search result processing
def format_search_results(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format search results for API response."""
    formatted_results = []
    
    for result in results:
        payload = result["payload"]
        
        formatted_result = {
            "id": payload.get("chunk_id"),
            "file_path": payload.get("file_path"),
            "function_name": payload.get("function_name"),
            "class_name": payload.get("class_name"),
            "language": payload.get("language"),
            "content": payload.get("content"),
            "line_start": payload.get("line_start"),
            "line_end": payload.get("line_end"),
            "similarity_score": result["score"],
            "context": payload.get("context"),
            "chunk_type": payload.get("chunk_type"),
            "complexity_score": payload.get("complexity_score"),
            "last_modified": payload.get("last_modified")
        }
        
        formatted_results.append(formatted_result)
    
    return formatted_results
