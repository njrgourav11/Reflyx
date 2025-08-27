/**
 * Enhanced Configuration Manager with Secure API Key Storage
 * Manages dual-mode settings and secure storage of API keys using VS Code SecretStorage
 */

import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';

export interface AIProvider {
    id: string;
    name: string;
    type: 'local' | 'online';
    description: string;
    models: AIModel[];
    requiresApiKey: boolean;
    website?: string;
    freeCredits?: string;
}

export interface AIModel {
    id: string;
    name: string;
    description: string;
    contextLength: number;
    recommended: boolean;
    costPer1kTokens?: {
        input: number;
        output: number;
    };
}

export interface AIConfiguration {
    serverUrl: string;
    mode: 'local' | 'online' | 'hybrid';
    preferredProvider: string;
    fallbackProvider?: string;
    selectedModel?: string;
    apiKeys: { [provider: string]: string };
}

export class ConfigurationManager {
    private logger: Logger;
    private context: vscode.ExtensionContext;
    private secretStorage: vscode.SecretStorage;
    
    // Available AI providers with latest models
    private readonly providers: AIProvider[] = [
        {
            id: 'ollama',
            name: 'Ollama (Local)',
            type: 'local',
            description: 'Local AI models running on your machine - completely private and free',
            requiresApiKey: false,
            website: 'https://ollama.ai',
            models: [
                {
                    id: 'codellama:7b-code',
                    name: 'CodeLlama 7B Code',
                    description: 'Specialized for code generation and understanding',
                    contextLength: 16384,
                    recommended: true
                },
                {
                    id: 'deepseek-coder:6.7b',
                    name: 'DeepSeek Coder 6.7B',
                    description: 'Advanced coding model with multilingual support',
                    contextLength: 16384,
                    recommended: true
                },
                {
                    id: 'qwen2.5-coder:7b',
                    name: 'Qwen2.5 Coder 7B',
                    description: 'Latest Qwen model optimized for coding',
                    contextLength: 32768,
                    recommended: true
                }
            ]
        },
        {
            id: 'openai',
            name: 'OpenAI',
            type: 'online',
            description: 'Industry-leading AI models from OpenAI',
            requiresApiKey: true,
            website: 'https://platform.openai.com/api-keys',
            freeCredits: '$5 free credits for new accounts',
            models: [
                {
                    id: 'gpt-4o',
                    name: 'GPT-4o',
                    description: 'Latest multimodal model with enhanced reasoning',
                    contextLength: 128000,
                    recommended: true,
                    costPer1kTokens: { input: 0.005, output: 0.015 }
                },
                {
                    id: 'gpt-4-turbo',
                    name: 'GPT-4 Turbo',
                    description: 'Fast and capable model for complex tasks',
                    contextLength: 128000,
                    recommended: true,
                    costPer1kTokens: { input: 0.01, output: 0.03 }
                }
            ]
        },
        {
            id: 'anthropic',
            name: 'Anthropic',
            type: 'online',
            description: 'Advanced AI models with strong reasoning capabilities',
            requiresApiKey: true,
            website: 'https://console.anthropic.com/',
            freeCredits: 'Free tier available',
            models: [
                {
                    id: 'claude-3-5-sonnet-20241022',
                    name: 'Claude 3.5 Sonnet',
                    description: 'Latest Claude model with enhanced coding abilities',
                    contextLength: 200000,
                    recommended: true,
                    costPer1kTokens: { input: 0.003, output: 0.015 }
                },
                {
                    id: 'claude-3-opus-20240229',
                    name: 'Claude 3 Opus',
                    description: 'Most capable model for complex reasoning',
                    contextLength: 200000,
                    recommended: true,
                    costPer1kTokens: { input: 0.015, output: 0.075 }
                }
            ]
        },
        {
            id: 'google',
            name: 'Google AI',
            type: 'online',
            description: 'Google\'s advanced AI models with large context windows',
            requiresApiKey: true,
            website: 'https://makersuite.google.com/app/apikey',
            freeCredits: 'Generous free tier available',
            models: [
                {
                    id: 'gemini-1.5-pro',
                    name: 'Gemini 1.5 Pro',
                    description: 'Advanced multimodal model with 2M token context',
                    contextLength: 2000000,
                    recommended: true,
                    costPer1kTokens: { input: 0.00125, output: 0.005 }
                },
                {
                    id: 'gemini-1.5-flash',
                    name: 'Gemini 1.5 Flash',
                    description: 'Fast and efficient multimodal model',
                    contextLength: 1000000,
                    recommended: true,
                    costPer1kTokens: { input: 0.000075, output: 0.0003 }
                }
            ]
        },
        {
            id: 'groq',
            name: 'Groq',
            type: 'online',
            description: 'Ultra-fast inference with open-source models',
            requiresApiKey: true,
            website: 'https://console.groq.com/keys',
            freeCredits: '14,400 requests per day free',
            models: [
                {
                    id: 'llama-3.1-70b-versatile',
                    name: 'Llama 3.1 70B',
                    description: 'Large model with excellent reasoning',
                    contextLength: 131072,
                    recommended: true,
                    costPer1kTokens: { input: 0.00059, output: 0.00079 }
                },
                {
                    id: 'mixtral-8x7b-32768',
                    name: 'Mixtral 8x7B',
                    description: 'Mixture of experts model',
                    contextLength: 32768,
                    recommended: true,
                    costPer1kTokens: { input: 0.00024, output: 0.00024 }
                }
            ]
        }
    ];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.secretStorage = context.secrets;
        this.logger = new Logger('ConfigurationManager');
    }

    /**
     * Get all available AI providers
     */
    getProviders(): AIProvider[] {
        return this.providers;
    }

    /**
     * Get providers by type (local/online)
     */
    getProvidersByType(type: 'local' | 'online'): AIProvider[] {
        return this.providers.filter(p => p.type === type);
    }

    /**
     * Get current AI configuration
     */
    async getCurrentConfiguration(): Promise<AIConfiguration> {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');
        
        // Get API keys from secure storage
        const apiKeys: { [provider: string]: string } = {};
        for (const provider of this.providers) {
            if (provider.requiresApiKey) {
                const key = await this.getApiKey(provider.id);
                if (key) {
                    apiKeys[provider.id] = key;
                }
            }
        }

        return {
            serverUrl: config.get('serverUrl', 'http://localhost:8000'),
            mode: config.get('aiMode', 'local'),
            preferredProvider: config.get('preferredProvider', 'ollama'),
            fallbackProvider: config.get('fallbackProvider'),
            selectedModel: config.get('selectedModel'),
            apiKeys
        };
    }

    /**
     * Update AI configuration
     */
    async updateConfiguration(newConfig: Partial<AIConfiguration>): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');

        if (newConfig.serverUrl !== undefined) {
            await config.update('serverUrl', newConfig.serverUrl, vscode.ConfigurationTarget.Global);
        }

        if (newConfig.mode !== undefined) {
            await config.update('aiMode', newConfig.mode, vscode.ConfigurationTarget.Global);
        }

        if (newConfig.preferredProvider !== undefined) {
            await config.update('preferredProvider', newConfig.preferredProvider, vscode.ConfigurationTarget.Global);
        }

        if (newConfig.fallbackProvider !== undefined) {
            await config.update('fallbackProvider', newConfig.fallbackProvider, vscode.ConfigurationTarget.Global);
        }

        if (newConfig.selectedModel !== undefined) {
            await config.update('selectedModel', newConfig.selectedModel, vscode.ConfigurationTarget.Global);
        }

        // Update API keys in secure storage
        if (newConfig.apiKeys) {
            for (const [provider, key] of Object.entries(newConfig.apiKeys)) {
                await this.setApiKey(provider, key);
            }
        }

        this.logger.info('Configuration updated successfully');
    }

    /**
     * Securely store API key
     */
    async setApiKey(provider: string, apiKey: string): Promise<void> {
        const key = `aiCodingAssistant.apiKey.${provider}`;
        await this.secretStorage.store(key, apiKey);
        this.logger.info(`API key stored securely for provider: ${provider}`);
    }

    /**
     * Retrieve API key from secure storage
     */
    async getApiKey(provider: string): Promise<string | undefined> {
        const key = `aiCodingAssistant.apiKey.${provider}`;
        return await this.secretStorage.get(key);
    }

    /**
     * Remove API key from secure storage
     */
    async removeApiKey(provider: string): Promise<void> {
        const key = `aiCodingAssistant.apiKey.${provider}`;
        await this.secretStorage.delete(key);
        this.logger.info(`API key removed for provider: ${provider}`);
    }

    /**
     * Check if provider has valid API key
     */
    async hasValidApiKey(provider: string): Promise<boolean> {
        const providerInfo = this.providers.find(p => p.id === provider);
        if (!providerInfo?.requiresApiKey) {
            return true; // Local providers don't need API keys
        }

        const apiKey = await this.getApiKey(provider);
        return !!apiKey && apiKey.length > 0;
    }

    /**
     * Get recommended model for a provider
     */
    getRecommendedModel(providerId: string): AIModel | undefined {
        const provider = this.providers.find(p => p.id === providerId);
        return provider?.models.find(m => m.recommended) || provider?.models[0];
    }

    /**
     * Validate configuration
     */
    async validateConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
        const config = await this.getCurrentConfiguration();
        const issues: string[] = [];

        // Check if preferred provider is available
        const preferredProvider = this.providers.find(p => p.id === config.preferredProvider);
        if (!preferredProvider) {
            issues.push(`Preferred provider '${config.preferredProvider}' not found`);
        } else if (preferredProvider.requiresApiKey) {
            const hasKey = await this.hasValidApiKey(preferredProvider.id);
            if (!hasKey) {
                issues.push(`API key required for ${preferredProvider.name}`);
            }
        }

        // Check fallback provider if specified
        if (config.fallbackProvider) {
            const fallbackProvider = this.providers.find(p => p.id === config.fallbackProvider);
            if (!fallbackProvider) {
                issues.push(`Fallback provider '${config.fallbackProvider}' not found`);
            } else if (fallbackProvider.requiresApiKey) {
                const hasKey = await this.hasValidApiKey(fallbackProvider.id);
                if (!hasKey) {
                    issues.push(`API key required for fallback provider ${fallbackProvider.name}`);
                }
            }
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Get configuration summary for display
     */
    async getConfigurationSummary(): Promise<string> {
        const config = await this.getCurrentConfiguration();
        const preferredProvider = this.providers.find(p => p.id === config.preferredProvider);
        
        let summary = `Mode: ${config.mode}\n`;
        summary += `Provider: ${preferredProvider?.name || config.preferredProvider}\n`;
        
        if (config.selectedModel) {
            summary += `Model: ${config.selectedModel}\n`;
        }
        
        if (config.fallbackProvider) {
            const fallbackProvider = this.providers.find(p => p.id === config.fallbackProvider);
            summary += `Fallback: ${fallbackProvider?.name || config.fallbackProvider}\n`;
        }

        // Show API key status
        const onlineProviders = this.providers.filter(p => p.requiresApiKey);
        const configuredKeys = [];
        for (const provider of onlineProviders) {
            const hasKey = await this.hasValidApiKey(provider.id);
            if (hasKey) {
                configuredKeys.push(provider.name);
            }
        }
        
        if (configuredKeys.length > 0) {
            summary += `API Keys: ${configuredKeys.join(', ')}\n`;
        }

        return summary;
    }
}
