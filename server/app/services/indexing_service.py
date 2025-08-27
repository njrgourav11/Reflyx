"""
Indexing Service for AI Coding Assistant
Handles code indexing, file processing, and workspace management
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any
from pathlib import Path
from dataclasses import dataclass
from datetime import datetime

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class IndexedFile:
    """Represents an indexed file"""
    file_path: str
    content: str
    language: str
    chunks: List[str]
    metadata: Dict[str, Any]
    indexed_at: datetime
    file_size: int
    line_count: int


@dataclass
class IndexingResult:
    """Result of an indexing operation"""
    success: bool
    files_processed: int
    chunks_created: int
    processing_time: float
    errors: List[str]
    warnings: List[str]


class IndexingService:
    """Service for indexing code files and workspaces"""
    
    def __init__(self):
        self.indexed_files: Dict[str, IndexedFile] = {}
        self.processing_queue = asyncio.Queue()
        self.is_processing = False
        self.stats = {
            "total_files": 0,
            "total_chunks": 0,
            "last_update": None,
            "processing_time": 0.0
        }
    
    async def index_file(
        self, 
        file_path: str, 
        content: str, 
        language: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> IndexingResult:
        """Index a single file"""
        try:
            start_time = time.time()
            
            # Process the file content
            chunks = self._chunk_content(content, language)
            
            # Create indexed file record
            indexed_file = IndexedFile(
                file_path=file_path,
                content=content,
                language=language,
                chunks=chunks,
                metadata=metadata or {},
                indexed_at=datetime.utcnow(),
                file_size=len(content),
                line_count=len(content.splitlines())
            )
            
            # Store in memory (in production, this would go to a database)
            self.indexed_files[file_path] = indexed_file
            
            # Update stats
            self.stats["total_files"] = len(self.indexed_files)
            self.stats["total_chunks"] = sum(len(f.chunks) for f in self.indexed_files.values())
            self.stats["last_update"] = datetime.utcnow().isoformat()
            
            processing_time = time.time() - start_time
            self.stats["processing_time"] += processing_time
            
            logger.info(f"Indexed file {file_path} with {len(chunks)} chunks")
            
            return IndexingResult(
                success=True,
                files_processed=1,
                chunks_created=len(chunks),
                processing_time=processing_time,
                errors=[],
                warnings=[]
            )
            
        except Exception as e:
            logger.error(f"Failed to index file {file_path}: {e}")
            return IndexingResult(
                success=False,
                files_processed=0,
                chunks_created=0,
                processing_time=0.0,
                errors=[str(e)],
                warnings=[]
            )
    
    async def index_workspace(
        self,
        workspace_path: str,
        file_patterns: Optional[List[str]] = None,
        ignore_patterns: Optional[List[str]] = None,
        force_reindex: bool = False
    ) -> IndexingResult:
        """Index an entire workspace"""
        try:
            start_time = time.time()
            
            # Mock workspace indexing
            # In production, this would scan the filesystem
            mock_files = [
                ("src/main.py", "def main():\n    print('Hello World')", "python"),
                ("src/utils.js", "function helper() {\n    return true;\n}", "javascript"),
                ("README.md", "# Project\nThis is a sample project", "markdown"),
                ("config.json", '{"name": "project", "version": "1.0.0"}', "json"),
                ("styles.css", "body { margin: 0; padding: 0; }", "css")
            ]
            
            total_files = 0
            total_chunks = 0
            errors = []
            warnings = []
            
            for file_path, content, language in mock_files:
                try:
                    result = await self.index_file(
                        file_path=f"{workspace_path}/{file_path}",
                        content=content,
                        language=language,
                        metadata={"workspace": workspace_path}
                    )
                    
                    if result.success:
                        total_files += result.files_processed
                        total_chunks += result.chunks_created
                    else:
                        errors.extend(result.errors)
                        warnings.extend(result.warnings)
                        
                except Exception as e:
                    errors.append(f"Failed to index {file_path}: {str(e)}")
            
            processing_time = time.time() - start_time
            
            logger.info(f"Indexed workspace {workspace_path}: {total_files} files, {total_chunks} chunks")
            
            return IndexingResult(
                success=len(errors) == 0,
                files_processed=total_files,
                chunks_created=total_chunks,
                processing_time=processing_time,
                errors=errors,
                warnings=warnings
            )
            
        except Exception as e:
            logger.error(f"Failed to index workspace {workspace_path}: {e}")
            return IndexingResult(
                success=False,
                files_processed=0,
                chunks_created=0,
                processing_time=0.0,
                errors=[str(e)],
                warnings=[]
            )
    
    async def remove_file(self, file_path: str) -> bool:
        """Remove a file from the index"""
        try:
            if file_path in self.indexed_files:
                del self.indexed_files[file_path]
                
                # Update stats
                self.stats["total_files"] = len(self.indexed_files)
                self.stats["total_chunks"] = sum(len(f.chunks) for f in self.indexed_files.values())
                self.stats["last_update"] = datetime.utcnow().isoformat()
                
                logger.info(f"Removed file {file_path} from index")
                return True
            else:
                logger.warning(f"File {file_path} not found in index")
                return False
                
        except Exception as e:
            logger.error(f"Failed to remove file {file_path}: {e}")
            return False
    
    async def clear_workspace(self, workspace_path: str) -> int:
        """Clear all files for a workspace from the index"""
        try:
            removed_count = 0
            files_to_remove = []
            
            for file_path, indexed_file in self.indexed_files.items():
                if indexed_file.metadata.get("workspace") == workspace_path:
                    files_to_remove.append(file_path)
            
            for file_path in files_to_remove:
                if await self.remove_file(file_path):
                    removed_count += 1
            
            logger.info(f"Cleared {removed_count} files for workspace {workspace_path}")
            return removed_count
            
        except Exception as e:
            logger.error(f"Failed to clear workspace {workspace_path}: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get indexing statistics"""
        return {
            **self.stats,
            "indexed_files": len(self.indexed_files),
            "languages": list(set(f.language for f in self.indexed_files.values())),
            "average_file_size": (
                sum(f.file_size for f in self.indexed_files.values()) / len(self.indexed_files)
                if self.indexed_files else 0
            ),
            "average_chunks_per_file": (
                sum(len(f.chunks) for f in self.indexed_files.values()) / len(self.indexed_files)
                if self.indexed_files else 0
            )
        }
    
    def get_indexed_files(self, workspace_path: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of indexed files"""
        files = []
        
        for file_path, indexed_file in self.indexed_files.items():
            if workspace_path and indexed_file.metadata.get("workspace") != workspace_path:
                continue
                
            files.append({
                "file_path": file_path,
                "language": indexed_file.language,
                "chunks": len(indexed_file.chunks),
                "size_bytes": indexed_file.file_size,
                "line_count": indexed_file.line_count,
                "indexed_at": indexed_file.indexed_at.isoformat(),
                "metadata": indexed_file.metadata
            })
        
        return files
    
    def _chunk_content(self, content: str, language: str) -> List[str]:
        """Split content into chunks for indexing"""
        # Simple chunking strategy - split by lines with overlap
        lines = content.splitlines()
        chunks = []
        chunk_size = 50  # lines per chunk
        overlap = 5      # lines of overlap
        
        for i in range(0, len(lines), chunk_size - overlap):
            chunk_lines = lines[i:i + chunk_size]
            if chunk_lines:
                chunks.append('\n'.join(chunk_lines))
        
        # If no chunks created, use the entire content
        if not chunks and content.strip():
            chunks = [content]
        
        return chunks
    
    async def refresh_index(self, workspace_path: Optional[str] = None) -> IndexingResult:
        """Refresh the index by checking for changes"""
        try:
            # Mock refresh operation
            # In production, this would check file modification times
            # and reindex changed files
            
            start_time = time.time()
            refreshed_files = 0
            
            # Simulate checking a few files for changes
            for file_path in list(self.indexed_files.keys())[:3]:
                # Mock: assume file was modified
                indexed_file = self.indexed_files[file_path]
                
                # Re-chunk the content (simulate processing changes)
                new_chunks = self._chunk_content(indexed_file.content, indexed_file.language)
                indexed_file.chunks = new_chunks
                indexed_file.indexed_at = datetime.utcnow()
                
                refreshed_files += 1
            
            processing_time = time.time() - start_time
            
            logger.info(f"Refreshed {refreshed_files} files in index")
            
            return IndexingResult(
                success=True,
                files_processed=refreshed_files,
                chunks_created=sum(len(f.chunks) for f in self.indexed_files.values()),
                processing_time=processing_time,
                errors=[],
                warnings=[]
            )
            
        except Exception as e:
            logger.error(f"Failed to refresh index: {e}")
            return IndexingResult(
                success=False,
                files_processed=0,
                chunks_created=0,
                processing_time=0.0,
                errors=[str(e)],
                warnings=[]
            )
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            self.indexed_files.clear()
            self.stats = {
                "total_files": 0,
                "total_chunks": 0,
                "last_update": None,
                "processing_time": 0.0
            }
            logger.info("Indexing service cleaned up")
            
        except Exception as e:
            logger.error(f"Error during indexing service cleanup: {e}")


# Global indexing service instance
indexing_service = IndexingService()
