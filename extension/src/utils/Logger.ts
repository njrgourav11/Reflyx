/**
 * Logger utility for AI Coding Assistant
 * Provides structured logging with different levels
 */

import * as vscode from 'vscode';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

export class Logger {
    private outputChannel: vscode.OutputChannel;
    private logLevel: LogLevel;

    constructor(private name: string) {
        this.outputChannel = vscode.window.createOutputChannel(`AI Coding Assistant - ${name}`);
        this.logLevel = this.getConfiguredLogLevel();
        
        // Update log level when configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('aiCodingAssistant.logLevel')) {
                this.logLevel = this.getConfiguredLogLevel();
            }
        });
    }

    private getConfiguredLogLevel(): LogLevel {
        const config = vscode.workspace.getConfiguration('aiCodingAssistant');
        const level = config.get<string>('logLevel', 'info').toLowerCase();
        
        switch (level) {
            case 'error': return LogLevel.ERROR;
            case 'warn': return LogLevel.WARN;
            case 'info': return LogLevel.INFO;
            case 'debug': return LogLevel.DEBUG;
            default: return LogLevel.INFO;
        }
    }

    private log(level: LogLevel, message: string, ...args: any[]) {
        if (level <= this.logLevel) {
            const timestamp = new Date().toISOString();
            const levelName = LogLevel[level];
            const formattedMessage = `[${timestamp}] [${levelName}] [${this.name}] ${message}`;
            
            if (args.length > 0) {
                this.outputChannel.appendLine(`${formattedMessage} ${JSON.stringify(args)}`);
            } else {
                this.outputChannel.appendLine(formattedMessage);
            }
        }
    }

    public error(message: string, ...args: any[]) {
        this.log(LogLevel.ERROR, message, ...args);
    }

    public warn(message: string, ...args: any[]) {
        this.log(LogLevel.WARN, message, ...args);
    }

    public info(message: string, ...args: any[]) {
        this.log(LogLevel.INFO, message, ...args);
    }

    public debug(message: string, ...args: any[]) {
        this.log(LogLevel.DEBUG, message, ...args);
    }

    public show() {
        this.outputChannel.show();
    }

    public dispose() {
        this.outputChannel.dispose();
    }
}
