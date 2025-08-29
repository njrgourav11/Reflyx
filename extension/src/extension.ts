/**
 * AI Coding Assistant VS Code Extension
 * Main extension entry point and command registration.
 */

import * as vscode from 'vscode';
import { ApiClient } from './services/ApiClient';
import { StateManager } from './services/StateManager';
import { IndexingService } from './services/IndexingService';
import { ConfigurationManager } from './services/ConfigurationManager';
import { ChatProvider } from './providers/ChatProvider';
import { HoverProvider } from './providers/HoverProvider';
import { CompletionProvider } from './providers/CompletionProvider';
import { CodeLensProvider } from './providers/CodeLensProvider';
import { StatusBar } from './ui/StatusBar';
import { SettingsPanel } from './ui/SettingsPanel';
import { Logger } from './utils/Logger';

let logger: Logger;
let apiClient: ApiClient;
let stateManager: StateManager;
let indexingService: IndexingService;
let configurationManager: ConfigurationManager;
let chatProvider: ChatProvider;
let statusBar: StatusBar;
let settingsPanel: SettingsPanel;

export async function activate(context: vscode.ExtensionContext) {
    try {
        // Initialize core services
        logger = new Logger('Reflyx');
        logger.info('🚀 Activating Reflyx extension...');

        // Initialize configuration manager
        configurationManager = new ConfigurationManager(context);

        // Initialize state manager
        stateManager = new StateManager(context);

        // Get current configuration
        const currentConfig = await configurationManager.getCurrentConfiguration();

        // Initialize API client with current server URL
        const configuredUrl = vscode.workspace.getConfiguration('aiCodingAssistant').get<string>('serverUrl');
        const serverUrl = configuredUrl && configuredUrl.trim().length > 0 ? configuredUrl : 'https://reflyx-backend.vercel.app';
        apiClient = new ApiClient(serverUrl);

        // Initialize indexing service
        indexingService = new IndexingService(apiClient, stateManager);

        // Initialize UI components
        statusBar = new StatusBar();
        statusBar.show();

        // Initialize settings panel
        settingsPanel = new SettingsPanel(context, configurationManager);

        // Initialize providers
        chatProvider = new ChatProvider(context, apiClient, stateManager);
        const hoverProvider = new HoverProvider(apiClient);
        const completionProvider = new CompletionProvider(apiClient);
        const codeLensProvider = new CodeLensProvider(apiClient);

        // Register providers
        const showInlineExplanations = vscode.workspace.getConfiguration('aiCodingAssistant').get('showInlineExplanations', true);
        if (showInlineExplanations) {
            context.subscriptions.push(
                vscode.languages.registerHoverProvider(
                    { scheme: 'file' },
                    hoverProvider
                )
            );
        }

        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { scheme: 'file' },
                completionProvider,
                '/', '.'
            )
        );

        const enableCodeLens = vscode.workspace.getConfiguration('aiCodingAssistant').get('enableCodeLens', true);
        if (enableCodeLens) {
            context.subscriptions.push(
                vscode.languages.registerCodeLensProvider(
                    { scheme: 'file' },
                    codeLensProvider
                )
            );
        }

        // Register commands
        registerCommands(context);

        // Register chat view
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                'aiCodingAssistant.chatView',
                chatProvider,
                {
                    webviewOptions: {
                        retainContextWhenHidden: true
                    }
                }
            )
        );

        // Update health indicator on focus
        context.subscriptions.push(
            vscode.window.onDidChangeWindowState(async () => {
                try {
                    const ok = await apiClient.healthCheck();
                    chatProvider?.setHealth(!!ok);
                } catch {}
            })
        );

        // Set context for when extension is enabled
        vscode.commands.executeCommand('setContext', 'aiCodingAssistant.enabled', true);

        // Auto-show chat in Activity Bar container on first activation
        try {
            await vscode.commands.executeCommand('workbench.view.extension.aiCodingAssistantContainer');
            // If not indexed yet, the welcome view will show the Index button
            await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');
        } catch {}

        // Check server health
        await checkServerHealth();

        // Auto-index workspace if enabled
        const autoIndex = vscode.workspace.getConfiguration('aiCodingAssistant').get('autoIndex', true);
        if (autoIndex && vscode.workspace.workspaceFolders) {
            setTimeout(() => {
                vscode.commands.executeCommand('aiCodingAssistant.indexWorkspace');
            }, 2000);
        }

	        // Initialize indexed context key based on recent index time
	        try {
	            const lastIndex = await stateManager.getLastIndexTime();
	            const indexed = !!lastIndex && lastIndex > 0;
	            await vscode.commands.executeCommand('setContext', 'aiCodingAssistant.indexed', indexed);
	        } catch {}


        // Update status bar with current AI mode
        await updateStatusBarWithMode();

        logger.info('✅ Reflyx extension activated successfully');

    } catch (error) {
        logger.error('❌ Failed to activate extension:', error);
        vscode.window.showErrorMessage(
            `Failed to activate AI Coding Assistant: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

export function deactivate() {
    logger?.info('🔄 Deactivating Reflyx extension...');

    // Cleanup resources
    statusBar?.dispose();
    apiClient?.dispose();
    indexingService?.dispose();

    logger?.info('✅ AI Coding Assistant extension deactivated');
}

function registerCommands(context: vscode.ExtensionContext) {
    // Ask Codebase command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.askCodebase', async () => {
            try {
                const query = await vscode.window.showInputBox({
                    prompt: 'Ask a question about your codebase',
                    placeHolder: 'e.g., "Where is user authentication handled?"'
                });

                if (query) {
                    await chatProvider.handleQuery(query);
                    await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');
                }
            } catch (error) {
                logger.error('Error in askCodebase command:', error);
                vscode.window.showErrorMessage('Failed to process query');
            }
        })
    );

    // Explain Selection command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.explainSelection', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor || editor.selection.isEmpty) {
                    vscode.window.showWarningMessage('Please select some code to explain');
                    return;
                }

                const selectedText = editor.document.getText(editor.selection);
                const language = editor.document.languageId;
                const filePath = editor.document.uri.fsPath;

                await chatProvider.handleExplainCode(selectedText, language, filePath);
                await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');

            } catch (error) {
                logger.error('Error in explainSelection command:', error);
                vscode.window.showErrorMessage('Failed to explain code');
            }
        })
    );

    // Generate Code command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.generateCode', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showWarningMessage('Please open a file to generate code');
                    return;
                }

                const prompt = await vscode.window.showInputBox({
                    prompt: 'Describe the code you want to generate',
                    placeHolder: 'e.g., "Create a REST API endpoint for user login"'
                });

                if (prompt) {
                    const language = editor.document.languageId;
                    await chatProvider.handleGenerateCode(prompt, language);
                    await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');
                }

            } catch (error) {
                logger.error('Error in generateCode command:', error);
                vscode.window.showErrorMessage('Failed to generate code');
            }
        })
    );

    // Find Similar Code command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.findSimilar', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor || editor.selection.isEmpty) {
                    vscode.window.showWarningMessage('Please select some code to find similar patterns');
                    return;
                }

                const selectedText = editor.document.getText(editor.selection);
                const language = editor.document.languageId;

                await chatProvider.handleFindSimilar(selectedText, language);
                await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');

            } catch (error) {
                logger.error('Error in findSimilar command:', error);
                vscode.window.showErrorMessage('Failed to find similar code');
            }
        })
    );

    // Refactor Suggestion command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.refactorSuggestion', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor || editor.selection.isEmpty) {
                    vscode.window.showWarningMessage('Please select some code to get refactoring suggestions');
                    return;
                }

                const selectedText = editor.document.getText(editor.selection);
                const language = editor.document.languageId;
                const filePath = editor.document.uri.fsPath;

                await chatProvider.handleRefactorSuggestion(selectedText, language, filePath);
                await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');

            } catch (error) {
                logger.error('Error in refactorSuggestion command:', error);
                vscode.window.showErrorMessage('Failed to get refactoring suggestions');
            }
        })
    );

    // Index Workspace command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.indexWorkspace', async () => {
            try {
                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showWarningMessage('Please open a workspace to index');
                    return;
                }

                const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                await indexingService.indexWorkspace(workspacePath);

            } catch (error) {
                logger.error('Error in indexWorkspace command:', error);
                vscode.window.showErrorMessage('Failed to index workspace');
            }
        })
    );

    // Toggle Chat command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.toggleChat', async () => {
            try {
                await vscode.commands.executeCommand('workbench.view.extension.aiCodingAssistantContainer');
                await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');
            } catch (error) {
                logger.error('Error in toggleChat command:', error);
            }
        })
    );

    // Open Settings command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.openSettings', async () => {
            try {
                await settingsPanel.show();
            } catch (error) {
                logger.error('Error in openSettings command:', error);
                vscode.window.showErrorMessage('Failed to open settings panel');
            }
        })
    );

    // React to configuration changes (e.g., server URL)
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('aiCodingAssistant.serverUrl')) {
                const configuredUrl = vscode.workspace.getConfiguration('aiCodingAssistant').get<string>('serverUrl');
                const serverUrl = configuredUrl && configuredUrl.trim().length > 0 ? configuredUrl : 'https://reflyx-backend.vercel.app';
                apiClient.setBaseUrl(serverUrl);
                await checkServerHealth();
                await updateIndexedContext();
            }
        })
    );

    // Switch AI Mode command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.switchMode', async () => {
            try {
                const currentConfig = await configurationManager.getCurrentConfiguration();
                const modes = [
                    { label: '🏠 Local Mode', description: 'Use local models (private, free)', value: 'local' },
                    { label: '☁️ Online Mode', description: 'Use cloud APIs (requires API keys)', value: 'online' },
                    { label: '🔄 Hybrid Mode', description: 'Local with cloud fallback', value: 'hybrid' }
                ];

                const selected = await vscode.window.showQuickPick(modes, {
                    placeHolder: `Current mode: ${currentConfig.mode}. Select new mode:`,
                    ignoreFocusOut: true
                });

                if (selected && selected.value !== currentConfig.mode) {
                    await configurationManager.updateConfiguration({ mode: selected.value as any });
                    await updateStatusBarWithMode();
                    vscode.window.showInformationMessage(`AI mode switched to: ${selected.label}`);
                }
            } catch (error) {
                logger.error('Error in switchMode command:', error);
                vscode.window.showErrorMessage('Failed to switch AI mode');
            }
        })
    );

    // Select Provider command
    context.subscriptions.push(
        vscode.commands.registerCommand('aiCodingAssistant.selectProvider', async () => {
            try {
                const currentConfig = await configurationManager.getCurrentConfiguration();
                const providers = configurationManager.getProviders();

                const items = providers.map(provider => ({
                    label: `${provider.type === 'local' ? '🏠' : '☁️'} ${provider.name}`,
                    description: provider.description,
                    value: provider.id,
                    detail: provider.requiresApiKey ?
                        (currentConfig.apiKeys[provider.id] ? '✅ API key configured' : '⚠️ API key required') :
                        '✅ Ready to use'
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: `Current provider: ${currentConfig.preferredProvider}. Select new provider:`,
                    ignoreFocusOut: true
                });

                if (selected && selected.value !== currentConfig.preferredProvider) {
                    await configurationManager.updateConfiguration({ preferredProvider: selected.value });
                    await updateStatusBarWithMode();
                    vscode.window.showInformationMessage(`Provider switched to: ${selected.label}`);
                }
            } catch (error) {
                logger.error('Error in selectProvider command:', error);
                vscode.window.showErrorMessage('Failed to select provider');
            }
        })
    );
}

async function checkServerHealth() {
    try {
        statusBar.setStatus('Checking server...', 'loading');

        const isHealthy = await apiClient.healthCheck();

        if (isHealthy) {
            await updateStatusBarWithMode();
            try { chatProvider?.setHealth(true); } catch {}
            logger.info('✅ Backend server is healthy');
        } else {
            statusBar.setStatus('Server unavailable', 'error');
            logger.warn('⚠️ Backend server is not responding');

            vscode.window.showWarningMessage(
                'AI Coding Assistant backend server is not available. Please ensure the server is running.',
                'Open Settings', 'Configure'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'aiCodingAssistant');
                } else if (selection === 'Configure') {
                    vscode.commands.executeCommand('aiCodingAssistant.openSettings');
                }
            });
        }

    } catch (error) {
        statusBar.setStatus('Connection error', 'error');
        try { chatProvider?.setHealth(false); } catch {}
        logger.error('❌ Failed to check server health:', error);
    }
}


async function updateIndexedContext() {
    try {
        const lastIndex = await stateManager.getLastIndexTime();
        const indexed = !!lastIndex && lastIndex > 0;
        await vscode.commands.executeCommand('setContext', 'aiCodingAssistant.indexed', indexed);
    } catch {}
}

async function updateStatusBarWithMode() {
    try {
        const config = await configurationManager.getCurrentConfiguration();
        const provider = configurationManager.getProviders().find(p => p.id === config.preferredProvider);

        const modeIcon = config.mode === 'local' ? '🏠' : config.mode === 'online' ? '☁️' : '🔄';
        const providerName = provider?.name.split(' ')[0] || config.preferredProvider;

        statusBar.setStatus(`${modeIcon} ${providerName}`, 'ready');
        statusBar.setTooltip(`AI Mode: ${config.mode}\nProvider: ${provider?.name || config.preferredProvider}\nClick to configure`);

        // Make status bar clickable to open settings
        statusBar.setCommand('aiCodingAssistant.openSettings');

    } catch (error) {
        logger.error('Failed to update status bar:', error);
        statusBar.setStatus('Configuration error', 'error');
    }
}
