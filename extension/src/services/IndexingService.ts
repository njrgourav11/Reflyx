/**
 * Indexing Service for AI Coding Assistant
 * Handles workspace indexing and file monitoring
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ApiClient } from './ApiClient';
import { StateManager } from './StateManager';
import { Logger } from '../utils/Logger';

export class IndexingService {
    private logger: Logger;
    private fileWatcher?: vscode.FileSystemWatcher;
    private isIndexing = false;

    constructor(
        private apiClient: ApiClient,
        private stateManager: StateManager
    ) {
        this.logger = new Logger('IndexingService');
        this.setupFileWatcher();
    }

    private setupFileWatcher() {
        // Watch for file changes
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        
        this.fileWatcher.onDidCreate(async (uri) => {
            await this.indexFile(uri.fsPath);
        });

        this.fileWatcher.onDidChange(async (uri) => {
            await this.indexFile(uri.fsPath);
        });

        this.fileWatcher.onDidDelete(async (uri) => {
            await this.removeFileFromIndex(uri.fsPath);
        });
    }

    async indexWorkspace(workspacePath: string): Promise<void> {
        if (this.isIndexing) {
            this.logger.warn('Indexing already in progress');
            return;
        }

        try {
            this.isIndexing = true;
            this.logger.info(`Starting workspace indexing: ${workspacePath}`);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Indexing workspace...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Scanning files...' });

                // Get all files to index
                const files = await this.getFilesToIndex(workspacePath);
                const totalFiles = files.length;

                this.logger.info(`Found ${totalFiles} files to index`);

                // Index files in batches
                const batchSize = 10;
                for (let i = 0; i < files.length; i += batchSize) {
                    const batch = files.slice(i, i + batchSize);
                    
                    progress.report({
                        increment: (batchSize / totalFiles) * 100,
                        message: `Indexing files ${i + 1}-${Math.min(i + batchSize, totalFiles)} of ${totalFiles}`
                    });

                    await Promise.all(batch.map(file => this.indexFile(file)));
                }

                progress.report({ increment: 100, message: 'Indexing complete!' });
            });

            // Update state
            await this.stateManager.setLastIndexTime(Date.now());
            
            this.logger.info('Workspace indexing completed successfully');
            vscode.window.showInformationMessage('Workspace indexing completed!');

        } catch (error) {
            this.logger.error('Error during workspace indexing:', error);
            vscode.window.showErrorMessage(`Indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            this.isIndexing = false;
        }
    }

    private async getFilesToIndex(workspacePath: string): Promise<string[]> {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');
        const ignorePatterns = config.get<string[]>('ignorePatterns', []);

        // Find all files
        const pattern = '**/*';
        const exclude = `{${ignorePatterns.join(',')}}`;
        
        const files = await vscode.workspace.findFiles(pattern, exclude);
        
        return files
            .map(uri => uri.fsPath)
            .filter(filePath => this.shouldIndexFile(filePath));
    }

    private shouldIndexFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        const supportedExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
            '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala',
            '.r', '.sql', '.html', '.css', '.json', '.yaml', '.yml', '.xml',
            '.md', '.txt', '.sh', '.bat', '.ps1'
        ];

        return supportedExtensions.includes(ext);
    }

    private async indexFile(filePath: string): Promise<void> {
        try {
            if (!this.shouldIndexFile(filePath)) {
                return;
            }

            this.logger.debug(`Indexing file: ${filePath}`);

            // Read file content
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();

            if (content.trim().length === 0) {
                return;
            }

            // Send to backend for indexing
            await this.apiClient.indexFile({
                file_path: filePath,
                content: content,
                language: document.languageId
            });

        } catch (error) {
            this.logger.error(`Error indexing file ${filePath}:`, error);
        }
    }

    private async removeFileFromIndex(filePath: string): Promise<void> {
        try {
            this.logger.debug(`Removing file from index: ${filePath}`);
            
            // Send removal request to backend
            await this.apiClient.removeFile({
                file_path: filePath
            });

        } catch (error) {
            this.logger.error(`Error removing file from index ${filePath}:`, error);
        }
    }

    public dispose(): void {
        this.fileWatcher?.dispose();
        this.logger.info('IndexingService disposed');
    }
}
