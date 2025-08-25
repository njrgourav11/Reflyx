/**
 * Enhanced Chat Provider with Streaming Support
 * Provides context-aware chat interface with real-time streaming responses
 */

import * as vscode from 'vscode';
import { ApiClient } from '../services/ApiClient';
import { StateManager } from '../services/StateManager';
import { ConfigurationManager } from '../services/ConfigurationManager';
import { Logger } from '../utils/Logger';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    streaming?: boolean;
    metadata?: {
        provider?: string;
        model?: string;
        processingTime?: number;
        tokensUsed?: number;
    };
}

interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    lastActivity: number;
}

export class EnhancedChatProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiCodingAssistant.enhancedChatView';
    
    private view?: vscode.WebviewView;
    private logger: Logger;
    private apiClient: ApiClient;
    private stateManager: StateManager;
    private configManager: ConfigurationManager;
    private currentSession: ChatSession;
    private sessions: Map<string, ChatSession> = new Map();

    constructor(
        private readonly context: vscode.ExtensionContext,
        apiClient: ApiClient,
        stateManager: StateManager,
        configManager: ConfigurationManager
    ) {
        this.logger = new Logger('EnhancedChatProvider');
        this.apiClient = apiClient;
        this.stateManager = stateManager;
        this.configManager = configManager;
        
        // Create initial session
        this.currentSession = this.createNewSession();
        this.sessions.set(this.currentSession.id, this.currentSession);
        
        // Load previous sessions
        this.loadSessions();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri
            ]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        this.setupWebviewMessageHandling();
        
        // Send initial data
        this.sendCurrentSession();
    }

    private setupWebviewMessageHandling(): void {
        if (!this.view) return;

        this.view.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleUserMessage(message.content, message.context);
                        break;
                        
                    case 'newSession':
                        this.createAndSwitchToNewSession();
                        break;
                        
                    case 'switchSession':
                        this.switchToSession(message.sessionId);
                        break;
                        
                    case 'deleteSession':
                        this.deleteSession(message.sessionId);
                        break;
                        
                    case 'clearSession':
                        this.clearCurrentSession();
                        break;
                        
                    case 'exportSession':
                        await this.exportSession(message.sessionId);
                        break;
                        
                    case 'requestSessions':
                        this.sendSessionsList();
                        break;
                        
                    case 'stopGeneration':
                        this.stopCurrentGeneration();
                        break;
                        
                    default:
                        this.logger.warn(`Unknown message type: ${message.type}`);
                }
            } catch (error) {
                this.logger.error('Error handling webview message:', error);
                this.sendError(error instanceof Error ? error.message : 'Unknown error');
            }
        });
    }

    private async handleUserMessage(content: string, context?: any): Promise<void> {
        if (!content.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: this.generateMessageId(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now()
        };
        
        this.currentSession.messages.push(userMessage);
        this.currentSession.lastActivity = Date.now();
        
        // Send user message to UI
        this.sendMessage(userMessage);
        
        // Create assistant message placeholder for streaming
        const assistantMessage: ChatMessage = {
            id: this.generateMessageId(),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            streaming: true
        };
        
        this.currentSession.messages.push(assistantMessage);
        this.sendMessage(assistantMessage);
        
        try {
            // Get AI configuration
            const config = await this.configManager.getCurrentConfiguration();
            
            // Build context from current workspace
            const workspaceContext = await this.buildWorkspaceContext(content);
            
            // Prepare request
            const request = {
                query: content,
                workspace_path: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                max_results: 10,
                similarity_threshold: 0.7,
                include_context: true,
                conversation_history: this.getRecentMessages(5)
            };
            
            // Start streaming response
            await this.streamResponse(assistantMessage.id, request);
            
        } catch (error) {
            this.logger.error('Error processing user message:', error);
            
            // Update assistant message with error
            assistantMessage.content = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            assistantMessage.streaming = false;
            
            this.sendMessage(assistantMessage);
        }
        
        // Save sessions
        this.saveSessions();
    }

    private async streamResponse(messageId: string, request: any): Promise<void> {
        try {
            // Find the message to update
            const message = this.currentSession.messages.find(m => m.id === messageId);
            if (!message) return;

            // Connect to WebSocket for streaming
            if (!this.apiClient.isWebSocketConnected()) {
                this.apiClient.connectWebSocket(
                    (data) => this.handleWebSocketMessage(data),
                    (error) => this.logger.error('WebSocket error:', error)
                );
            }

            // Send streaming request
            this.apiClient.sendWebSocketMessage({
                type: 'stream_query',
                data: request,
                message_id: messageId
            });

        } catch (error) {
            this.logger.error('Error starting stream response:', error);
            throw error;
        }
    }

    private handleWebSocketMessage(data: any): void {
        try {
            switch (data.type) {
                case 'stream_chunk':
                    this.handleStreamChunk(data);
                    break;
                    
                case 'stream_complete':
                    this.handleStreamComplete(data);
                    break;
                    
                case 'stream_error':
                    this.handleStreamError(data);
                    break;
                    
                default:
                    this.logger.debug('Unknown WebSocket message:', data);
            }
        } catch (error) {
            this.logger.error('Error handling WebSocket message:', error);
        }
    }

    private handleStreamChunk(data: any): void {
        const messageId = data.message_id;
        const chunk = data.chunk;
        
        // Find and update the message
        const message = this.currentSession.messages.find(m => m.id === messageId);
        if (message) {
            message.content += chunk;
            this.sendMessageUpdate(message);
        }
    }

    private handleStreamComplete(data: any): void {
        const messageId = data.message_id;
        
        // Find and finalize the message
        const message = this.currentSession.messages.find(m => m.id === messageId);
        if (message) {
            message.streaming = false;
            message.metadata = {
                provider: data.provider,
                model: data.model,
                processingTime: data.processing_time,
                tokensUsed: data.tokens_used
            };
            
            this.sendMessageUpdate(message);
        }
        
        // Update session activity
        this.currentSession.lastActivity = Date.now();
        this.saveSessions();
    }

    private handleStreamError(data: any): void {
        const messageId = data.message_id;
        const error = data.error;
        
        // Find and update the message with error
        const message = this.currentSession.messages.find(m => m.id === messageId);
        if (message) {
            message.content = `❌ Error: ${error}`;
            message.streaming = false;
            this.sendMessageUpdate(message);
        }
    }

    private async buildWorkspaceContext(query: string): Promise<string> {
        try {
            // Get current file context if available
            const activeEditor = vscode.window.activeTextEditor;
            let context = '';
            
            if (activeEditor) {
                const document = activeEditor.document;
                const selection = activeEditor.selection;
                
                context += `Current file: ${document.fileName}\n`;
                context += `Language: ${document.languageId}\n`;
                
                if (!selection.isEmpty) {
                    context += `Selected code:\n${document.getText(selection)}\n`;
                }
            }
            
            return context;
            
        } catch (error) {
            this.logger.error('Error building workspace context:', error);
            return '';
        }
    }

    private getRecentMessages(count: number): ChatMessage[] {
        return this.currentSession.messages
            .filter(m => m.role !== 'system')
            .slice(-count * 2); // Get last N exchanges (user + assistant pairs)
    }

    private createNewSession(): ChatSession {
        return {
            id: this.generateSessionId(),
            title: `Chat ${new Date().toLocaleTimeString()}`,
            messages: [],
            created: Date.now(),
            lastActivity: Date.now()
        };
    }

    private createAndSwitchToNewSession(): void {
        const newSession = this.createNewSession();
        this.sessions.set(newSession.id, newSession);
        this.currentSession = newSession;
        
        this.sendCurrentSession();
        this.sendSessionsList();
        this.saveSessions();
    }

    private switchToSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.currentSession = session;
            this.sendCurrentSession();
        }
    }

    private deleteSession(sessionId: string): void {
        if (this.sessions.size <= 1) {
            vscode.window.showWarningMessage('Cannot delete the last session');
            return;
        }
        
        this.sessions.delete(sessionId);
        
        // If current session was deleted, switch to another
        if (this.currentSession.id === sessionId) {
            const firstSession = this.sessions.values().next().value;
            this.currentSession = firstSession;
            this.sendCurrentSession();
        }
        
        this.sendSessionsList();
        this.saveSessions();
    }

    private clearCurrentSession(): void {
        this.currentSession.messages = [];
        this.currentSession.lastActivity = Date.now();
        this.sendCurrentSession();
        this.saveSessions();
    }

    private async exportSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) return;
        
        const content = this.formatSessionForExport(session);
        
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(`chat-session-${session.id}.md`),
            filters: {
                'Markdown': ['md'],
                'Text': ['txt']
            }
        });
        
        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
            vscode.window.showInformationMessage('Chat session exported successfully');
        }
    }

    private formatSessionForExport(session: ChatSession): string {
        let content = `# Chat Session: ${session.title}\n\n`;
        content += `Created: ${new Date(session.created).toLocaleString()}\n`;
        content += `Last Activity: ${new Date(session.lastActivity).toLocaleString()}\n\n`;
        
        for (const message of session.messages) {
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            content += `## ${message.role.toUpperCase()} (${timestamp})\n\n`;
            content += `${message.content}\n\n`;
            
            if (message.metadata) {
                content += `*Provider: ${message.metadata.provider}, Model: ${message.metadata.model}*\n\n`;
            }
        }
        
        return content;
    }

    private stopCurrentGeneration(): void {
        // Find any streaming messages and stop them
        const streamingMessage = this.currentSession.messages.find(m => m.streaming);
        if (streamingMessage) {
            streamingMessage.streaming = false;
            streamingMessage.content += '\n\n*[Generation stopped by user]*';
            this.sendMessageUpdate(streamingMessage);
        }
        
        // Send stop signal via WebSocket
        this.apiClient.sendWebSocketMessage({
            type: 'stop_generation'
        });
    }

    private sendCurrentSession(): void {
        this.view?.webview.postMessage({
            type: 'sessionUpdate',
            session: this.currentSession
        });
    }

    private sendSessionsList(): void {
        const sessionsList = Array.from(this.sessions.values())
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .map(s => ({
                id: s.id,
                title: s.title,
                messageCount: s.messages.length,
                lastActivity: s.lastActivity
            }));
            
        this.view?.webview.postMessage({
            type: 'sessionsList',
            sessions: sessionsList,
            currentSessionId: this.currentSession.id
        });
    }

    private sendMessage(message: ChatMessage): void {
        this.view?.webview.postMessage({
            type: 'newMessage',
            message: message
        });
    }

    private sendMessageUpdate(message: ChatMessage): void {
        this.view?.webview.postMessage({
            type: 'messageUpdate',
            message: message
        });
    }

    private sendError(error: string): void {
        this.view?.webview.postMessage({
            type: 'error',
            error: error
        });
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async loadSessions(): Promise<void> {
        try {
            const saved = await this.stateManager.getGlobalState('chatSessions');
            if (saved && Array.isArray(saved)) {
                this.sessions.clear();
                for (const sessionData of saved) {
                    this.sessions.set(sessionData.id, sessionData);
                }
                
                // Set current session to most recent
                const sortedSessions = Array.from(this.sessions.values())
                    .sort((a, b) => b.lastActivity - a.lastActivity);
                    
                if (sortedSessions.length > 0) {
                    this.currentSession = sortedSessions[0];
                }
            }
        } catch (error) {
            this.logger.error('Error loading sessions:', error);
        }
    }

    private async saveSessions(): Promise<void> {
        try {
            const sessionsArray = Array.from(this.sessions.values());
            await this.stateManager.setGlobalState('chatSessions', sessionsArray);
        } catch (error) {
            this.logger.error('Error saving sessions:', error);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // This would contain the HTML for the enhanced chat interface
        // For brevity, returning a placeholder - in practice this would be a full React/Vue component
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Chat</title>
            <style>
                /* Enhanced chat styles would go here */
                body { font-family: var(--vscode-font-family); }
                .chat-container { height: 100vh; display: flex; flex-direction: column; }
                .messages { flex: 1; overflow-y: auto; padding: 10px; }
                .message { margin-bottom: 15px; }
                .streaming { opacity: 0.8; }
                .input-area { padding: 10px; border-top: 1px solid var(--vscode-panel-border); }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="messages" id="messages"></div>
                <div class="input-area">
                    <textarea id="messageInput" placeholder="Ask about your code..."></textarea>
                    <button id="sendButton">Send</button>
                </div>
            </div>
            <script>
                // Enhanced chat JavaScript would go here
                const vscode = acquireVsCodeApi();
                // Implementation for streaming chat interface
            </script>
        </body>
        </html>`;
    }

    public async handleQuery(query: string): Promise<void> {
        await this.handleUserMessage(query);
    }

    public async handleExplainCode(code: string, language: string, filePath?: string): Promise<void> {
        const query = `Please explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        if (filePath) {
            query + `\n\nFile: ${filePath}`;
        }
        await this.handleUserMessage(query);
    }

    public async handleGenerateCode(prompt: string, language: string): Promise<void> {
        const query = `Generate ${language} code for: ${prompt}`;
        await this.handleUserMessage(query);
    }

    public async handleFindSimilar(code: string, language: string): Promise<void> {
        const query = `Find similar code patterns to this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        await this.handleUserMessage(query);
    }

    public async handleRefactorSuggestion(code: string, language: string, filePath?: string): Promise<void> {
        const query = `Suggest refactoring improvements for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        if (filePath) {
            query + `\n\nFile: ${filePath}`;
        }
        await this.handleUserMessage(query);
    }
}
