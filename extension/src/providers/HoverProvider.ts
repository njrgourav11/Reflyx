/**
 * Hover Provider for AI Coding Assistant
 * Provides code explanations on hover
 */

import * as vscode from 'vscode';
import { ApiClient } from '../services/ApiClient';
import { Logger } from '../utils/Logger';

export class HoverProvider implements vscode.HoverProvider {
    private logger: Logger;
    private cache: Map<string, vscode.Hover> = new Map();

    constructor(private apiClient: ApiClient) {
        this.logger = new Logger('HoverProvider');
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        try {
            // Get word at position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return undefined;
            }

            const word = document.getText(wordRange);
            if (word.length < 3) {
                return undefined;
            }

            // Create cache key
            const cacheKey = `${document.uri.fsPath}:${position.line}:${position.character}`;
            
            // Check cache
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Get surrounding context
            const startLine = Math.max(0, position.line - 5);
            const endLine = Math.min(document.lineCount - 1, position.line + 5);
            const contextRange = new vscode.Range(startLine, 0, endLine, document.lineAt(endLine).text.length);
            const context = document.getText(contextRange);

            // Request explanation
            const response = await this.apiClient.explainCode({
                code: context,
                language: document.languageId,
                file_path: document.uri.fsPath
            });

            const hover = new vscode.Hover(
                new vscode.MarkdownString(`**AI Explanation:**\n\n${response.explanation}`),
                wordRange
            );

            // Cache the result
            this.cache.set(cacheKey, hover);

            return hover;

        } catch (error) {
            this.logger.error('Error providing hover:', error);
            return undefined;
        }
    }
}
