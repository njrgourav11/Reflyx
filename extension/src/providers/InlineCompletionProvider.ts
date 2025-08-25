/**
 * Inline Completion Provider for AI-powered code suggestions
 * Provides real-time code completions as the user types
 */

import * as vscode from 'vscode';
import { ApiClient } from '../services/ApiClient';
import { ConfigurationManager } from '../services/ConfigurationManager';
import { Logger } from '../utils/Logger';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private logger: Logger;
    private apiClient: ApiClient;
    private configManager: ConfigurationManager;
    private lastCompletionTime: number = 0;
    private completionCache: Map<string, vscode.InlineCompletionItem[]> = new Map();
    private readonly debounceMs = 300; // Debounce completions
    private readonly cacheExpiryMs = 30000; // 30 seconds cache

    constructor(apiClient: ApiClient, configManager: ConfigurationManager) {
        this.logger = new Logger('InlineCompletionProvider');
        this.apiClient = apiClient;
        this.configManager = configManager;
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
        try {
            // Check if inline completions are enabled
            const config = vscode.workspace.getConfiguration('aiCodingAssistant');
            if (!config.get('enableInlineCompletions', true)) {
                return null;
            }

            // Debounce rapid requests
            const now = Date.now();
            if (now - this.lastCompletionTime < this.debounceMs) {
                return null;
            }
            this.lastCompletionTime = now;

            // Get context around cursor
            const contextRange = this.getContextRange(document, position);
            const contextText = document.getText(contextRange);
            
            // Create cache key
            const cacheKey = this.createCacheKey(document, position, contextText);
            
            // Check cache first
            const cached = this.getCachedCompletion(cacheKey);
            if (cached) {
                return cached;
            }

            // Don't provide completions for very short context
            if (contextText.trim().length < 10) {
                return null;
            }

            // Get AI configuration
            const aiConfig = await this.configManager.getCurrentConfiguration();
            
            // Skip if no providers available
            if (aiConfig.mode === 'online' && Object.keys(aiConfig.apiKeys).length === 0) {
                return null;
            }

            // Generate completion
            const completion = await this.generateCompletion(
                document,
                position,
                contextText,
                token
            );

            if (completion && completion.length > 0) {
                // Cache the result
                this.cacheCompletion(cacheKey, completion);
                return completion;
            }

            return null;

        } catch (error) {
            this.logger.error('Error providing inline completion:', error);
            return null;
        }
    }

    private getContextRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range {
        // Get context: 10 lines before and 2 lines after cursor
        const startLine = Math.max(0, position.line - 10);
        const endLine = Math.min(document.lineCount - 1, position.line + 2);
        
        return new vscode.Range(
            new vscode.Position(startLine, 0),
            new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
    }

    private createCacheKey(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: string
    ): string {
        const uri = document.uri.toString();
        const pos = `${position.line}:${position.character}`;
        const contextHash = this.simpleHash(context);
        return `${uri}:${pos}:${contextHash}`;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    private getCachedCompletion(key: string): vscode.InlineCompletionItem[] | null {
        const cached = this.completionCache.get(key);
        if (cached) {
            // Check if cache is still valid
            const now = Date.now();
            if (now - this.lastCompletionTime < this.cacheExpiryMs) {
                return cached;
            } else {
                this.completionCache.delete(key);
            }
        }
        return null;
    }

    private cacheCompletion(key: string, completion: vscode.InlineCompletionItem[]): void {
        // Limit cache size
        if (this.completionCache.size > 50) {
            const firstKey = this.completionCache.keys().next().value;
            this.completionCache.delete(firstKey);
        }
        this.completionCache.set(key, completion);
    }

    private async generateCompletion(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: string,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | null> {
        try {
            // Get current line and cursor position
            const currentLine = document.lineAt(position.line);
            const textBeforeCursor = currentLine.text.substring(0, position.character);
            const textAfterCursor = currentLine.text.substring(position.character);

            // Prepare completion request
            const request = {
                prompt: this.buildCompletionPrompt(context, textBeforeCursor, document.languageId),
                language: document.languageId,
                context: context,
                style: 'concise' as 'concise',
                max_length: 200,
                temperature: 0.1
            };

            // Generate completion using API
            const response = await this.apiClient.generateCode(request);
            
            if (token.isCancellationRequested) {
                return null;
            }

            if (response.success && response.data?.generated_code) {
                const generatedCode = response.data.generated_code.trim();
                
                // Process and clean the generated code
                const cleanedCode = this.cleanGeneratedCode(generatedCode, textBeforeCursor);
                
                if (cleanedCode && cleanedCode.length > 0) {
                    const completionItem = new vscode.InlineCompletionItem(
                        cleanedCode,
                        new vscode.Range(position, position)
                    );
                    
                    return [completionItem];
                }
            }

            return null;

        } catch (error) {
            this.logger.error('Error generating completion:', error);
            return null;
        }
    }

    private buildCompletionPrompt(context: string, textBeforeCursor: string, language: string): string {
        return `Complete the following ${language} code. Provide only the completion, no explanations:

Context:
${context}

Complete this line:
${textBeforeCursor}`;
    }

    private cleanGeneratedCode(generated: string, prefix: string): string {
        // Remove code block markers if present
        let cleaned = generated.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        
        // Remove any duplicate prefix
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.substring(prefix.length);
        }
        
        // Take only the first line for inline completion
        const firstLine = cleaned.split('\n')[0];
        
        // Remove leading/trailing whitespace
        return firstLine.trim();
    }

    dispose(): void {
        this.completionCache.clear();
    }
}

/**
 * Inline Completion Manager
 * Manages the registration and lifecycle of inline completion providers
 */
export class InlineCompletionManager {
    private provider: InlineCompletionProvider | null = null;
    private disposable: vscode.Disposable | null = null;
    private logger: Logger;

    constructor() {
        this.logger = new Logger('InlineCompletionManager');
    }

    register(apiClient: ApiClient, configManager: ConfigurationManager): void {
        try {
            this.provider = new InlineCompletionProvider(apiClient, configManager);
            
            this.disposable = vscode.languages.registerInlineCompletionItemProvider(
                { scheme: 'file' },
                this.provider
            );

            this.logger.info('✅ Inline completion provider registered');

        } catch (error) {
            this.logger.error('Failed to register inline completion provider:', error);
        }
    }

    dispose(): void {
        if (this.disposable) {
            this.disposable.dispose();
            this.disposable = null;
        }
        
        if (this.provider) {
            this.provider.dispose();
            this.provider = null;
        }

        this.logger.info('Inline completion provider disposed');
    }
}
