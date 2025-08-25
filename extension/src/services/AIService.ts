/**
 * AI Service for AI Coding Assistant
 * Handles AI provider communication and management
 */

import * as vscode from 'vscode';
import { ApiClient } from './ApiClient';
import { SecureConfigManager } from './SecureConfigManager';
import { Logger } from '../utils/Logger';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ChatResponse {
    content: string;
    provider?: string;
    model?: string;
    tokens?: number;
}

export interface CompletionRequest {
    prompt: string;
    language: string;
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
}

export class AIService {
    private logger: Logger;

    constructor(
        private apiClient: ApiClient,
        private configManager: SecureConfigManager
    ) {
        this.logger = new Logger('AIService');
    }

    async chat(request: ChatRequest): Promise<ChatResponse> {
        try {
            // Convert to API format
            const apiRequest = {
                messages: request.messages,
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 2000,
                stream: request.stream || false
            };

            const response = await this.apiClient.explainCode({
                code: request.messages[request.messages.length - 1].content,
                language: 'text'
            });

            return {
                content: response.explanation || 'No response generated',
                provider: 'api',
                model: 'default'
            };

        } catch (error) {
            this.logger.error('Chat request failed:', error);
            throw error;
        }
    }

    async generateCompletion(request: CompletionRequest): Promise<string> {
        try {
            const response = await this.apiClient.generateCode({
                prompt: request.prompt,
                language: request.language,
                style: 'concise',
                max_length: request.maxTokens || 150
            });

            return response.generated_code || '';

        } catch (error) {
            this.logger.error('Completion generation failed:', error);
            throw error;
        }
    }

    async explainCode(code: string, language: string): Promise<string> {
        try {
            const response = await this.apiClient.explainCode({
                code,
                language
            });

            return response.explanation || 'No explanation available';

        } catch (error) {
            this.logger.error('Code explanation failed:', error);
            throw error;
        }
    }

    async generateCode(prompt: string, language: string): Promise<string> {
        try {
            const response = await this.apiClient.generateCode({
                prompt,
                language,
                style: 'production',
                max_length: 500
            });

            return response.generated_code || '';

        } catch (error) {
            this.logger.error('Code generation failed:', error);
            throw error;
        }
    }

    async findSimilarCode(code: string, language: string): Promise<any[]> {
        try {
            const response = await this.apiClient.query({
                query: `Find similar code patterns: ${code}`,
                max_results: 5
            });

            return response.results || [];

        } catch (error) {
            this.logger.error('Similar code search failed:', error);
            throw error;
        }
    }

    dispose(): void {
        this.logger.info('AIService disposed');
    }
}
