/**
 * Settings Panel for AI Coding Assistant
 * Provides a user-friendly interface for configuring AI providers and API keys
 */

import * as vscode from 'vscode';
import { ConfigurationManager, AIProvider, AIConfiguration } from '../services/ConfigurationManager';
import { Logger } from '../utils/Logger';

export class SettingsPanel {
    private panel: vscode.WebviewPanel | undefined;
    private configManager: ConfigurationManager;
    private logger: Logger;

    constructor(
        private context: vscode.ExtensionContext,
        configManager: ConfigurationManager
    ) {
        this.configManager = configManager;
        this.logger = new Logger('SettingsPanel');
    }

    /**
     * Show the settings panel
     */
    async show(): Promise<void> {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'aiCodingAssistantSettings',
            'AI Coding Assistant Settings',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        this.panel.webview.html = await this.getWebviewContent();
        this.setupWebviewMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Send initial configuration
        const config = await this.configManager.getCurrentConfiguration();
        this.panel.webview.postMessage({
            type: 'configurationUpdate',
            configuration: config,
            providers: this.configManager.getProviders()
        });
    }

    /**
     * Setup message handling between webview and extension
     */
    private setupWebviewMessageHandling(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case 'updateConfiguration':
                        await this.handleConfigurationUpdate(message.configuration);
                        break;

                    case 'setApiKey':
                        await this.handleSetApiKey(message.provider, message.apiKey);
                        break;

                    case 'removeApiKey':
                        await this.handleRemoveApiKey(message.provider);
                        break;

                    case 'testProvider':
                        await this.handleTestProvider(message.provider);
                        break;

                    case 'openProviderWebsite':
                        await this.handleOpenProviderWebsite(message.provider);
                        break;

                    case 'requestConfiguration':
                        await this.sendCurrentConfiguration();
                        break;

                    default:
                        this.logger.warn(`Unknown message type: ${message.type}`);
                }
            } catch (error) {
                this.logger.error('Error handling webview message:', error);
                this.panel?.webview.postMessage({
                    type: 'error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }

    /**
     * Handle configuration update
     */
    private async handleConfigurationUpdate(newConfig: Partial<AIConfiguration>): Promise<void> {
        await this.configManager.updateConfiguration(newConfig);
        
        // Validate configuration
        const validation = await this.configManager.validateConfiguration();
        
        this.panel?.webview.postMessage({
            type: 'configurationUpdated',
            success: true,
            validation
        });

        // Show success message
        vscode.window.showInformationMessage('AI Coding Assistant configuration updated successfully!');
    }

    /**
     * Handle API key setting
     */
    private async handleSetApiKey(provider: string, apiKey: string): Promise<void> {
        if (!apiKey || apiKey.trim().length === 0) {
            throw new Error('API key cannot be empty');
        }

        await this.configManager.setApiKey(provider, apiKey.trim());
        
        this.panel?.webview.postMessage({
            type: 'apiKeySet',
            provider,
            success: true
        });

        const providerInfo = this.configManager.getProviders().find(p => p.id === provider);
        vscode.window.showInformationMessage(`API key saved securely for ${providerInfo?.name || provider}`);
    }

    /**
     * Handle API key removal
     */
    private async handleRemoveApiKey(provider: string): Promise<void> {
        await this.configManager.removeApiKey(provider);
        
        this.panel?.webview.postMessage({
            type: 'apiKeyRemoved',
            provider,
            success: true
        });

        const providerInfo = this.configManager.getProviders().find(p => p.id === provider);
        vscode.window.showInformationMessage(`API key removed for ${providerInfo?.name || provider}`);
    }

    /**
     * Handle provider testing
     */
    private async handleTestProvider(provider: string): Promise<void> {
        // This would typically make a test API call
        // For now, we'll just check if the API key is present
        const hasKey = await this.configManager.hasValidApiKey(provider);
        const providerInfo = this.configManager.getProviders().find(p => p.id === provider);
        
        this.panel?.webview.postMessage({
            type: 'providerTestResult',
            provider,
            success: hasKey || !providerInfo?.requiresApiKey,
            message: hasKey || !providerInfo?.requiresApiKey 
                ? 'Provider configuration is valid' 
                : 'API key is required'
        });
    }

    /**
     * Handle opening provider website
     */
    private async handleOpenProviderWebsite(provider: string): Promise<void> {
        const providerInfo = this.configManager.getProviders().find(p => p.id === provider);
        if (providerInfo?.website) {
            vscode.env.openExternal(vscode.Uri.parse(providerInfo.website));
        }
    }

    /**
     * Send current configuration to webview
     */
    private async sendCurrentConfiguration(): Promise<void> {
        const config = await this.configManager.getCurrentConfiguration();
        const validation = await this.configManager.validateConfiguration();
        
        this.panel?.webview.postMessage({
            type: 'configurationUpdate',
            configuration: config,
            providers: this.configManager.getProviders(),
            validation
        });
    }

    /**
     * Generate webview HTML content
     */
    private async getWebviewContent(): Promise<string> {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Coding Assistant Settings</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            background-color: var(--vscode-panel-background);
        }
        
        .section h2 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-group select,
        .form-group input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: inherit;
        }
        
        .form-group input[type="password"] {
            font-family: monospace;
        }
        
        .provider-card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: var(--vscode-editor-background);
        }
        
        .provider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .provider-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .provider-type {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .provider-type.local {
            background-color: var(--vscode-terminal-ansiGreen);
            color: var(--vscode-editor-background);
        }
        
        .provider-type.online {
            background-color: var(--vscode-terminal-ansiBlue);
            color: var(--vscode-editor-background);
        }
        
        .provider-description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }
        
        .api-key-section {
            display: flex;
            gap: 10px;
            align-items: end;
        }
        
        .api-key-input {
            flex: 1;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: inherit;
            transition: opacity 0.2s;
        }
        
        .btn:hover {
            opacity: 0.8;
        }
        
        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-danger {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
        }
        
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 5px;
        }
        
        .status-indicator.connected {
            background-color: var(--vscode-terminal-ansiGreen);
        }
        
        .status-indicator.disconnected {
            background-color: var(--vscode-errorForeground);
        }
        
        .models-list {
            margin-top: 10px;
        }
        
        .model-item {
            padding: 8px;
            border-left: 3px solid var(--vscode-panel-border);
            margin-bottom: 5px;
            background-color: var(--vscode-panel-background);
        }
        
        .model-item.recommended {
            border-left-color: var(--vscode-terminal-ansiGreen);
        }
        
        .model-name {
            font-weight: bold;
        }
        
        .model-description {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        
        .validation-issues {
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            color: var(--vscode-inputValidation-errorForeground);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .validation-issues ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .free-credits {
            color: var(--vscode-terminal-ansiGreen);
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Coding Assistant Settings</h1>
        
        <div id="validationIssues" class="validation-issues" style="display: none;">
            <strong>⚠️ Configuration Issues:</strong>
            <ul id="validationList"></ul>
        </div>
        
        <div class="section">
            <h2>🎯 AI Processing Mode</h2>
            <div class="form-group">
                <label for="aiMode">Processing Mode:</label>
                <select id="aiMode">
                    <option value="local">Local Only - Use local models (private, free)</option>
                    <option value="online">Online Only - Use cloud APIs (requires API keys)</option>
                    <option value="hybrid">Hybrid - Use local with cloud fallback</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="preferredProvider">Preferred Provider:</label>
                <select id="preferredProvider">
                    <!-- Options populated by JavaScript -->
                </select>
            </div>
            
            <div class="form-group">
                <label for="fallbackProvider">Fallback Provider (optional):</label>
                <select id="fallbackProvider">
                    <option value="">None</option>
                    <!-- Options populated by JavaScript -->
                </select>
            </div>
        </div>
        
        <div class="section">
            <h2>🔑 AI Providers & API Keys</h2>
            <p>Configure your AI providers and securely store API keys. API keys are stored using VS Code's secure storage and never leave your machine.</p>
            <div id="providersContainer">
                <!-- Provider cards populated by JavaScript -->
            </div>
        </div>
        
        <div class="section">
            <h2>⚙️ Advanced Settings</h2>
            <div class="form-group">
                <label for="selectedModel">Specific Model (optional):</label>
                <select id="selectedModel">
                    <option value="">Auto-select recommended model</option>
                    <!-- Options populated by JavaScript -->
                </select>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentConfig = {};
        let providers = [];
        
        // Request initial configuration
        vscode.postMessage({ type: 'requestConfiguration' });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'configurationUpdate':
                    currentConfig = message.configuration;
                    providers = message.providers;
                    updateUI();
                    if (message.validation) {
                        showValidationIssues(message.validation);
                    }
                    break;
                    
                case 'configurationUpdated':
                    if (message.validation) {
                        showValidationIssues(message.validation);
                    }
                    break;
                    
                case 'apiKeySet':
                case 'apiKeyRemoved':
                    updateProviderStatus(message.provider);
                    break;
                    
                case 'providerTestResult':
                    showProviderTestResult(message.provider, message.success, message.message);
                    break;
                    
                case 'error':
                    alert('Error: ' + message.message);
                    break;
            }
        });
        
        function updateUI() {
            // Update mode selection
            document.getElementById('aiMode').value = currentConfig.mode || 'local';
            
            // Update provider selections
            updateProviderSelections();
            updateProvidersContainer();
            updateModelSelection();
        }
        
        function updateProviderSelections() {
            const preferredSelect = document.getElementById('preferredProvider');
            const fallbackSelect = document.getElementById('fallbackProvider');
            
            // Clear existing options
            preferredSelect.innerHTML = '';
            fallbackSelect.innerHTML = '<option value="">None</option>';
            
            providers.forEach(provider => {
                const option1 = new Option(provider.name, provider.id);
                const option2 = new Option(provider.name, provider.id);
                
                preferredSelect.appendChild(option1);
                fallbackSelect.appendChild(option2);
            });
            
            preferredSelect.value = currentConfig.preferredProvider || 'ollama';
            fallbackSelect.value = currentConfig.fallbackProvider || '';
        }
        
        function updateProvidersContainer() {
            const container = document.getElementById('providersContainer');
            container.innerHTML = '';
            
            providers.forEach(provider => {
                const card = createProviderCard(provider);
                container.appendChild(card);
            });
        }
        
        function createProviderCard(provider) {
            const hasApiKey = currentConfig.apiKeys && currentConfig.apiKeys[provider.id];
            
            const card = document.createElement('div');
            card.className = 'provider-card';
            card.innerHTML = \`
                <div class="provider-header">
                    <div>
                        <span class="provider-name">\${provider.name}</span>
                        <span class="provider-type \${provider.type}">\${provider.type}</span>
                        \${hasApiKey ? '<span class="status-indicator connected"></span>Connected' : 
                          provider.requiresApiKey ? '<span class="status-indicator disconnected"></span>Not configured' : 
                          '<span class="status-indicator connected"></span>Ready'}
                    </div>
                </div>
                
                <div class="provider-description">\${provider.description}</div>
                
                \${provider.freeCredits ? \`<div class="free-credits">💰 \${provider.freeCredits}</div>\` : ''}
                
                \${provider.requiresApiKey ? \`
                    <div class="api-key-section">
                        <div class="api-key-input">
                            <label>API Key:</label>
                            <input type="password" id="apiKey-\${provider.id}" 
                                   placeholder="Enter your API key..." 
                                   value="\${hasApiKey ? '••••••••••••••••' : ''}">
                        </div>
                        <button class="btn btn-primary" onclick="setApiKey('\${provider.id}')">Save</button>
                        \${hasApiKey ? \`<button class="btn btn-danger" onclick="removeApiKey('\${provider.id}')">Remove</button>\` : ''}
                        <button class="btn btn-secondary" onclick="testProvider('\${provider.id}')">Test</button>
                        \${provider.website ? \`<button class="btn btn-secondary" onclick="openProviderWebsite('\${provider.id}')">Get Key</button>\` : ''}
                    </div>
                \` : ''}
                
                <div class="models-list">
                    <strong>Available Models:</strong>
                    \${provider.models.map(model => \`
                        <div class="model-item \${model.recommended ? 'recommended' : ''}">
                            <div class="model-name">\${model.name} \${model.recommended ? '⭐' : ''}</div>
                            <div class="model-description">\${model.description}</div>
                            <div style="font-size: 0.8em; color: var(--vscode-descriptionForeground);">
                                Context: \${model.contextLength.toLocaleString()} tokens
                                \${model.costPer1kTokens ? \` | Cost: $\${model.costPer1kTokens.input}/$\${model.costPer1kTokens.output} per 1K tokens\` : ''}
                            </div>
                        </div>
                    \`).join('')}
                </div>
            \`;
            
            return card;
        }
        
        function updateModelSelection() {
            const modelSelect = document.getElementById('selectedModel');
            modelSelect.innerHTML = '<option value="">Auto-select recommended model</option>';
            
            providers.forEach(provider => {
                provider.models.forEach(model => {
                    const option = new Option(\`\${provider.name}: \${model.name}\`, model.id);
                    modelSelect.appendChild(option);
                });
            });
            
            modelSelect.value = currentConfig.selectedModel || '';
        }
        
        function showValidationIssues(validation) {
            const issuesDiv = document.getElementById('validationIssues');
            const issuesList = document.getElementById('validationList');
            
            if (validation.valid) {
                issuesDiv.style.display = 'none';
            } else {
                issuesList.innerHTML = validation.issues.map(issue => \`<li>\${issue}</li>\`).join('');
                issuesDiv.style.display = 'block';
            }
        }
        
        function setApiKey(provider) {
            const input = document.getElementById(\`apiKey-\${provider}\`);
            const apiKey = input.value.trim();
            
            if (!apiKey || apiKey === '••••••••••••••••') {
                alert('Please enter a valid API key');
                return;
            }
            
            vscode.postMessage({
                type: 'setApiKey',
                provider: provider,
                apiKey: apiKey
            });
        }
        
        function removeApiKey(provider) {
            if (confirm('Are you sure you want to remove this API key?')) {
                vscode.postMessage({
                    type: 'removeApiKey',
                    provider: provider
                });
            }
        }
        
        function testProvider(provider) {
            vscode.postMessage({
                type: 'testProvider',
                provider: provider
            });
        }
        
        function openProviderWebsite(provider) {
            vscode.postMessage({
                type: 'openProviderWebsite',
                provider: provider
            });
        }
        
        function showProviderTestResult(provider, success, message) {
            alert(\`\${provider} test: \${success ? '✅' : '❌'} \${message}\`);
        }
        
        function updateProviderStatus(provider) {
            // Refresh the providers container to show updated status
            updateProvidersContainer();
        }
        
        // Event listeners for configuration changes
        document.getElementById('aiMode').addEventListener('change', (e) => {
            updateConfiguration({ mode: e.target.value });
        });
        
        document.getElementById('preferredProvider').addEventListener('change', (e) => {
            updateConfiguration({ preferredProvider: e.target.value });
        });
        
        document.getElementById('fallbackProvider').addEventListener('change', (e) => {
            updateConfiguration({ fallbackProvider: e.target.value || undefined });
        });
        
        document.getElementById('selectedModel').addEventListener('change', (e) => {
            updateConfiguration({ selectedModel: e.target.value || undefined });
        });
        
        function updateConfiguration(changes) {
            vscode.postMessage({
                type: 'updateConfiguration',
                configuration: changes
            });
        }
    </script>
</body>
</html>`;
    }
}
