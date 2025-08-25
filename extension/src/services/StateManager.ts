/**
 * State Manager for AI Coding Assistant
 * Manages extension state, workspace state, and persistent storage
 */

import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';

export interface WorkspaceState {
    indexedFiles: string[];
    lastIndexTime: number;
    indexingProgress: {
        current: number;
        total: number;
        status: 'idle' | 'indexing' | 'complete' | 'error';
    };
    chatSessions: any[];
    recentQueries: string[];
    userPreferences: {
        preferredExplanationLevel: 'basic' | 'detailed' | 'expert';
        autoIndex: boolean;
        showInlineHelp: boolean;
    };
}

export interface GlobalState {
    extensionVersion: string;
    firstRun: boolean;
    telemetryEnabled: boolean;
    lastUpdateCheck: number;
    providerUsageStats: {
        [provider: string]: {
            requestCount: number;
            totalTokens: number;
            lastUsed: number;
        };
    };
}

export class StateManager {
    private logger: Logger;
    private context: vscode.ExtensionContext;
    private workspaceState: vscode.Memento;
    private globalState: vscode.Memento;

    constructor(context: vscode.ExtensionContext) {
        this.logger = new Logger('StateManager');
        this.context = context;
        this.workspaceState = context.workspaceState;
        this.globalState = context.globalState;
        
        this.initializeState();
    }

    private async initializeState(): Promise<void> {
        try {
            // Initialize global state if first run
            const isFirstRun = await this.getGlobalState('firstRun', true);
            if (isFirstRun) {
                await this.initializeFirstRun();
            }

            // Initialize workspace state
            await this.initializeWorkspaceState();

            this.logger.info('✅ State manager initialized');

        } catch (error) {
            this.logger.error('Failed to initialize state manager:', error);
        }
    }

    private async initializeFirstRun(): Promise<void> {
        const initialGlobalState: Partial<GlobalState> = {
            extensionVersion: this.context.extension.packageJSON.version,
            firstRun: false,
            telemetryEnabled: true,
            lastUpdateCheck: Date.now(),
            providerUsageStats: {}
        };

        for (const [key, value] of Object.entries(initialGlobalState)) {
            await this.setGlobalState(key, value);
        }

        this.logger.info('First run initialization completed');
    }

    private async initializeWorkspaceState(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const defaultWorkspaceState: Partial<WorkspaceState> = {
            indexedFiles: [],
            lastIndexTime: 0,
            indexingProgress: {
                current: 0,
                total: 0,
                status: 'idle'
            },
            chatSessions: [],
            recentQueries: [],
            userPreferences: {
                preferredExplanationLevel: 'detailed',
                autoIndex: true,
                showInlineHelp: true
            }
        };

        // Only set defaults if not already present
        for (const [key, value] of Object.entries(defaultWorkspaceState)) {
            const existing = await this.getWorkspaceState(key, {});
            if (existing === undefined) {
                await this.setWorkspaceState(key, value);
            }
        }
    }

    // Global State Methods
    async getGlobalState<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        try {
            return this.globalState.get(key, defaultValue);
        } catch (error) {
            this.logger.error(`Error getting global state for key ${key}:`, error);
            return defaultValue;
        }
    }

    async setGlobalState<T>(key: string, value: T): Promise<void> {
        try {
            await this.globalState.update(key, value);
            this.logger.debug(`Global state updated: ${key}`);
        } catch (error) {
            this.logger.error(`Error setting global state for key ${key}:`, error);
            throw error;
        }
    }

    // Workspace State Methods
    async getWorkspaceState<T>(key: string, defaultValue: T): Promise<T> {
        try {
            const value = this.workspaceState.get(key, defaultValue);
            return value ?? defaultValue;
        } catch (error) {
            this.logger.error(`Error getting workspace state for key ${key}:`, error);
            return defaultValue;
        }
    }

    async setWorkspaceState<T>(key: string, value: T): Promise<void> {
        try {
            await this.workspaceState.update(key, value);
            this.logger.debug(`Workspace state updated: ${key}`);
        } catch (error) {
            this.logger.error(`Error setting workspace state for key ${key}:`, error);
            throw error;
        }
    }

    // Indexing State Management
    async getIndexingProgress(): Promise<WorkspaceState['indexingProgress']> {
        return await this.getWorkspaceState('indexingProgress', {
            current: 0,
            total: 0,
            status: 'idle'
        });
    }

    async updateIndexingProgress(progress: Partial<WorkspaceState['indexingProgress']>): Promise<void> {
        const current = await this.getIndexingProgress();
        const updated = { ...current, ...progress };
        await this.setWorkspaceState('indexingProgress', updated);
        
        // Emit progress event
        this.emitIndexingProgressUpdate(updated);
    }

    async setIndexedFiles(files: string[]): Promise<void> {
        await this.setWorkspaceState('indexedFiles', files);
        await this.setWorkspaceState('lastIndexTime', Date.now());
    }

    async getIndexedFiles(): Promise<string[]> {
        return await this.getWorkspaceState('indexedFiles', []);
    }

    async getLastIndexTime(): Promise<number> {
        return await this.getWorkspaceState('lastIndexTime', 0);
    }

    async setLastIndexTime(timestamp: number): Promise<void> {
        await this.setWorkspaceState('lastIndexTime', timestamp);
    }

    // Chat Session Management
    async getChatSessions(): Promise<any[]> {
        return await this.getWorkspaceState('chatSessions', []);
    }

    async saveChatSessions(sessions: any[]): Promise<void> {
        await this.setWorkspaceState('chatSessions', sessions);
    }

    // Recent Queries Management
    async addRecentQuery(query: string): Promise<void> {
        const recent = await this.getWorkspaceState('recentQueries', []) as string[];
        
        // Remove if already exists
        const filtered = recent.filter(q => q !== query);
        
        // Add to beginning
        filtered.unshift(query);
        
        // Keep only last 20
        const updated = filtered.slice(0, 20);
        
        await this.setWorkspaceState('recentQueries', updated);
    }

    async getRecentQueries(): Promise<string[]> {
        return await this.getWorkspaceState('recentQueries', []);
    }

    // User Preferences
    async getUserPreferences(): Promise<WorkspaceState['userPreferences']> {
        return await this.getWorkspaceState('userPreferences', {
            preferredExplanationLevel: 'detailed',
            autoIndex: true,
            showInlineHelp: true
        });
    }

    async updateUserPreferences(preferences: Partial<WorkspaceState['userPreferences']>): Promise<void> {
        const current = await this.getUserPreferences();
        const updated = { ...current, ...preferences };
        await this.setWorkspaceState('userPreferences', updated);
    }

    // Provider Usage Statistics
    async recordProviderUsage(provider: string, tokens: number = 0): Promise<void> {
        const stats = await this.getGlobalState('providerUsageStats', {}) as GlobalState['providerUsageStats'];
        
        if (!stats[provider]) {
            stats[provider] = {
                requestCount: 0,
                totalTokens: 0,
                lastUsed: 0
            };
        }
        
        stats[provider].requestCount++;
        stats[provider].totalTokens += tokens;
        stats[provider].lastUsed = Date.now();
        
        await this.setGlobalState('providerUsageStats', stats);
    }

    async getProviderUsageStats(): Promise<GlobalState['providerUsageStats']> {
        return await this.getGlobalState('providerUsageStats', {}) as { [provider: string]: { requestCount: number; totalTokens: number; lastUsed: number; } };
    }

    // Extension Version Management
    async checkForVersionUpdate(): Promise<boolean> {
        const currentVersion = this.context.extension.packageJSON.version;
        const storedVersion = await this.getGlobalState('extensionVersion', '0.0.0');
        
        if (currentVersion !== storedVersion) {
            await this.setGlobalState('extensionVersion', currentVersion);
            return true;
        }
        
        return false;
    }

    // Telemetry Management
    async isTelemetryEnabled(): Promise<boolean> {
        return await this.getGlobalState('telemetryEnabled', true) as boolean;
    }

    async setTelemetryEnabled(enabled: boolean): Promise<void> {
        await this.setGlobalState('telemetryEnabled', enabled);
    }

    // Workspace Information
    getWorkspaceInfo(): {
        hasWorkspace: boolean;
        workspaceName?: string;
        workspacePath?: string;
        fileCount?: number;
    } {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        if (!workspaceFolder) {
            return { hasWorkspace: false };
        }
        
        return {
            hasWorkspace: true,
            workspaceName: workspaceFolder.name,
            workspacePath: workspaceFolder.uri.fsPath,
            fileCount: vscode.workspace.textDocuments.length
        };
    }

    // Event Emitters
    private readonly onIndexingProgressUpdateEmitter = new vscode.EventEmitter<WorkspaceState['indexingProgress']>();
    public readonly onIndexingProgressUpdate = this.onIndexingProgressUpdateEmitter.event;

    private emitIndexingProgressUpdate(progress: WorkspaceState['indexingProgress']): void {
        this.onIndexingProgressUpdateEmitter.fire(progress);
    }

    // Cleanup and Export
    async exportState(): Promise<{ workspace: any; global: any }> {
        const workspaceKeys = this.workspaceState.keys();
        const globalKeys = this.globalState.keys();
        
        const workspaceData: any = {};
        const globalData: any = {};
        
        for (const key of workspaceKeys) {
            workspaceData[key] = await this.getWorkspaceState(key, null);
        }
        
        for (const key of globalKeys) {
            globalData[key] = await this.getGlobalState(key);
        }
        
        return { workspace: workspaceData, global: globalData };
    }

    async clearWorkspaceState(): Promise<void> {
        const keys = this.workspaceState.keys();
        for (const key of keys) {
            await this.workspaceState.update(key, undefined);
        }
        this.logger.info('Workspace state cleared');
    }

    async clearGlobalState(): Promise<void> {
        const keys = this.globalState.keys();
        for (const key of keys) {
            await this.globalState.update(key, undefined);
        }
        this.logger.info('Global state cleared');
    }

    dispose(): void {
        this.onIndexingProgressUpdateEmitter.dispose();
        this.logger.info('StateManager disposed');
    }
}
