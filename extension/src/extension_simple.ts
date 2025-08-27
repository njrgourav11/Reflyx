/**
 * Simplified AI Coding Assistant VS Code Extension
 * Minimal version with direct API calls for debugging
 */

import * as vscode from 'vscode';
import axios from 'axios';

const SERVER_URL = 'http://localhost:8000';

import { ChatViewProvider } from './chatView';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 AI Coding Assistant (Simple) is now active!');

    // Register Chat View (side panel)
    const provider = new ChatViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider)
    );

    // Expose context key so the Explorer view contribution becomes visible
    vscode.commands.executeCommand('setContext', 'aiCodingAssistant.enabled', true);

    // Test server connection on activation
    testServerConnection();

    // Ask Codebase command
    const askCodebaseCommand = vscode.commands.registerCommand('aiCodingAssistant.askCodebase', async () => {
        try {
            const query = await vscode.window.showInputBox({
                prompt: 'Ask a question about your codebase',
                placeHolder: 'e.g., How does authentication work?'
            });

            if (!query) return;

            vscode.window.showInformationMessage('🤖 Processing your query...');

            const response = await axios.post(`${SERVER_URL}/api/v1/query`, {
                query: query,
                max_results: 5
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const result = response.data;
                
                // Create and show result document
                const doc = await vscode.workspace.openTextDocument({
                    content: `# AI Coding Assistant Response\n\n## Query: ${query}\n\n${result.response}\n\n## Code Results:\n${JSON.stringify(result.results, null, 2)}`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage('✅ Query completed successfully!');
            } else {
                vscode.window.showErrorMessage(`❌ Server error: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Ask Codebase error:', error);
            vscode.window.showErrorMessage(`❌ Failed to process query: ${error.message}`);
        }
    });

    // Explain Selection command
    const explainSelectionCommand = vscode.commands.registerCommand('aiCodingAssistant.explainSelection', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.selection.isEmpty) {
                vscode.window.showWarningMessage('⚠️ Please select some code to explain');
                return;
            }

            const selectedText = editor.document.getText(editor.selection);
            const language = editor.document.languageId;

            vscode.window.showInformationMessage('🤖 Explaining selected code...');

            const response = await axios.post(`${SERVER_URL}/api/v1/explain`, {
                code: selectedText,
                language: language
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const result = response.data;
                
                // Create and show explanation document
                const doc = await vscode.workspace.openTextDocument({
                    content: `# Code Explanation\n\n## Selected Code (${language}):\n\`\`\`${language}\n${selectedText}\n\`\`\`\n\n## Explanation:\n\n${result.explanation}`,
                    language: 'markdown'
                });
                
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage('✅ Code explanation completed!');
            } else {
                vscode.window.showErrorMessage(`❌ Server error: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Explain Selection error:', error);
            vscode.window.showErrorMessage(`❌ Failed to explain code: ${error.message}`);
        }
    });

    // Generate Code command
    const generateCodeCommand = vscode.commands.registerCommand('aiCodingAssistant.generateCode', async () => {
        try {
            const prompt = await vscode.window.showInputBox({
                prompt: 'Describe the code you want to generate',
                placeHolder: 'e.g., Create a REST API endpoint for user authentication'
            });

            if (!prompt) return;

            const language = await vscode.window.showQuickPick([
                'python', 'javascript', 'typescript', 'java', 'csharp', 'cpp', 'go', 'rust', 'php'
            ], {
                placeHolder: 'Select target programming language'
            });

            if (!language) return;

            vscode.window.showInformationMessage('🤖 Generating code...');

            const response = await axios.post(`${SERVER_URL}/api/v1/generate`, {
                prompt: prompt,
                language: language,
                style: 'production',
                max_length: 500
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const result = response.data;
                
                // Create and show generated code document
                const doc = await vscode.workspace.openTextDocument({
                    content: result.generated_code,
                    language: language
                });
                
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage('✅ Code generation completed!');
            } else {
                vscode.window.showErrorMessage(`❌ Server error: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Generate Code error:', error);
            vscode.window.showErrorMessage(`❌ Failed to generate code: ${error.message}`);
        }
    });

    // Index File command
    const indexFileCommand = vscode.commands.registerCommand('aiCodingAssistant.indexWorkspace', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('⚠️ Please open a file to index');
                return;
            }

            const filePath = editor.document.fileName;
            const content = editor.document.getText();
            const language = editor.document.languageId;

            vscode.window.showInformationMessage('🤖 Indexing file...');

            const response = await axios.post(`${SERVER_URL}/api/v1/index`, {
                file_path: filePath,
                content: content,
                language: language
            }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const result = response.data;
                vscode.window.showInformationMessage(`✅ File indexed successfully! Size: ${result.size} bytes, Chunks: ${result.chunks}`);
            } else {
                vscode.window.showErrorMessage(`❌ Server error: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Index File error:', error);
            vscode.window.showErrorMessage(`❌ Failed to index file: ${error.message}`);
        }
    });

    // Health Check command
    const healthCheckCommand = vscode.commands.registerCommand('aiCodingAssistant.healthCheck', async () => {
        try {
            vscode.window.showInformationMessage('🔍 Checking server health...');

            const response = await axios.get(`${SERVER_URL}/health`, {
                timeout: 10000
            });

            if (response.status === 200) {
                const result = response.data;
                vscode.window.showInformationMessage(`✅ Server is healthy! Status: ${result.status}, Version: ${result.version}`);
            } else {
                vscode.window.showErrorMessage(`❌ Server unhealthy: ${response.status}`);
            }

        } catch (error: any) {
            console.error('Health Check error:', error);
            vscode.window.showErrorMessage(`❌ Server connection failed: ${error.message}`);
        }
    });

    // Find Similar Code command
    const findSimilarCommand = vscode.commands.registerCommand('aiCodingAssistant.findSimilar', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.selection.isEmpty) {
                vscode.window.showWarningMessage('⚠️ Please select some code to find similar patterns');
                return;
            }

            const selectedText = editor.document.getText(editor.selection);
            const language = editor.document.languageId;

            vscode.window.showInformationMessage('🔍 Finding similar code patterns...');

            // Mock similar code search for now
            const doc = await vscode.workspace.openTextDocument({
                content: `# Similar Code Patterns\n\n## Selected Code (${language}):\n\`\`\`${language}\n${selectedText}\n\`\`\`\n\n## Similar Patterns Found:\n\n### Pattern 1 (92% similarity)\n\`\`\`${language}\n// Similar implementation found in utils.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}\n${selectedText.replace(/\w+/g, 'similar_$&')}\n\`\`\`\n\n### Pattern 2 (78% similarity)\n\`\`\`${language}\n// Related pattern in components/\nfunction relatedFunction() {\n    // Similar logic structure\n    return processData();\n}\n\`\`\`\n\n**Note**: This is a mock response. Configure AI providers for real similarity search.`,
                language: 'markdown'
            });

            await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('✅ Similar code patterns found!');

        } catch (error: any) {
            console.error('Find Similar error:', error);
            vscode.window.showErrorMessage(`❌ Failed to find similar code: ${error.message}`);
        }
    });

    // Refactor Suggestion command
    const refactorSuggestionCommand = vscode.commands.registerCommand('aiCodingAssistant.refactorSuggestion', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.selection.isEmpty) {
                vscode.window.showWarningMessage('⚠️ Please select some code to get refactoring suggestions');
                return;
            }

            const selectedText = editor.document.getText(editor.selection);
            const language = editor.document.languageId;

            vscode.window.showInformationMessage('💡 Generating refactoring suggestions...');

            // Mock refactoring suggestions
            const doc = await vscode.workspace.openTextDocument({
                content: `# Refactoring Suggestions\n\n## Original Code (${language}):\n\`\`\`${language}\n${selectedText}\n\`\`\`\n\n## Suggested Improvements:\n\n### 1. Extract Method (Confidence: 85%)\n\`\`\`${language}\n// Extract repeated logic into a separate method\nfunction extractedMethod() {\n    // Extracted logic here\n    return processedResult;\n}\n\`\`\`\n\n### 2. Improve Variable Names (Confidence: 75%)\n\`\`\`${language}\n// Use more descriptive variable names\nconst descriptiveVariableName = processData();\n\`\`\`\n\n### 3. Add Error Handling (Confidence: 90%)\n\`\`\`${language}\ntry {\n    ${selectedText.split('\n')[0] || '// Your code here'}\n} catch (error) {\n    console.error('Error:', error);\n    throw error;\n}\n\`\`\`\n\n**Note**: This is a mock response. Configure AI providers for real refactoring suggestions.`,
                language: 'markdown'
            });

            await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('✅ Refactoring suggestions generated!');

        } catch (error: any) {
            console.error('Refactor Suggestion error:', error);
            vscode.window.showErrorMessage(`❌ Failed to generate refactoring suggestions: ${error.message}`);
        }
    });

    // Toggle Chat command
    const toggleChatCommand = vscode.commands.registerCommand('aiCodingAssistant.toggleChat', async () => {
        await vscode.commands.executeCommand('setContext', 'aiCodingAssistant.enabled', true);
        await vscode.commands.executeCommand('workbench.view.extension.aiCodingAssistantContainer');
        await vscode.commands.executeCommand('aiCodingAssistant.chatView.focus');
    });

    // Open Settings command
    const openSettingsCommand = vscode.commands.registerCommand('aiCodingAssistant.openSettings', async () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'aiCodingAssistant');
    });

    // Switch Mode command
    const switchModeCommand = vscode.commands.registerCommand('aiCodingAssistant.switchMode', async () => {
        const modes = ['local', 'online', 'hybrid'];
        const selectedMode = await vscode.window.showQuickPick(modes, {
            placeHolder: 'Select AI processing mode'
        });

        if (selectedMode) {
            await vscode.workspace.getConfiguration('aiCodingAssistant').update('aiMode', selectedMode, true);
            vscode.window.showInformationMessage(`✅ AI mode switched to: ${selectedMode}`);
        }
    });

    // Select Provider command
    const selectProviderCommand = vscode.commands.registerCommand('aiCodingAssistant.selectProvider', async () => {
        const providers = ['ollama', 'openai', 'anthropic', 'google', 'groq', 'together'];
        const selectedProvider = await vscode.window.showQuickPick(providers, {
            placeHolder: 'Select AI provider'
        });

        if (selectedProvider) {
            await vscode.workspace.getConfiguration('aiCodingAssistant').update('preferredProvider', selectedProvider, true);
            vscode.window.showInformationMessage(`✅ AI provider set to: ${selectedProvider}`);
        }
    });

    // Register all commands
    context.subscriptions.push(
        askCodebaseCommand,
        explainSelectionCommand,
        generateCodeCommand,
        indexFileCommand,
        healthCheckCommand,
        findSimilarCommand,
        refactorSuggestionCommand,
        toggleChatCommand,
        openSettingsCommand,
        switchModeCommand,
        selectProviderCommand
    );

    console.log('✅ All AI Coding Assistant commands registered successfully!');
}

async function testServerConnection() {
    try {
        const response = await axios.get(`${SERVER_URL}/health`, { timeout: 5000 });
        if (response.status === 200) {
            console.log('✅ Backend server connection successful');
            vscode.window.showInformationMessage('🤖 AI Coding Assistant connected to backend server!');
        }
    } catch (error) {
        console.error('❌ Backend server connection failed:', error);
        vscode.window.showWarningMessage('⚠️ AI Coding Assistant: Backend server not available. Please start the server.');
    }
}

export function deactivate() {
    console.log('🔄 AI Coding Assistant (Simple) deactivated');
}
