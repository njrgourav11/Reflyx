/**
 * Secure Configuration Manager for AI Coding Assistant
 * Manages API keys and sensitive configuration using VS Code SecretStorage
 */

import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';
import fetch from 'node-fetch';

export interface AIProvider {
    id: string;
    name: string;
    description: string;
    website: string;
    apiKeyFormat: string;
    freeCredits?: string;
    models: string[];
    maxTokens: number;
    supportsStreaming: boolean;
}

export interface ProviderConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    enabled: boolean;
    lastUsed?: number;
    requestCount?: number;
    errorCount?: number;
}

export interface SecureConfig {
    providers: { [providerId: string]: ProviderConfig };
    preferences: {
        defaultProvider: string;
        fallbackProvider?: string;
        aiMode: 'local' | 'online' | 'hybrid';
        autoFallback: boolean;
        streamingEnabled: boolean;
        telemetryEnabled: boolean;
    };
    lastUpdated: number;
}

export class SecureConfigManager {
    private static readonly CONFIG_KEY = 'aiCodingAssistant.config';
    private static readonly SECRET_PREFIX = 'aiCodingAssistant.apiKey.';
    
    private logger: Logger;
    private context: vscode.ExtensionContext;
    private config: SecureConfig;
    
    // Supported AI providers
    private readonly providers: { [id: string]: AIProvider } = {
        ollama: {
            id: 'ollama',
            name: 'Ollama (Local)',
            description: 'Local AI models with complete privacy',
            website: 'https://ollama.ai',
            apiKeyFormat: 'Not required (local)',
            freeCredits: 'Completely free',
            models: ['codellama:7b-code', 'codellama:13b-code', 'deepseek-coder:6.7b', 'qwen2.5-coder:7b'],
            maxTokens: 4096,
            supportsStreaming: true
        },
        openai: {
            id: 'openai',
            name: 'OpenAI',
            description: 'GPT-4o, GPT-4 Turbo, and GPT-3.5 models',
            website: 'https://platform.openai.com/api-keys',
            apiKeyFormat: 'sk-...',
            freeCredits: '$5 free credit for new accounts',
            models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            maxTokens: 128000,
            supportsStreaming: true
        },
        anthropic: {
            id: 'anthropic',
            name: 'Anthropic',
            description: 'Claude 3.5 Sonnet, Claude 3 Opus, and Claude 3 Haiku',
            website: 'https://console.anthropic.com/',
            apiKeyFormat: 'sk-ant-...',
            freeCredits: 'Limited free tier available',
            models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
            maxTokens: 200000,
            supportsStreaming: true
        },
        google: {
            id: 'google',
            name: 'Google AI',
            description: 'Gemini 1.5 Pro, Gemini 1.5 Flash models',
            website: 'https://makersuite.google.com/app/apikey',
            apiKeyFormat: 'Alphanumeric string',
            freeCredits: 'Generous free tier (15 requests/minute)',
            models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
            maxTokens: 1048576,
            supportsStreaming: true
        },
        groq: {
            id: 'groq',
            name: 'Groq',
            description: 'Ultra-fast inference with Llama and Mixtral models',
            website: 'https://console.groq.com/keys',
            apiKeyFormat: 'gsk_...',
            freeCredits: '14,400 requests per day free',
            models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
            maxTokens: 32768,
            supportsStreaming: true
        },
        together: {
            id: 'together',
            name: 'Together AI',
            description: 'Open-source models including Llama and CodeLlama',
            website: 'https://api.together.xyz/settings/api-keys',
            apiKeyFormat: 'Alphanumeric string',
            freeCredits: '$25 free credit for new accounts',
            models: ['meta-llama/Llama-3-70b-chat-hf', 'codellama/CodeLlama-34b-Instruct-hf'],
            maxTokens: 32768,
            supportsStreaming: true
        }
    };

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.logger = new Logger('SecureConfigManager');
        this.config = this.getDefaultConfig();
        
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.loadConfig();
            this.logger.info('✅ Secure configuration manager initialized');
        } catch (error) {
            this.logger.error('Failed to initialize secure config manager:', error);
            // Use default config on error
            this.config = this.getDefaultConfig();
        }
    }

    private getDefaultConfig(): SecureConfig {
        return {
            providers: {
                ollama: { enabled: true },
                openai: { enabled: false },
                anthropic: { enabled: false },
                google: { enabled: false },
                groq: { enabled: false },
                together: { enabled: false }
            },
            preferences: {
                defaultProvider: 'ollama',
                fallbackProvider: 'groq',
                aiMode: 'local',
                autoFallback: true,
                streamingEnabled: true,
                telemetryEnabled: true
            },
            lastUpdated: Date.now()
        };
    }

    public getProviders(): { [id: string]: AIProvider } {
        return { ...this.providers };
    }

    public getProvider(providerId: string): AIProvider | undefined {
        return this.providers[providerId];
    }

    public async getConfig(): Promise<SecureConfig> {
        return { ...this.config };
    }

    public async getProviderConfig(providerId: string): Promise<ProviderConfig | undefined> {
        return this.config.providers[providerId] ? { ...this.config.providers[providerId] } : undefined;
    }

    public async setProviderConfig(providerId: string, config: Partial<ProviderConfig>): Promise<void> {
        if (!this.providers[providerId]) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        this.config.providers[providerId] = {
            ...this.config.providers[providerId],
            ...config
        };

        this.config.lastUpdated = Date.now();
        await this.saveConfig();
        
        this.logger.info(`Provider config updated: ${providerId}`);
    }

    public async setApiKey(providerId: string, apiKey: string): Promise<void> {
        if (!this.providers[providerId]) {
            throw new Error(`Unknown provider: ${providerId}`);
        }

        // Validate API key format
        const provider = this.providers[providerId];
        if (providerId !== 'ollama' && !this.validateApiKeyFormat(providerId, apiKey)) {
            throw new Error(`Invalid API key format for ${provider.name}. Expected format: ${provider.apiKeyFormat}`);
        }

        // Store API key securely
        const secretKey = `${SecureConfigManager.SECRET_PREFIX}${providerId}`;
        await this.context.secrets.store(secretKey, apiKey);

        // Update provider config
        await this.setProviderConfig(providerId, { enabled: true });

        this.logger.info(`API key stored securely for provider: ${providerId}`);
    }

    public async getApiKey(providerId: string): Promise<string | undefined> {
        if (providerId === 'ollama') {
            return undefined; // Ollama doesn't need API key
        }

        const secretKey = `${SecureConfigManager.SECRET_PREFIX}${providerId}`;
        return await this.context.secrets.get(secretKey);
    }

    public async removeApiKey(providerId: string): Promise<void> {
        const secretKey = `${SecureConfigManager.SECRET_PREFIX}${providerId}`;
        await this.context.secrets.delete(secretKey);
        
        // Disable provider
        await this.setProviderConfig(providerId, { enabled: false });
        
        this.logger.info(`API key removed for provider: ${providerId}`);
    }

    public async testApiKey(providerId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const apiKey = await this.getApiKey(providerId);
            
            if (providerId === 'ollama') {
                // Test Ollama connection
                const response = await fetch('http://localhost:11434/api/tags');
                return { success: response.ok };
            }

            if (!apiKey) {
                return { success: false, error: 'No API key configured' };
            }

            // Test API key with a simple request
            const testResult = await this.makeTestRequest(providerId, apiKey);
            return testResult;

        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    private async makeTestRequest(providerId: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
        const provider = this.providers[providerId];
        
        try {
            switch (providerId) {
                case 'openai':
                    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                    return { success: openaiResponse.ok };

                case 'anthropic':
                    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'x-api-key': apiKey,
                            'Content-Type': 'application/json',
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-haiku-20240307',
                            max_tokens: 10,
                            messages: [{ role: 'user', content: 'test' }]
                        })
                    });
                    return { success: anthropicResponse.ok };

                case 'google':
                    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                    return { success: googleResponse.ok };

                case 'groq':
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/models', {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                    return { success: groqResponse.ok };

                case 'together':
                    const togetherResponse = await fetch('https://api.together.xyz/v1/models', {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                    return { success: togetherResponse.ok };

                default:
                    return { success: false, error: 'Unknown provider' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Network error' 
            };
        }
    }

    private validateApiKeyFormat(providerId: string, apiKey: string): boolean {
        switch (providerId) {
            case 'openai':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'anthropic':
                return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
            case 'groq':
                return apiKey.startsWith('gsk_') && apiKey.length > 20;
            case 'google':
            case 'together':
                return apiKey.length > 10 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
            default:
                return true;
        }
    }

    public async updatePreferences(preferences: Partial<SecureConfig['preferences']>): Promise<void> {
        this.config.preferences = {
            ...this.config.preferences,
            ...preferences
        };
        
        this.config.lastUpdated = Date.now();
        await this.saveConfig();
        
        this.logger.info('Preferences updated');
    }

    public async getEnabledProviders(): Promise<string[]> {
        const enabled: string[] = [];
        
        for (const [providerId, config] of Object.entries(this.config.providers)) {
            if (config.enabled) {
                // For non-local providers, check if API key exists
                if (providerId === 'ollama') {
                    enabled.push(providerId);
                } else {
                    const apiKey = await this.getApiKey(providerId);
                    if (apiKey) {
                        enabled.push(providerId);
                    }
                }
            }
        }
        
        return enabled;
    }

    public async getDefaultProvider(): Promise<string> {
        const enabledProviders = await this.getEnabledProviders();
        
        // Return configured default if enabled
        if (enabledProviders.includes(this.config.preferences.defaultProvider)) {
            return this.config.preferences.defaultProvider;
        }
        
        // Return first enabled provider
        if (enabledProviders.length > 0) {
            return enabledProviders[0];
        }
        
        // Fallback to ollama
        return 'ollama';
    }

    public async recordProviderUsage(providerId: string, success: boolean): Promise<void> {
        const config = this.config.providers[providerId];
        if (config) {
            config.requestCount = (config.requestCount || 0) + 1;
            config.lastUsed = Date.now();
            
            if (!success) {
                config.errorCount = (config.errorCount || 0) + 1;
            }
            
            await this.saveConfig();
        }
    }

    private async loadConfig(): Promise<void> {
        const stored = this.context.globalState.get<SecureConfig>(SecureConfigManager.CONFIG_KEY);
        
        if (stored) {
            // Merge with defaults to handle new properties
            this.config = {
                ...this.getDefaultConfig(),
                ...stored,
                providers: {
                    ...this.getDefaultConfig().providers,
                    ...stored.providers
                },
                preferences: {
                    ...this.getDefaultConfig().preferences,
                    ...stored.preferences
                }
            };
        }
    }

    private async saveConfig(): Promise<void> {
        await this.context.globalState.update(SecureConfigManager.CONFIG_KEY, this.config);
    }

    public async exportConfig(): Promise<any> {
        // Export config without sensitive data
        const exportData = {
            providers: Object.fromEntries(
                Object.entries(this.config.providers).map(([id, config]) => [
                    id,
                    {
                        enabled: config.enabled,
                        model: config.model,
                        maxTokens: config.maxTokens,
                        temperature: config.temperature,
                        requestCount: config.requestCount,
                        errorCount: config.errorCount,
                        lastUsed: config.lastUsed
                    }
                ])
            ),
            preferences: this.config.preferences,
            lastUpdated: this.config.lastUpdated
        };
        
        return exportData;
    }

    public async clearAllData(): Promise<void> {
        // Remove all API keys
        for (const providerId of Object.keys(this.providers)) {
            await this.removeApiKey(providerId);
        }
        
        // Reset config
        this.config = this.getDefaultConfig();
        await this.saveConfig();
        
        this.logger.info('All configuration data cleared');
    }

    public dispose(): void {
        // Cleanup if needed
        this.logger.info('SecureConfigManager disposed');
    }
}
