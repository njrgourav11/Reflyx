/**
 * CodeLens Provider for AI Coding Assistant
 * Provides inline AI action buttons
 */

import * as vscode from 'vscode';
import { ApiClient } from '../services/ApiClient';
import { Logger } from '../utils/Logger';

export class CodeLensProvider implements vscode.CodeLensProvider {
    private logger: Logger;

    constructor(private apiClient: ApiClient) {
        this.logger = new Logger('CodeLensProvider');
    }

    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];

        try {
            // Add CodeLens for functions
            const text = document.getText();
            const functionRegex = /(?:function|def|class|interface|type)\s+(\w+)/g;
            let match;

            while ((match = functionRegex.exec(text)) !== null) {
                const position = document.positionAt(match.index);
                const range = new vscode.Range(position, position);

                // Explain function
                const explainLens = new vscode.CodeLens(range, {
                    title: '$(info) Explain',
                    command: 'aiCodingAssistant.explainSelection',
                    arguments: []
                });

                // Refactor suggestion
                const refactorLens = new vscode.CodeLens(range, {
                    title: '$(lightbulb) Refactor',
                    command: 'aiCodingAssistant.refactorSuggestion',
                    arguments: []
                });

                codeLenses.push(explainLens, refactorLens);
            }

        } catch (error) {
            this.logger.error('Error providing code lenses:', error);
        }

        return codeLenses;
    }
}
