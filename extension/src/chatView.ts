/**
 * ChatViewProvider - renders the AI Assistant chat view in the Side Bar
 */

import * as vscode from 'vscode';
import axios from 'axios';

const SERVER_URL = 'http://localhost:8000';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiCodingAssistant.chatView';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'ready': {
          // no-op
          break;
        }
        case 'ask': {
          const query = String(message.text || '').trim();
          if (!query) {
            webviewView.webview.postMessage({ type: 'error', error: 'Please enter a question.' });
            return;
          }
          try {
            const res = await axios.post(
              `${SERVER_URL}/api/v1/query`,
              { query, max_results: 8 },
              { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
            );
            const data = res.data;
            webviewView.webview.postMessage({ type: 'answer', query, answer: data.response, results: data.results });
          } catch (err: any) {
            webviewView.webview.postMessage({ type: 'error', error: err?.message || 'Request failed' });
          }
          break;
        }
        case 'indexCurrent': {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            webviewView.webview.postMessage({ type: 'error', error: 'Open a file to index.' });
            return;
          }
          const filePath = editor.document.fileName;
          const content = editor.document.getText();
          const language = editor.document.languageId;
          try {
            const res = await axios.post(
              `${SERVER_URL}/api/v1/index`,
              { file_path: filePath, content, language },
              { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
            );
            webviewView.webview.postMessage({ type: 'indexed', info: res.data });
          } catch (err: any) {
            webviewView.webview.postMessage({ type: 'error', error: err?.message || 'Indexing failed' });
          }
          break;
        }
      }
    });
  }

  private getHtml(): string {
    const csp = `default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-sideBar-background); margin: 0; padding: 0; }
    .container { display: flex; flex-direction: column; height: 100vh; }
    .header { padding: 8px 12px; border-bottom: 1px solid var(--vscode-panelSection-border); font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff5252; display: inline-block; }
    .status-dot.healthy { background: #4caf50; }
    .messages { flex: 1; overflow-y: auto; padding: 12px; }
    .msg { border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; white-space: pre-wrap; }
    .me { background: var(--vscode-textBlockQuote-background); }
    .ai { background: var(--vscode-editor-inactiveSelectionBackground); }
    .footer { display: flex; gap: 6px; padding: 8px; border-top: 1px solid var(--vscode-panelSection-border); }
    input { flex: 1; padding: 6px 8px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; }
    button { padding: 6px 10px; }
  </style>
  <title>Reflyx</title>
</head>
<body>
  <div class="container">
    <div class="header"><span id="statusDot" class="status-dot"></span>Reflyx</div>
    <div id="messages" class="messages"></div>
    <div class="footer">
      <input id="prompt" type="text" placeholder="Ask about your codebase..." />
      <button id="askBtn">Ask</button>
      <button id="indexBtn" title="Index current file">Index</button>
    </div>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    const messagesEl = document.getElementById('messages');
    const promptEl = document.getElementById('prompt');
    const askBtn = document.getElementById('askBtn');
    const indexBtn = document.getElementById('indexBtn');

    function addMsg(text, cls) {
      const el = document.createElement('div');
      el.className = 'msg ' + cls;
      el.textContent = text;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    askBtn.addEventListener('click', () => {
      const text = promptEl.value.trim();
      if (!text) return;
      addMsg(text, 'me');
      vscode.postMessage({ type: 'ask', text });
    });

    indexBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'indexCurrent' });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'health') {
        const dot = document.getElementById('statusDot');
        if (dot) {
          dot.classList.toggle('healthy', !!msg.ok);
        }
      } else if (msg.type === 'answer') {
        addMsg(msg.answer, 'ai');
      } else if (msg.type === 'error') {
        addMsg('Error: ' + msg.error, 'ai');
      } else if (msg.type === 'indexed') {
        addMsg('Indexed: ' + (msg.info?.message || 'done'), 'ai');
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
  }
}

