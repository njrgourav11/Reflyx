/**
 * API Client for communicating with the AI Coding Assistant backend.
 */

import * as vscode from 'vscode';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import WebSocket from 'ws';
import { Logger } from '../utils/Logger';

export interface QueryRequest {
    query: string;
    workspace_path?: string;
    max_results?: number;
    similarity_threshold?: number;
    include_context?: boolean;
    language_filter?: string[];
}

export interface ExplainRequest {
    code: string;
    language?: string;
    file_path?: string;
    include_dependencies?: boolean;
    explanation_level?: 'basic' | 'detailed' | 'expert';
}

export interface GenerateRequest {
    prompt: string;
    language: string;
    context?: string;
    style?: 'concise' | 'detailed' | 'production';
    include_tests?: boolean;
    include_docs?: boolean;
    max_length?: number;
}

export interface SimilarCodeRequest {
    code: string;
    language?: string;
    workspace_path?: string;
    similarity_threshold?: number;
    max_results?: number;
    include_exact_matches?: boolean;
}

export interface IndexRequest {
    workspace_path: string;
    force_reindex?: boolean;
    include_patterns?: string[];
    exclude_patterns?: string[];
    max_files?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    timestamp: string;
    data?: T;
}

export class ApiClient {
    private client: AxiosInstance;
    private logger: Logger;
    private websocket?: WebSocket;
    private websocketCallbacks: Map<string, (data: any) => void> = new Map();

    constructor(private baseUrl: string) {
        this.logger = new Logger('ApiClient');

        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                this.logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                this.logger.debug(`API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                this.logger.error('API Response Error:', error.response?.status, error.response?.data);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Update the base URL at runtime (e.g., when the user changes backend URL)
     */
    setBaseUrl(newBaseUrl: string): void {
        this.baseUrl = newBaseUrl;
        this.client.defaults.baseURL = newBaseUrl;
        this.logger.info(`API base URL updated to ${newBaseUrl}`);
    }


    /**
     * Check if the backend server is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/api/v1/health');
            return response.status === 200 && response.data.success;
        } catch (error) {
            this.logger.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Get detailed health information
     */
    async getDetailedHealth(): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/health/detailed', {
                include_services: true,
                include_models: true,
                timeout: 10
            });
            return response.data;
        } catch (error) {
            this.logger.error('Detailed health check failed:', error);
            throw error;
        }
    }

    /**
     * Index a workspace
     */
    async indexWorkspace(request: IndexRequest): Promise<any> {
        try {
            // Preferred modern endpoint
            const response = await this.client.post('/api/v1/index/workspace', request);
            return response.data;
        } catch (error: any) {
            // Fallback for legacy servers that expect POST /api/v1/index
            if (error?.response?.status === 404) {
                this.logger.warn('Index workspace endpoint not found, falling back to /api/v1/index');
                const fallback = await this.client.post('/api/v1/index', request);
                return fallback.data;
            }
            this.logger.error('Workspace indexing failed:', error);
            throw error;
        }
    }

    /**
     * Query the codebase
     */
    async queryCodebase(request: QueryRequest): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/query', request);
            return response.data;
        } catch (error) {
            this.logger.error('Codebase query failed:', error);
            throw error;
        }
    }

    /**
     * Explain code
     */
    async explainCode(request: ExplainRequest): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/explain', request);
            return response.data;
        } catch (error) {
            this.logger.error('Code explanation failed:', error);
            throw error;
        }
    }

    /**
     * Generate code
     */
    async generateCode(request: GenerateRequest): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/generate', request);
            return response.data;
        } catch (error) {
            this.logger.error('Code generation failed:', error);
            throw error;
        }
    }

    /**
     * Find similar code
     */
    async findSimilarCode(request: SimilarCodeRequest): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/similar', request);
            return response.data;
        } catch (error) {
            this.logger.error('Similar code search failed:', error);
            throw error;
        }
    }

    /**
     * Alias for queryCodebase - used by ChatProvider
     */
    async query(request: { query: string; max_results: number }): Promise<{ response: string; results: any[] }> {
        return this.queryCodebase(request as QueryRequest);
    }

    /**
     * Stream query updates via SSE
     */
    async streamQuery(onEvent: (evt: { type: string; data: any }) => void): Promise<void> {
        try {
            const url = this.client.defaults.baseURL?.replace(/\/$/, '') + '/api/v1/query/stream';
            const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'text/event-stream' } });
            const reader = (res.body as any).getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let idx;
                while ((idx = buffer.indexOf('\n\n')) >= 0) {
                    const raw = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    const lines = raw.split('\n');
                    const eventLine = lines.find(l => l.startsWith('event:')) || '';
                    const dataLine = lines.find(l => l.startsWith('data:')) || '';
                    const type = eventLine.replace('event:', '').trim() || 'message';
                    const data = dataLine ? JSON.parse(dataLine.replace('data:', '').trim()) : null;
                    onEvent({ type, data });
                }
            }
        } catch (err) {
            this.logger.error('SSE stream error', err);
            throw err;
        }
    }

    /**
     * Stream code generation via SSE
     */
    async streamGenerate(onEvent: (evt: { type: string; data: any }) => void): Promise<void> {
        try {
            const url = this.client.defaults.baseURL?.replace(/\/$/, '') + '/api/v1/generate/stream';
            const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'text/event-stream' } });
            const reader = (res.body as any).getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let idx;
                while ((idx = buffer.indexOf('\n\n')) >= 0) {
                    const raw = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    const lines = raw.split('\n');
                    const eventLine = lines.find(l => l.startsWith('event:')) || '';
                    const dataLine = lines.find(l => l.startsWith('data:')) || '';
                    const type = eventLine.replace('event:', '').trim() || 'message';
                    const data = dataLine ? JSON.parse(dataLine.replace('data:', '').trim()) : null;
                    onEvent({ type, data });
                }
            }
        } catch (err) {
            this.logger.error('SSE stream error', err);
            throw err;
        }
    }

    /**
     * Index a single file
     */
    async indexFile(request: { file_path: string; content: string; language: string }): Promise<void> {
        try {
            // Preferred modern endpoint
            const response = await this.client.post('/api/v1/index/file', {
                file_path: request.file_path,
                content: request.content,
                language: request.language
            });
            return response.data;
        } catch (error: any) {
            // Fallback for legacy servers that expect POST /api/v1/index with file payload
            if (error?.response?.status === 404) {
                this.logger.warn('Index file endpoint not found, falling back to /api/v1/index');
                const fallback = await this.client.post('/api/v1/index', {
                    file_path: request.file_path,
                    content: request.content,
                    language: request.language
                });
                return fallback.data;
            }
            this.logger.error('File indexing failed:', error);
            throw error;
        }
    }

    /**
     * Remove a file from index
     */
    async removeFile(request: { file_path: string }): Promise<void> {
        try {
            const response = await this.client.delete(`/api/v1/index/file?file_path=${encodeURIComponent(request.file_path)}`);
            return response.data;
        } catch (error) {
            this.logger.error('File removal failed:', error);
            throw error;
        }
    }

    /**
     * Get refactoring suggestions
     */
    async getRefactoringSuggestions(code: string, language: string, filePath?: string): Promise<any> {
        try {
            const response = await this.client.post('/api/v1/refactor', {
                code,
                language,
                file_path: filePath,
                refactor_type: 'general',
                include_examples: true
            });
            return response.data;
        } catch (error) {
            this.logger.error('Refactoring suggestions failed:', error);
            throw error;
        }
    }

    /**
     * Indexing status and metadata
     */
    async getIndexStatus(workspacePath?: string): Promise<any> {
        try {
            const response = await this.client.get('/api/v1/index/status', {
                params: workspacePath ? { workspace_path: workspacePath } : undefined
            });
            return response.data;
        } catch (error) {
            this.logger.error('Index status retrieval failed:', error);
            throw error;
        }
    }

    async listIndexedFiles(workspacePath?: string, limit: number = 100, offset: number = 0): Promise<any> {
        try {
            const response = await this.client.get('/api/v1/index/files', {
                params: {
                    workspace_path: workspacePath,
                    limit,
                    offset
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error('Indexed files retrieval failed:', error);
            throw error;
        }
    }

    /**
     * Get system statistics
     */
    async getStats(): Promise<any> {
        try {
            const response = await this.client.get('/api/v1/stats');
            return response.data;
        } catch (error) {
            this.logger.error('Stats retrieval failed:', error);
            throw error;
        }
    }

    /**
     * Connect to WebSocket for real-time communication
     */
    connectWebSocket(onMessage?: (data: any) => void, onError?: (error: Error) => void): void {
        try {
            const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws/chat';
            this.websocket = new WebSocket(wsUrl);

            this.websocket?.on('open', () => {
                this.logger.info('WebSocket connected');
            });

            this.websocket?.on('message', (data: WebSocket.Data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.logger.debug('WebSocket message received:', message);

                    if (onMessage) {
                        onMessage(message);
                    }

                    // Handle callbacks for specific message types
                    if (message.type && this.websocketCallbacks.has(message.type)) {
                        const callback = this.websocketCallbacks.get(message.type);
                        if (callback) {
                            callback(message);
                        }
                    }
                } catch (error) {
                    this.logger.error('Error parsing WebSocket message:', error);
                }
            });

            this.websocket?.on('error', (error: Error) => {
                this.logger.error('WebSocket error:', error);
                if (onError) {
                    onError(error);
                }
            });

            this.websocket?.on('close', () => {
                this.logger.info('WebSocket disconnected');
                this.websocket = undefined;
            });

        } catch (error) {
            this.logger.error('Failed to connect WebSocket:', error);
            if (onError) {
                onError(error as Error);
            }
        }
    }

    /**
     * Send message via WebSocket
     */
    sendWebSocketMessage(message: any): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
            this.logger.debug('WebSocket message sent:', message);
        } else {
            this.logger.warn('WebSocket not connected, cannot send message');
        }
    }

    /**
     * Register callback for specific WebSocket message types
     */
    onWebSocketMessage(type: string, callback: (data: any) => void): void {
        this.websocketCallbacks.set(type, callback);
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = undefined;
            this.websocketCallbacks.clear();
        }
    }

    /**
     * Check if WebSocket is connected
     */
    isWebSocketConnected(): boolean {
        return this.websocket?.readyState === WebSocket.OPEN;
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.disconnectWebSocket();
        this.logger.info('ApiClient disposed');
    }
}
