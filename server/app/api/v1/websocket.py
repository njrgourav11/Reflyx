"""
WebSocket API Endpoints
Provides real-time communication endpoints for streaming responses.
"""

import json
import uuid
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.websockets import WebSocketState

from app.core.logging import get_logger
from app.services.websocket_manager import get_websocket_manager, WebSocketManager


logger = get_logger(__name__)
router = APIRouter()


@router.websocket("/ws/chat")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    client_id: Optional[str] = Query(None),
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """
    WebSocket endpoint for real-time chat communication.
    
    Supports:
    - Streaming query responses
    - Real-time status updates
    - Bidirectional communication
    """
    # Generate client ID if not provided
    if not client_id:
        client_id = f"client_{uuid.uuid4().hex[:8]}"
    
    # Connect client
    connected = await websocket_manager.connect(websocket, client_id)
    if not connected:
        return
    
    try:
        while True:
            # Wait for message from client
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle the message
                await websocket_manager.handle_message(client_id, message)
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from client {client_id}: {e}")
                await websocket_manager.send_error(client_id, "Invalid JSON format")
                
            except Exception as e:
                logger.error(f"Error processing message from {client_id}: {e}")
                await websocket_manager.send_error(client_id, f"Error processing message: {str(e)}")
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
        
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        
    finally:
        # Ensure cleanup
        await websocket_manager.disconnect(client_id)


@router.websocket("/ws/status")
async def websocket_status_endpoint(
    websocket: WebSocket,
    client_id: Optional[str] = Query(None),
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """
    WebSocket endpoint for system status updates.
    
    Provides:
    - Indexing progress updates
    - System health status
    - Provider availability changes
    """
    if not client_id:
        client_id = f"status_{uuid.uuid4().hex[:8]}"
    
    connected = await websocket_manager.connect(websocket, client_id)
    if not connected:
        return
    
    try:
        # Send initial status
        await websocket_manager.send_message(client_id, {
            "type": "status_update",
            "status": "connected",
            "connections": websocket_manager.get_connection_count(),
            "streaming": websocket_manager.get_streaming_count()
        })
        
        # Keep connection alive and handle messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle status-specific messages
                if message.get("type") == "get_status":
                    await websocket_manager.send_message(client_id, {
                        "type": "status_response",
                        "connections": websocket_manager.get_connection_count(),
                        "streaming": websocket_manager.get_streaming_count(),
                        "timestamp": message.get("timestamp")
                    })
                    
            except json.JSONDecodeError:
                continue  # Ignore invalid JSON for status endpoint
                
    except WebSocketDisconnect:
        logger.info(f"Status client {client_id} disconnected")
        
    except Exception as e:
        logger.error(f"Status WebSocket error for client {client_id}: {e}")
        
    finally:
        await websocket_manager.disconnect(client_id)


@router.get("/ws/stats")
async def get_websocket_stats(
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get WebSocket connection statistics."""
    return {
        "success": True,
        "data": {
            "total_connections": websocket_manager.get_connection_count(),
            "streaming_connections": websocket_manager.get_streaming_count(),
            "active_tasks": len(websocket_manager.streaming_tasks)
        }
    }
