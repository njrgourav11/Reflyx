"""
WebSocket Manager for Real-time Communication
Handles streaming responses and real-time updates between frontend and backend.
"""

import asyncio
import json
import logging
import time
from typing import Dict, Set, Optional, Any, Callable
from dataclasses import dataclass
from enum import Enum

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState

from app.core.logging import get_logger


logger = get_logger(__name__)


class MessageType(Enum):
    """WebSocket message types."""
    STREAM_QUERY = "stream_query"
    STREAM_CHUNK = "stream_chunk"
    STREAM_COMPLETE = "stream_complete"
    STREAM_ERROR = "stream_error"
    STOP_GENERATION = "stop_generation"
    PING = "ping"
    PONG = "pong"
    STATUS_UPDATE = "status_update"
    ERROR = "error"


@dataclass
class WebSocketConnection:
    """Represents a WebSocket connection."""
    websocket: WebSocket
    client_id: str
    connected_at: float
    last_activity: float
    is_streaming: bool = False
    current_task_id: Optional[str] = None


class WebSocketManager:
    """Manages WebSocket connections and message routing."""
    
    def __init__(self):
        self.connections: Dict[str, WebSocketConnection] = {}
        self.message_handlers: Dict[MessageType, Callable] = {}
        self.streaming_tasks: Dict[str, asyncio.Task] = {}
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup message handlers for different message types."""
        self.message_handlers = {
            MessageType.STREAM_QUERY: self._handle_stream_query,
            MessageType.STOP_GENERATION: self._handle_stop_generation,
            MessageType.PING: self._handle_ping,
        }
    
    async def connect(self, websocket: WebSocket, client_id: str) -> bool:
        """Accept a new WebSocket connection."""
        try:
            await websocket.accept()
            
            connection = WebSocketConnection(
                websocket=websocket,
                client_id=client_id,
                connected_at=time.time(),
                last_activity=time.time()
            )
            
            self.connections[client_id] = connection
            
            logger.info(f"✅ WebSocket connected: {client_id}")
            
            # Send welcome message
            await self.send_message(client_id, {
                "type": MessageType.STATUS_UPDATE.value,
                "status": "connected",
                "message": "WebSocket connection established"
            })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect WebSocket {client_id}: {e}")
            return False
    
    async def disconnect(self, client_id: str):
        """Disconnect a WebSocket connection."""
        connection = self.connections.get(client_id)
        if not connection:
            return
        
        try:
            # Cancel any ongoing streaming tasks
            if connection.current_task_id:
                await self._cancel_streaming_task(connection.current_task_id)
            
            # Close WebSocket if still open
            if connection.websocket.client_state == WebSocketState.CONNECTED:
                await connection.websocket.close()
            
            # Remove from connections
            del self.connections[client_id]
            
            logger.info(f"🔌 WebSocket disconnected: {client_id}")
            
        except Exception as e:
            logger.error(f"Error disconnecting WebSocket {client_id}: {e}")
    
    async def handle_message(self, client_id: str, message: dict):
        """Handle incoming WebSocket message."""
        connection = self.connections.get(client_id)
        if not connection:
            logger.warning(f"Message from unknown client: {client_id}")
            return
        
        try:
            # Update last activity
            connection.last_activity = time.time()
            
            # Get message type
            message_type_str = message.get("type")
            if not message_type_str:
                await self.send_error(client_id, "Missing message type")
                return
            
            try:
                message_type = MessageType(message_type_str)
            except ValueError:
                await self.send_error(client_id, f"Unknown message type: {message_type_str}")
                return
            
            # Get handler
            handler = self.message_handlers.get(message_type)
            if not handler:
                await self.send_error(client_id, f"No handler for message type: {message_type_str}")
                return
            
            # Execute handler
            await handler(client_id, message)
            
        except Exception as e:
            logger.error(f"Error handling message from {client_id}: {e}")
            await self.send_error(client_id, f"Error processing message: {str(e)}")
    
    async def send_message(self, client_id: str, message: dict) -> bool:
        """Send message to a specific client."""
        connection = self.connections.get(client_id)
        if not connection:
            logger.warning(f"Attempted to send message to unknown client: {client_id}")
            return False
        
        try:
            if connection.websocket.client_state == WebSocketState.CONNECTED:
                await connection.websocket.send_text(json.dumps(message))
                return True
            else:
                logger.warning(f"WebSocket not connected for client: {client_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending message to {client_id}: {e}")
            # Remove disconnected client
            await self.disconnect(client_id)
            return False
    
    async def broadcast_message(self, message: dict, exclude_client: Optional[str] = None):
        """Broadcast message to all connected clients."""
        disconnected_clients = []
        
        for client_id, connection in self.connections.items():
            if exclude_client and client_id == exclude_client:
                continue
                
            success = await self.send_message(client_id, message)
            if not success:
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            await self.disconnect(client_id)
    
    async def send_error(self, client_id: str, error_message: str):
        """Send error message to client."""
        await self.send_message(client_id, {
            "type": MessageType.ERROR.value,
            "error": error_message,
            "timestamp": time.time()
        })
    
    async def start_streaming_response(
        self, 
        client_id: str, 
        task_id: str, 
        stream_generator,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Start streaming response to client."""
        connection = self.connections.get(client_id)
        if not connection:
            return
        
        # Cancel any existing streaming task
        if connection.current_task_id:
            await self._cancel_streaming_task(connection.current_task_id)
        
        # Create streaming task
        task = asyncio.create_task(
            self._stream_response(client_id, task_id, stream_generator, metadata)
        )
        
        self.streaming_tasks[task_id] = task
        connection.current_task_id = task_id
        connection.is_streaming = True
        
        logger.info(f"🚀 Started streaming task {task_id} for client {client_id}")
    
    async def _stream_response(
        self, 
        client_id: str, 
        task_id: str, 
        stream_generator, 
        metadata: Optional[Dict[str, Any]]
    ):
        """Stream response chunks to client."""
        try:
            async for chunk in stream_generator:
                # Check if task was cancelled
                if task_id not in self.streaming_tasks:
                    break
                
                # Send chunk to client
                success = await self.send_message(client_id, {
                    "type": MessageType.STREAM_CHUNK.value,
                    "task_id": task_id,
                    "chunk": chunk,
                    "timestamp": time.time()
                })
                
                if not success:
                    break
            
            # Send completion message
            await self.send_message(client_id, {
                "type": MessageType.STREAM_COMPLETE.value,
                "task_id": task_id,
                "metadata": metadata or {},
                "timestamp": time.time()
            })
            
        except asyncio.CancelledError:
            logger.info(f"Streaming task {task_id} was cancelled")
            await self.send_message(client_id, {
                "type": MessageType.STREAM_ERROR.value,
                "task_id": task_id,
                "error": "Generation was stopped",
                "timestamp": time.time()
            })
            
        except Exception as e:
            logger.error(f"Error in streaming task {task_id}: {e}")
            await self.send_message(client_id, {
                "type": MessageType.STREAM_ERROR.value,
                "task_id": task_id,
                "error": str(e),
                "timestamp": time.time()
            })
            
        finally:
            # Cleanup
            await self._cleanup_streaming_task(client_id, task_id)
    
    async def _cancel_streaming_task(self, task_id: str):
        """Cancel a streaming task."""
        task = self.streaming_tasks.get(task_id)
        if task and not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
        
        if task_id in self.streaming_tasks:
            del self.streaming_tasks[task_id]
    
    async def _cleanup_streaming_task(self, client_id: str, task_id: str):
        """Cleanup after streaming task completion."""
        connection = self.connections.get(client_id)
        if connection:
            connection.is_streaming = False
            connection.current_task_id = None
        
        if task_id in self.streaming_tasks:
            del self.streaming_tasks[task_id]
        
        logger.info(f"🧹 Cleaned up streaming task {task_id} for client {client_id}")
    
    # Message Handlers
    async def _handle_stream_query(self, client_id: str, message: dict):
        """Handle streaming query request."""
        try:
            from app.services.rag_service import RAGService
            
            # Extract query data
            query_data = message.get("data", {})
            task_id = message.get("task_id") or f"task_{int(time.time())}"
            
            # Get RAG service (this would be injected in practice)
            rag_service = RAGService()
            
            # Create streaming generator
            async def stream_generator():
                # This is a simplified example - in practice, you'd integrate with your RAG service
                response = await rag_service.query_codebase(
                    query=query_data.get("query", ""),
                    max_results=query_data.get("max_results", 10),
                    similarity_threshold=query_data.get("similarity_threshold", 0.7)
                )
                
                # Simulate streaming by yielding chunks
                full_response = response.response
                chunk_size = 50
                
                for i in range(0, len(full_response), chunk_size):
                    chunk = full_response[i:i + chunk_size]
                    yield chunk
                    await asyncio.sleep(0.1)  # Simulate processing time
            
            # Start streaming
            await self.start_streaming_response(
                client_id=client_id,
                task_id=task_id,
                stream_generator=stream_generator(),
                metadata={
                    "query": query_data.get("query", ""),
                    "provider": "default",
                    "model": "default"
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling stream query: {e}")
            await self.send_error(client_id, f"Error processing query: {str(e)}")
    
    async def _handle_stop_generation(self, client_id: str, message: dict):
        """Handle stop generation request."""
        connection = self.connections.get(client_id)
        if connection and connection.current_task_id:
            await self._cancel_streaming_task(connection.current_task_id)
            
            await self.send_message(client_id, {
                "type": MessageType.STATUS_UPDATE.value,
                "status": "stopped",
                "message": "Generation stopped by user"
            })
    
    async def _handle_ping(self, client_id: str, message: dict):
        """Handle ping message."""
        await self.send_message(client_id, {
            "type": MessageType.PONG.value,
            "timestamp": time.time()
        })
    
    # Utility Methods
    def get_connection_count(self) -> int:
        """Get number of active connections."""
        return len(self.connections)
    
    def get_streaming_count(self) -> int:
        """Get number of active streaming connections."""
        return sum(1 for conn in self.connections.values() if conn.is_streaming)
    
    async def cleanup_inactive_connections(self, timeout_seconds: int = 300):
        """Cleanup inactive connections."""
        current_time = time.time()
        inactive_clients = []
        
        for client_id, connection in self.connections.items():
            if current_time - connection.last_activity > timeout_seconds:
                inactive_clients.append(client_id)
        
        for client_id in inactive_clients:
            logger.info(f"Cleaning up inactive connection: {client_id}")
            await self.disconnect(client_id)
    
    async def shutdown(self):
        """Shutdown WebSocket manager and cleanup all connections."""
        logger.info("🔄 Shutting down WebSocket manager...")
        
        # Cancel all streaming tasks
        for task_id in list(self.streaming_tasks.keys()):
            await self._cancel_streaming_task(task_id)
        
        # Disconnect all clients
        for client_id in list(self.connections.keys()):
            await self.disconnect(client_id)
        
        logger.info("✅ WebSocket manager shutdown complete")


# Global WebSocket manager instance
websocket_manager = WebSocketManager()


async def get_websocket_manager() -> WebSocketManager:
    """Get the global WebSocket manager instance."""
    return websocket_manager
