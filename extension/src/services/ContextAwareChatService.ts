/**
 * Context-Aware Chat Service for AI Coding Assistant
 * Provides intelligent chat with full workspace context awareness
 */

import * as vscode from 'vscode';
import { AIService } from './AIService';
import { SecureConfigManager } from './SecureConfigManager';
import { Logger } from '../utils/Logger';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    context?: ChatContext;
    metadata?: {
        provider?: string;
        model?: string;
        tokens?: number;
        processingTime?: number;
    };
}

export interface ChatContext {
    activeFile?: {
        path: string;
        language: string;
        content: string;
        selection?: string;
        cursorPosition?: vscode.Position;
    };
    workspace?: {
        name: string;
        files: string[];
        recentFiles: string[];
    };
    gitInfo?: {
        branch: string;
        hasChanges: boolean;
        lastCommit?: string;
    };
    diagnostics?: {
        errors: number;
        warnings: number;
        infos: number;
    };
    relevantCode?: {
        files: string[];
        functions: string[];
        classes: string[];
    };
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    created: number;
    lastUpdated: number;
    context: ChatContext;
}

export class ContextAwareChatService {
    private aiService: AIService;
    private configManager: SecureConfigManager;
    private logger: Logger;
    private currentSession: ChatSession | null = null;
    private sessions: Map<string, ChatSession> = new Map();
    private contextUpdateInterval: NodeJS.Timeout | null = null;

    constructor(aiService: AIService, configManager: SecureConfigManager) {
        this.aiService = aiService;
        this.configManager = configManager;
        this.logger = new Logger('ContextAwareChatService');
        
        this.startContextMonitoring();
    }

    public async createNewSession(title?: string): Promise<ChatSession> {
        const sessionId = this.generateSessionId();
        const context = await this.gatherCurrentContext();
        
        const session: ChatSession = {
            id: sessionId,
            title: title || this.generateSessionTitle(context),
            messages: [],
            created: Date.now(),
            lastUpdated: Date.now(),
            context
        };

        // Add system message with context
        const systemMessage: ChatMessage = {
            id: this.generateMessageId(),
            role: 'system',
            content: this.buildSystemPrompt(context),
            timestamp: Date.now(),
            context
        };

        session.messages.push(systemMessage);
        this.sessions.set(sessionId, session);
        this.currentSession = session;

        this.logger.info(`Created new chat session: ${sessionId}`);
        return session;
    }

    public async sendMessage(content: string, includeContext: boolean = true): Promise<ChatMessage> {
        if (!this.currentSession) {
            await this.createNewSession();
        }

        const session = this.currentSession!;
        
        // Update context if requested
        if (includeContext) {
            session.context = await this.gatherCurrentContext();
        }

        // Create user message
        const userMessage: ChatMessage = {
            id: this.generateMessageId(),
            role: 'user',
            content,
            timestamp: Date.now(),
            context: includeContext ? session.context : undefined
        };

        session.messages.push(userMessage);

        // Generate AI response
        const assistantMessage = await this.generateResponse(session, userMessage);
        session.messages.push(assistantMessage);

        // Update session
        session.lastUpdated = Date.now();
        this.sessions.set(session.id, session);

        this.logger.info(`Message sent and response received in session: ${session.id}`);
        return assistantMessage;
    }

    private async generateResponse(session: ChatSession, userMessage: ChatMessage): Promise<ChatMessage> {
        const startTime = Date.now();
        
        try {
            // Build conversation history
            const conversationHistory = this.buildConversationHistory(session);
            
            // Enhance user message with context
            const enhancedPrompt = this.enhancePromptWithContext(userMessage.content, session.context);
            
            // Get AI response
            const response = await this.aiService.chat({
                messages: [
                    ...conversationHistory,
                    { role: 'user', content: enhancedPrompt }
                ],
                temperature: 0.7,
                maxTokens: 2000,
                stream: false
            });

            const processingTime = Date.now() - startTime;

            return {
                id: this.generateMessageId(),
                role: 'assistant',
                content: response.content,
                timestamp: Date.now(),
                context: session.context,
                metadata: {
                    provider: response.provider,
                    model: response.model,
                    tokens: response.tokens,
                    processingTime
                }
            };

        } catch (error) {
            this.logger.error('Error generating AI response:', error);
            
            return {
                id: this.generateMessageId(),
                role: 'assistant',
                content: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: Date.now(),
                context: session.context,
                metadata: {
                    processingTime: Date.now() - startTime
                }
            };
        }
    }

    private async gatherCurrentContext(): Promise<ChatContext> {
        const context: ChatContext = {};

        try {
            // Active file context
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const document = activeEditor.document;
                const selection = activeEditor.selection;
                
                context.activeFile = {
                    path: document.uri.fsPath,
                    language: document.languageId,
                    content: document.getText(),
                    selection: selection.isEmpty ? undefined : document.getText(selection),
                    cursorPosition: activeEditor.selection.active
                };
            }

            // Workspace context
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100);
                const recentFiles = this.getRecentFiles();
                
                context.workspace = {
                    name: workspaceFolder.name,
                    files: files.map(f => f.fsPath),
                    recentFiles
                };
            }

            // Git context
            context.gitInfo = await this.getGitInfo();

            // Diagnostics context
            context.diagnostics = this.getDiagnosticsInfo();

            // Relevant code context
            context.relevantCode = await this.findRelevantCode();

        } catch (error) {
            this.logger.error('Error gathering context:', error);
        }

        return context;
    }

    private buildSystemPrompt(context: ChatContext): string {
        let prompt = `You are an AI coding assistant with access to the user's current development context. `;
        
        if (context.activeFile) {
            prompt += `The user is currently working on a ${context.activeFile.language} file: ${context.activeFile.path}. `;
        }

        if (context.workspace) {
            prompt += `The workspace is "${context.workspace.name}" with ${context.workspace.files.length} files. `;
        }

        if (context.diagnostics && context.diagnostics.errors > 0) {
            prompt += `There are ${context.diagnostics.errors} errors and ${context.diagnostics.warnings} warnings in the workspace. `;
        }

        prompt += `Provide helpful, accurate, and contextually relevant assistance. When suggesting code changes, consider the current file and project structure.`;

        return prompt;
    }

    private enhancePromptWithContext(prompt: string, context: ChatContext): string {
        let enhancedPrompt = prompt;

        // Add active file context if relevant
        if (context.activeFile && this.isCodeRelatedQuery(prompt)) {
            enhancedPrompt += `\n\nCurrent file (${context.activeFile.language}): ${context.activeFile.path}`;
            
            if (context.activeFile.selection) {
                enhancedPrompt += `\n\nSelected code:\n\`\`\`${context.activeFile.language}\n${context.activeFile.selection}\n\`\`\``;
            } else if (context.activeFile.content.length < 2000) {
                enhancedPrompt += `\n\nFile content:\n\`\`\`${context.activeFile.language}\n${context.activeFile.content}\n\`\`\``;
            }
        }

        // Add diagnostics context if there are issues
        if (context.diagnostics && context.diagnostics.errors > 0 && this.isErrorRelatedQuery(prompt)) {
            enhancedPrompt += `\n\nNote: There are currently ${context.diagnostics.errors} errors in the workspace.`;
        }

        return enhancedPrompt;
    }

    private buildConversationHistory(session: ChatSession): Array<{role: 'user' | 'assistant' | 'system', content: string}> {
        // Get last 10 messages (excluding system message)
        const messages = session.messages
            .filter(m => m.role !== 'system')
            .slice(-10)
            .map(m => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content
            }));

        return messages;
    }

    private isCodeRelatedQuery(query: string): boolean {
        const codeKeywords = ['function', 'class', 'method', 'variable', 'code', 'implement', 'fix', 'debug', 'refactor', 'optimize'];
        return codeKeywords.some(keyword => query.toLowerCase().includes(keyword));
    }

    private isErrorRelatedQuery(query: string): boolean {
        const errorKeywords = ['error', 'bug', 'issue', 'problem', 'fix', 'debug', 'broken', 'not working'];
        return errorKeywords.some(keyword => query.toLowerCase().includes(keyword));
    }

    private async getGitInfo(): Promise<ChatContext['gitInfo']> {
        try {
            // This would integrate with VS Code's Git extension
            // For now, return basic info
            return {
                branch: 'main',
                hasChanges: false
            };
        } catch {
            return undefined;
        }
    }

    private getDiagnosticsInfo(): ChatContext['diagnostics'] {
        const diagnostics = vscode.languages.getDiagnostics();
        let errors = 0, warnings = 0, infos = 0;

        diagnostics.forEach(([uri, diags]) => {
            diags.forEach(diag => {
                switch (diag.severity) {
                    case vscode.DiagnosticSeverity.Error:
                        errors++;
                        break;
                    case vscode.DiagnosticSeverity.Warning:
                        warnings++;
                        break;
                    case vscode.DiagnosticSeverity.Information:
                        infos++;
                        break;
                }
            });
        });

        return { errors, warnings, infos };
    }

    private async findRelevantCode(): Promise<ChatContext['relevantCode']> {
        // This would analyze the codebase to find relevant functions, classes, etc.
        // For now, return empty
        return {
            files: [],
            functions: [],
            classes: []
        };
    }

    private getRecentFiles(): string[] {
        // This would track recently opened files
        // For now, return empty array
        return [];
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateSessionTitle(context: ChatContext): string {
        if (context.activeFile) {
            const fileName = context.activeFile.path.split('/').pop() || 'Unknown';
            return `Chat about ${fileName}`;
        }
        
        if (context.workspace) {
            return `Chat in ${context.workspace.name}`;
        }
        
        return `Chat Session ${new Date().toLocaleTimeString()}`;
    }

    private startContextMonitoring(): void {
        // Update context every 30 seconds
        this.contextUpdateInterval = setInterval(async () => {
            if (this.currentSession) {
                this.currentSession.context = await this.gatherCurrentContext();
            }
        }, 30000);
    }

    public getCurrentSession(): ChatSession | null {
        return this.currentSession;
    }

    public getAllSessions(): ChatSession[] {
        return Array.from(this.sessions.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);
    }

    public switchToSession(sessionId: string): ChatSession | null {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.currentSession = session;
            return session;
        }
        return null;
    }

    public deleteSession(sessionId: string): boolean {
        const deleted = this.sessions.delete(sessionId);
        if (this.currentSession?.id === sessionId) {
            this.currentSession = null;
        }
        return deleted;
    }

    public dispose(): void {
        if (this.contextUpdateInterval) {
            clearInterval(this.contextUpdateInterval);
            this.contextUpdateInterval = null;
        }
        
        this.sessions.clear();
        this.currentSession = null;
        
        this.logger.info('ContextAwareChatService disposed');
    }
}
