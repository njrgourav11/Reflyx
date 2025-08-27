/**
 * Chat Provider for AI Coding Assistant
 * Handles webview-based chat interface
 */

import * as vscode from 'vscode';
import { ApiClient } from '../services/ApiClient';
import { StateManager } from '../services/StateManager';
import { Logger } from '../utils/Logger';

export class ChatProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiCodingAssistant.chatView';
    
    private view?: vscode.WebviewView;
    private logger: Logger;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly apiClient: ApiClient,
        private readonly stateManager: StateManager
    ) {
        this.logger = new Logger('ChatProvider');
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

        webviewView.webview.onDidReceiveMessage(
            async (data) => {
                await this.handleMessage(data);
            },
            undefined,
            this.context.subscriptions
        );
    }

    private async handleMessage(data: any) {
        try {
            switch (data.type) {
                case 'query':
                    await this.handleQuery(data.query);
                    break;
                case 'explain':
                    await this.handleExplainCode(data.code, data.language, data.filePath);
                    break;
                case 'generate':
                    await this.handleGenerateCode(data.prompt, data.language);
                    break;
                default:
                    this.logger.warn(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            this.logger.error('Error handling message:', error);
            this.sendMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    public async handleQuery(query: string) {
        try {
            this.sendMessage({ type: 'thinking', message: 'Searching codebase...' });
            
            const response = await this.apiClient.query({
                query,
                max_results: 10
            });

            this.sendMessage({
                type: 'response',
                message: response.response,
                results: response.results
            });
        } catch (error) {
            this.logger.error('Error handling query:', error);
            this.sendMessage({
                type: 'error',
                message: 'Failed to process query'
            });
        }
    }

    public async handleExplainCode(code: string, language: string, filePath?: string) {
        try {
            this.sendMessage({ type: 'thinking', message: 'Analyzing code...' });
            
            const response = await this.apiClient.explainCode({
                code,
                language,
                file_path: filePath
            });

            this.sendMessage({
                type: 'response',
                message: response.explanation
            });
        } catch (error) {
            this.logger.error('Error explaining code:', error);
            this.sendMessage({
                type: 'error',
                message: 'Failed to explain code'
            });
        }
    }

    public async handleGenerateCode(prompt: string, language: string) {
        try {
            this.sendMessage({ type: 'thinking', message: 'Generating code...' });
            
            const response = await this.apiClient.generateCode({
                prompt,
                language
            });

            this.sendMessage({
                type: 'code',
                code: response.generated_code,
                language
            });
        } catch (error) {
            this.logger.error('Error generating code:', error);
            this.sendMessage({
                type: 'error',
                message: 'Failed to generate code'
            });
        }
    }

    public async handleFindSimilar(code: string, language: string) {
        try {
            this.sendMessage({ type: 'thinking', message: 'Finding similar code...' });
            
            const response = await this.apiClient.query({
                query: `Find similar code patterns: ${code}`,
                max_results: 5
            });

            this.sendMessage({
                type: 'response',
                message: 'Similar code patterns found:',
                results: response.results
            });
        } catch (error) {
            this.logger.error('Error finding similar code:', error);
            this.sendMessage({
                type: 'error',
                message: 'Failed to find similar code'
            });
        }
    }

    public async handleRefactorSuggestion(code: string, language: string, filePath?: string) {
        try {
            this.sendMessage({ type: 'thinking', message: 'Analyzing for refactoring...' });
            
            const response = await this.apiClient.explainCode({
                code: `Please suggest refactoring improvements for this ${language} code:\n\n${code}`,
                language,
                file_path: filePath
            });

            this.sendMessage({
                type: 'response',
                message: response.explanation
            });
        } catch (error) {
            this.logger.error('Error getting refactor suggestions:', error);
            this.sendMessage({
                type: 'error',
                message: 'Failed to get refactoring suggestions'
            });
        }
    }

    private sendMessage(message: any) {
        if (this.view) {
            this.view.webview.postMessage(message);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reflyx</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 10px;
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px 0;
        }
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 4px;
        }
        .user-message {
            background-color: var(--vscode-input-background);
            border-left: 3px solid var(--vscode-focusBorder);
        }
        .assistant-message {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
        }
        .thinking {
            font-style: italic;
            color: var(--vscode-descriptionForeground);
        }
        .input-container {
            display: flex;
            gap: 8px;
            padding: 10px 0;
            border-top: 1px solid var(--vscode-panel-border);
        }
        .input-field {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        .send-button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="message assistant-message">
                <strong>Reflyx:</strong> Hello! I’m your coding copilot. Ask about your codebase, request explanations, or generate code.
            </div>
        </div>
        <div class="input-container">
            <input type="text" id="queryInput" class="input-field" placeholder="Ask about your code..." />
            <button id="sendButton" class="send-button">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const queryInput = document.getElementById('queryInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user-message' : 'assistant-message'}\`;
            messageDiv.innerHTML = \`<strong>\${isUser ? 'You' : 'Reflyx'}:</strong> \${content}\`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function sendQuery() {
            const query = queryInput.value.trim();
            if (query) {
                addMessage(query, true);
                vscode.postMessage({ type: 'query', query });
                queryInput.value = '';
            }
        }

        sendButton.addEventListener('click', sendQuery);
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendQuery();
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'thinking':
                    addMessage(\`<span class="thinking">\${message.message}</span>\`);
                    break;
                case 'response':
                    addMessage(message.message);
                    if (message.results && message.results.length > 0) {
                        const resultsHtml = message.results.map(result => 
                            \`<div style="margin: 5px 0; padding: 5px; background: var(--vscode-textCodeBlock-background);">
                                <strong>\${result.file_path}</strong><br>
                                <pre>\${result.content}</pre>
                            </div>\`
                        ).join('');
                        addMessage(resultsHtml);
                    }
                    break;
                case 'code':
                    addMessage(\`<pre><code>\${message.code}</code></pre>\`);
                    break;
                case 'error':
                    addMessage(\`<span style="color: var(--vscode-errorForeground);">Error: \${message.message}</span>\`);
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
