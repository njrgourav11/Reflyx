export default function DocsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <header className="mb-12">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">Documentation</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Reflyx Documentation</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl">
          Dual‑mode AI (Local + Cloud), semantic search, intelligent generation, and contextual explanations — all inside VS Code.
        </p>
        <nav className="mt-6 flex flex-wrap gap-3 text-sm">
          <a className="toc-link" href="#overview">Overview</a>
          <a className="toc-link" href="#features">Features</a>
          <a className="toc-link" href="#providers">Providers</a>
          <a className="toc-link" href="#quickstart">Quick Start</a>
          <a className="toc-link" href="#usage">Usage</a>
          <a className="toc-link" href="#config">Config</a>
          <a className="toc-link" href="#troubleshooting">Troubleshooting</a>
          <a className="toc-link" href="#contributing">Contributing</a>
          <a className="toc-link" href="#license">License</a>
        </nav>
      </header>

      {/* Overview */}
      <section id="overview" className="grid lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2">
          <div className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="sparkles" className="h-5 w-5" /> Overview
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              A production‑ready Reflyx exceeding the capabilities of Augment Code, Cursor, and Windsurf — with local privacy,
              cloud performance, semantic search, intelligent code generation, and contextual explanations.
            </p>
          </div>
        </div>
        <div className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-800 p-6">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">At a glance</h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2"><Icon name="shield" className="mt-0.5 h-4 w-4" /> Privacy‑first, offline‑capable</li>
            <li className="flex items-start gap-2"><Icon name="bolt" className="mt-0.5 h-4 w-4" /> Semantic search + fast inference</li>
            <li className="flex items-start gap-2"><Icon name="cloud" className="mt-0.5 h-4 w-4" /> Local, Cloud, or Hybrid routing</li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="stars" className="h-5 w-5" /> Key Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon="cycle" title="Dual‑Mode Processing" desc="Seamlessly switch between Local (Ollama) and Cloud (GPT‑4o, Claude 3.5, Gemini, Groq)." />
          <FeatureCard icon="lock" title="Secure API Keys" desc="Keys stored via VS Code SecretStorage for safe usage." />
          <FeatureCard icon="gauge" title="Ultra‑Fast Inference" desc="Groq integration delivering 500+ tokens/sec for snappy responses." />
          <FeatureCard icon="route" title="Smart Routing" desc="Intelligently select and fallback between providers for reliability." />
          <FeatureCard icon="ui" title="Enhanced UI" desc="Context‑aware chat, inline suggestions, and streaming responses." />
          <FeatureCard icon="search" title="Semantic Search" desc="Index and search your workspace for relevant code instantly." />
        </div>
      </section>

      {/* Providers */}
      <section id="providers" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="stack" className="h-5 w-5" /> Supported Providers</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card">
            <div className="card-header">
              <Icon name="chip" className="h-5 w-5" /> Local (Free & Private)
            </div>
            <ul className="card-list">
              <li>Ollama: CodeLlama 7B/13B/34B, DeepSeek‑Coder 6.7B, Qwen2.5‑Coder 7B (16K‑32K context)</li>
            </ul>
          </div>
          <div className="card">
            <div className="card-header">
              <Icon name="cloud" className="h-5 w-5" /> Cloud (Optional APIs)
            </div>
            <ul className="card-list">
              <li>OpenAI GPT‑4o (128K)</li>
              <li>Anthropic Claude 3.5 Sonnet (200K)</li>
              <li>Google Gemini 1.5 Pro (2M)</li>
              <li>Groq LLaMA 3.1 70B (ultra‑fast)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="rocket" className="h-5 w-5" /> Quick Start</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StepCard n={1} title="Automated Setup" desc={
            <Code>
              {`git clone <repo-url>
cd ai-coding-assistant
python setup.py`}
            </Code>
          } />
          <StepCard n={2} title="Install VS Code Extension" desc={
            <Code>
              {`cd extension
npm install
npm run compile
npm run package`}
            </Code>
          } />
          <StepCard n={3} title="Configure Providers" desc="Choose Local, Cloud, or Hybrid inside VS Code settings." />
        </ol>
      </section>

      {/* Usage */}
      <section id="usage" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="keyboard" className="h-5 w-5" /> Usage</h2>
        <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2"><Icon name="terminal" className="h-4 w-4" /> Ctrl+Shift+P → Reflyx: Ask Codebase</li>
          <li className="flex items-center gap-2"><Icon name="terminal" className="h-4 w-4" /> Ctrl+Shift+P → Explain Selection</li>
          <li className="flex items-center gap-2"><Icon name="terminal" className="h-4 w-4" /> Ctrl+Shift+P → Generate Code</li>
          <li className="flex items-center gap-2"><Icon name="chat" className="h-4 w-4" /> Ctrl+Shift+C → Toggle Chat</li>
        </ul>
      </section>

      {/* Config */}
      <section id="config" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="cog" className="h-5 w-5" /> Configuration</h2>
        <Code>
          {`{
  "aiCodingAssistant.modelProvider": "ollama",
  "aiCodingAssistant.embeddingModel": "all-MiniLM-L6-v2",
  "aiCodingAssistant.maxChunkSize": 500,
  "aiCodingAssistant.retrievalCount": 10
}`}
        </Code>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="bug" className="h-5 w-5" /> Troubleshooting</h2>
        <ul className="mt-4 space-y-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2"><Icon name="warning" className="mt-0.5 h-4 w-4" /> Ollama not found: ensure it's running (<code>curl http://localhost:11434/api/tags</code>).</li>
          <li className="flex items-start gap-2"><Icon name="warning" className="mt-0.5 h-4 w-4" /> Qdrant error: check status (<code>curl http://localhost:6333/health</code>).</li>
          <li className="flex items-start gap-2"><Icon name="info" className="mt-0.5 h-4 w-4" /> Extension not loading: restart VS Code and check Developer Console.</li>
        </ul>
      </section>

      {/* Contributing */}
      <section id="contributing" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="heart" className="h-5 w-5" /> Contributing</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">PRs welcome — features, fixes, and documentation improvements.</p>
      </section>

      {/* License */}
      <section id="license" className="mt-14">
        <h2 className="section-title flex items-center gap-2"><Icon name="document" className="h-5 w-5" /> License</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">MIT — free for personal and commercial use.</p>
      </section>
    </main>
  );
}

/* --- Small presentational components --- */
function FeatureCard({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
        </div>
      </div>
    </article>
  );
}

function StepCard({ n, title, desc }: { n: number; title: string; desc: React.ReactNode }) {
  return (
    <li className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <div className="flex items-start gap-3">
        <span className="step-number">{n}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">{desc}</div>
        </div>
      </div>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-2 rounded-md bg-slate-900 text-slate-100 p-4 text-xs overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

/* --- Icons --- */
type IconName =
  | 'sparkles' | 'stars' | 'shield' | 'bolt' | 'cloud' | 'lock' | 'gauge' | 'route' | 'ui' | 'search' | 'stack' | 'chip' | 'rocket' | 'keyboard' | 'terminal' | 'chat' | 'cog' | 'bug' | 'warning' | 'info' | 'heart' | 'document' | 'cycle';

function Icon({ name, className }: { name: IconName; className?: string }) {
  const cls = `text-slate-700 dark:text-slate-200 ${className ?? ''}`;
  switch (name) {
    case 'sparkles':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" /><path d="M19 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" /></svg>);
    case 'stars':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>);
    case 'shield':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z" /></svg>);
    case 'bolt':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>);
    case 'cloud':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M19 18a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2A5 5 0 0 0 6 18h13z" /></svg>);
    case 'lock':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
    case 'gauge':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l4-4" /><path d="M3 12a9 9 0 1 1 18 0" /><path d="M7 12h.01M12 12h.01M17 12h.01" /></svg>);
    case 'route':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 8l8 8" /></svg>);
    case 'ui':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg>);
    case 'search':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-3.5-3.5" /></svg>);
    case 'stack':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>);
    case 'chip':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" /></svg>);
    case 'rocket':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13c0-6 7-10 9-10 0 0 2 2-1 5 3 0 5 2 5 2 0 2-4 9-10 9 0 0-2-2-2-6Z" /><path d="M5 13l-3 6 6-3" /></svg>);
    case 'keyboard':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" /></svg>);
    case 'terminal':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8l4 4-4 4" /><path d="M11 16h6" /></svg>);
    case 'chat':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /></svg>);
    case 'cog':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.76 17.6l.06-.06A1.65 1.65 0 0 0 3 15.4a1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 2.6 9c.14-.45.06-.94-.2-1.33l-.06-.06A2 2 0 1 1 5.17 4.8l.06.06c.39.26.88.34 1.33.2.24-.08.44-.22.61-.39.17-.17.3-.38.39-.61V4a2 2 0 1 1 4 0v.09c.05.76.47 1.43 1.1 1.81.45.14.94.06 1.33-.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.39-.34.88-.2 1.33.63.38 1.05 1.05 1.1 1.81H23a2 2 0 1 1 0 4h-.09c-.48 0-.98.17-1.51 1Z" /></svg>);
    case 'bug':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9 7V4m6 3V4M4 13h16M4 10h16M4 16h16" /></svg>);
    case 'warning':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 2 20h20L12 2Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>);
    case 'info':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>);
    case 'heart':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>);
    case 'document':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></svg>);
    case 'cycle':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 15-6" /><path d="M21 12a9 9 0 0 1-15 6" /><path d="M3 5v6h6M21 19v-6h-6" /></svg>);
    default:
      return null;
  }
}

const sectionTitle = 'text-xl font-semibold';

