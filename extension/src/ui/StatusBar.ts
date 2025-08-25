/**
 * Enhanced Status Bar for AI Coding Assistant
 * Shows current AI mode, provider, and provides quick access to commands
 */

import * as vscode from 'vscode';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.text = "$(robot) AI Assistant";
        this.statusBarItem.tooltip = "AI Coding Assistant - Click to configure";
        this.statusBarItem.command = 'aiCodingAssistant.openSettings';
    }

    show(): void {
        this.statusBarItem.show();
    }

    hide(): void {
        this.statusBarItem.hide();
    }

    setStatus(text: string, status: 'ready' | 'loading' | 'error' | 'warning'): void {
        const icons = {
            ready: '$(check)',
            loading: '$(sync~spin)',
            error: '$(error)',
            warning: '$(warning)'
        };

        const colors = {
            ready: undefined,
            loading: new vscode.ThemeColor('statusBarItem.prominentBackground'),
            error: new vscode.ThemeColor('statusBarItem.errorBackground'),
            warning: new vscode.ThemeColor('statusBarItem.warningBackground')
        };

        this.statusBarItem.text = `${icons[status]} ${text}`;
        this.statusBarItem.backgroundColor = colors[status];
    }

    setTooltip(tooltip: string): void {
        this.statusBarItem.tooltip = tooltip;
    }

    setCommand(command: string): void {
        this.statusBarItem.command = command;
    }

    updateWithMode(mode: string, provider: string, isHealthy: boolean = true): void {
        const modeIcons = {
            local: '🏠',
            online: '☁️',
            hybrid: '🔄'
        };

        const statusIcon = isHealthy ? '$(check)' : '$(error)';
        const modeIcon = modeIcons[mode as keyof typeof modeIcons] || '🤖';
        
        this.statusBarItem.text = `${statusIcon} ${modeIcon} ${provider}`;
        this.statusBarItem.backgroundColor = isHealthy ? undefined : new vscode.ThemeColor('statusBarItem.errorBackground');
        
        const tooltip = [
            `AI Coding Assistant`,
            `Mode: ${mode}`,
            `Provider: ${provider}`,
            `Status: ${isHealthy ? 'Ready' : 'Error'}`,
            ``,
            `Click to configure settings`,
            `Ctrl+Shift+M to switch mode`,
            `Ctrl+Shift+C to open chat`
        ].join('\n');
        
        this.statusBarItem.tooltip = tooltip;
    }

    showIndexingProgress(current: number, total: number): void {
        const percentage = Math.round((current / total) * 100);
        this.statusBarItem.text = `$(sync~spin) Indexing... ${percentage}%`;
        this.statusBarItem.tooltip = `Indexing workspace: ${current}/${total} files processed`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    }

    showError(message: string): void {
        this.statusBarItem.text = `$(error) ${message}`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.tooltip = `Error: ${message}\nClick to open settings`;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
