/**
 * Provider Configuration Panel for AI Coding Assistant
 * Provides UI for managing AI provider settings and API keys
 */

import * as vscode from 'vscode';
import { SecureConfigManager, AIProvider, ProviderConfig } from '../services/SecureConfigManager';
import { Logger } from '../utils/Logger';

export class ProviderConfigPanel {
    public static currentPanel: ProviderConfigPanel | undefined;
    private static readonly viewType = 'aiCodingAssistant.providerConfig';

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly configManager: SecureConfigManager;
    private readonly logger: Logger;
    private disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, configManager: SecureConfigManager) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ProviderConfigPanel.currentPanel) {
            ProviderConfigPanel.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            ProviderConfigPanel.viewType,
            'AI Provider Configuration',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'media')
                ]
            }
        );

        ProviderConfigPanel.currentPanel = new ProviderConfigPanel(panel, extensionUri, configManager);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, configManager: SecureConfigManager) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.configManager = configManager;
        this.logger = new Logger('ProviderConfigPanel');

        // Set the webview's initial html content
        this.update();

        // Listen for when the panel is disposed
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                await this.handleMessage(message);
            },
            null,
            this.disposables
        );
    }

    private async handleMessage(message: any) {
        try {
            switch (message.type) {
                case 'getConfig':
                    await this.sendConfig();
                    break;

                case 'setApiKey':
                    await this.handleSetApiKey(message.providerId, message.apiKey);
                    break;

                case 'removeApiKey':
                    await this.handleRemoveApiKey(message.providerId);
                    break;

                case 'testApiKey':
                    await this.handleTestApiKey(message.providerId);
                    break;

                case 'updateProviderConfig':
                    await this.handleUpdateProviderConfig(message.providerId, message.config);
                    break;

                case 'updatePreferences':
                    await this.handleUpdatePreferences(message.preferences);
                    break;

                case 'exportConfig':
                    await this.handleExportConfig();
                    break;

                case 'clearAllData':
                    await this.handleClearAllData();
                    break;

                default:
                    this.logger.warn(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            this.logger.error('Error handling message:', error);
            this.panel.webview.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private async sendConfig() {
        const config = await this.configManager.getConfig();
        const providers = this.configManager.getProviders();
        const enabledProviders = await this.configManager.getEnabledProviders();

        // Check which providers have API keys
        const providerStatus: { [id: string]: { hasApiKey: boolean; enabled: boolean } } = {};
        
        for (const providerId of Object.keys(providers)) {
            const hasApiKey = providerId === 'ollama' || !!(await this.configManager.getApiKey(providerId));
            const enabled = enabledProviders.includes(providerId);
            
            providerStatus[providerId] = { hasApiKey, enabled };
        }

        this.panel.webview.postMessage({
            type: 'configData',
            config,
            providers,
            providerStatus
        });
    }

    private async handleSetApiKey(providerId: string, apiKey: string) {
        try {
            await this.configManager.setApiKey(providerId, apiKey);
            
            this.panel.webview.postMessage({
                type: 'success',
                message: `API key saved for ${this.configManager.getProvider(providerId)?.name}`
            });
            
            await this.sendConfig();
        } catch (error) {
            throw new Error(`Failed to save API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleRemoveApiKey(providerId: string) {
        await this.configManager.removeApiKey(providerId);
        
        this.panel.webview.postMessage({
            type: 'success',
            message: `API key removed for ${this.configManager.getProvider(providerId)?.name}`
        });
        
        await this.sendConfig();
    }

    private async handleTestApiKey(providerId: string) {
        this.panel.webview.postMessage({
            type: 'testingApiKey',
            providerId
        });

        const result = await this.configManager.testApiKey(providerId);
        
        this.panel.webview.postMessage({
            type: 'testResult',
            providerId,
            success: result.success,
            error: result.error
        });
    }

    private async handleUpdateProviderConfig(providerId: string, config: Partial<ProviderConfig>) {
        await this.configManager.setProviderConfig(providerId, config);
        
        this.panel.webview.postMessage({
            type: 'success',
            message: `Configuration updated for ${this.configManager.getProvider(providerId)?.name}`
        });
        
        await this.sendConfig();
    }

    private async handleUpdatePreferences(preferences: any) {
        await this.configManager.updatePreferences(preferences);
        
        this.panel.webview.postMessage({
            type: 'success',
            message: 'Preferences updated successfully'
        });
        
        await this.sendConfig();
    }

    private async handleExportConfig() {
        const config = await this.configManager.exportConfig();
        const configJson = JSON.stringify(config, null, 2);
        
        const doc = await vscode.workspace.openTextDocument({
            content: configJson,
            language: 'json'
        });
        
        await vscode.window.showTextDocument(doc);
        
        this.panel.webview.postMessage({
            type: 'success',
            message: 'Configuration exported to new document'
        });
    }

    private async handleClearAllData() {
        const result = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all configuration data? This will remove all API keys and reset settings.',
            { modal: true },
            'Yes, Clear All',
            'Cancel'
        );

        if (result === 'Yes, Clear All') {
            await this.configManager.clearAllData();
            
            this.panel.webview.postMessage({
                type: 'success',
                message: 'All configuration data cleared'
            });
            
            await this.sendConfig();
        }
    }

    private async update() {
        const webview = this.panel.webview;
        this.panel.webview.html = this.getHtmlForWebview(webview);
    }

    private getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'provider-config.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'provider-config.css'));

        // Use a nonce to only allow a specific script to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>AI Provider Configuration</title>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 AI Provider Configuration</h1>
            <p>Configure your AI providers and API keys for the AI Coding Assistant</p>
        </header>

        <div class="tabs">
            <button class="tab-button active" data-tab="providers">Providers</button>
            <button class="tab-button" data-tab="preferences">Preferences</button>
            <button class="tab-button" data-tab="usage">Usage Stats</button>
            <button class="tab-button" data-tab="advanced">Advanced</button>
        </div>

        <div id="providers-tab" class="tab-content active">
            <div class="section">
                <h2>🔑 API Key Management</h2>
                <p>Configure API keys for online AI providers. Local providers (Ollama) don't require API keys.</p>
                
                <div id="providers-list" class="providers-grid">
                    <!-- Providers will be populated by JavaScript -->
                </div>
            </div>
        </div>

        <div id="preferences-tab" class="tab-content">
            <div class="section">
                <h2>⚙️ General Preferences</h2>
                
                <div class="form-group">
                    <label for="ai-mode">AI Processing Mode:</label>
                    <select id="ai-mode">
                        <option value="local">Local Only (Privacy First)</option>
                        <option value="online">Online Only (Performance First)</option>
                        <option value="hybrid">Hybrid (Local with Cloud Fallback)</option>
                    </select>
                    <small>Choose how AI requests are processed</small>
                </div>

                <div class="form-group">
                    <label for="default-provider">Default Provider:</label>
                    <select id="default-provider">
                        <!-- Options populated by JavaScript -->
                    </select>
                    <small>Primary AI provider to use</small>
                </div>

                <div class="form-group">
                    <label for="fallback-provider">Fallback Provider:</label>
                    <select id="fallback-provider">
                        <option value="">None</option>
                        <!-- Options populated by JavaScript -->
                    </select>
                    <small>Provider to use if primary fails</small>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="auto-fallback">
                        <span class="checkmark"></span>
                        Enable automatic fallback
                    </label>
                    <small>Automatically switch to fallback provider on errors</small>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="streaming-enabled">
                        <span class="checkmark"></span>
                        Enable streaming responses
                    </label>
                    <small>Stream AI responses in real-time</small>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="telemetry-enabled">
                        <span class="checkmark"></span>
                        Enable telemetry
                    </label>
                    <small>Help improve the extension by sharing usage data</small>
                </div>

                <button id="save-preferences" class="btn btn-primary">Save Preferences</button>
            </div>
        </div>

        <div id="usage-tab" class="tab-content">
            <div class="section">
                <h2>📊 Usage Statistics</h2>
                <div id="usage-stats">
                    <!-- Usage stats will be populated by JavaScript -->
                </div>
            </div>
        </div>

        <div id="advanced-tab" class="tab-content">
            <div class="section">
                <h2>🔧 Advanced Options</h2>
                
                <div class="form-group">
                    <button id="export-config" class="btn btn-secondary">Export Configuration</button>
                    <small>Export your configuration (without API keys) to a JSON file</small>
                </div>

                <div class="form-group">
                    <button id="clear-all-data" class="btn btn-danger">Clear All Data</button>
                    <small>Remove all API keys and reset configuration</small>
                </div>
            </div>
        </div>

        <div id="status" class="status hidden"></div>
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
            <span>Processing...</span>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    public dispose() {
        ProviderConfigPanel.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
