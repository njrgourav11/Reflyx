export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Free and Open Source</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Reflyx is 100% free under the MIT license. Self‑host, keep your data private, and use it offline. Optional cloud providers may charge their own usage fees.
        </p>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge icon="lock">Privacy‑first</Badge>
          <Badge icon="globe">Offline‑capable</Badge>
          <Badge icon="heart">MIT‑licensed</Badge>
          <Badge icon="rocket">Developer‑friendly</Badge>
        </div>
      </header>

      {/* Free plan */}
      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-3 relative rounded-xl ring-1 p-6 shadow-sm ring-emerald-400/60 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="star" className="h-5 w-5" /> Free forever</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Everything you need to be productive with a privacy‑first AI coding assistant.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold">$0</div>
              <div className="text-sm text-slate-500">MIT License</div>
            </div>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {[
              'Local AI via Ollama (private by default)',
              'Semantic code search over your workspace',
              'Inline explanations, hover help, and chat',
              'Code generation and smart prompts',
              'Works offline; no data leaves your machine',
              'Open source community support',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" /> {f}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a className="btn btn-primary" href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx">Install from Marketplace</a>
            <a className="btn btn-secondary" href="https://github.com/njrgourav11/Reflyx">View on GitHub</a>
          </div>
        </article>
      </section>

      {/* Optional costs */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="layers" className="h-5 w-5" /> Optional cloud costs</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProviderCard title="OpenAI" desc="GPT‑4o, pay‑as‑you‑go when enabled." />
          <ProviderCard title="Anthropic" desc="Claude 3.5, pay‑as‑you‑go when enabled." />
          <ProviderCard title="Google" desc="Gemini 1.5, pay‑as‑you‑go when enabled." />
          <ProviderCard title="Groq" desc="Ultra‑fast LLaMA 3.1, generous free tier." />
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Cloud providers are optional. Reflyx works fully offline using local models.</p>
      </section>

      {/* Included highlights */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="stack" className="h-5 w-5" /> What you get</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Included icon="cpu" title="Local first" desc="Run models with Ollama for private, offline coding." />
          <Included icon="bolt" title="Fast by default" desc="Snappy UX with streaming responses to stay in flow." />
          <Included icon="shield" title="Secure keys" desc="API keys stored via VS Code SecretStorage." />
          <Included icon="search" title="Semantic search" desc="Vector search across your codebase with embeddings." />
          <Included icon="ui" title="Great UX" desc="Inline suggestions, hover explain, context‑aware chat." />
          <Included icon="route" title="Hybrid ready" desc="Optionally route heavy tasks to cloud providers." />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="help" className="h-5 w-5" /> Frequently asked questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Faq q="Is Reflyx really free?" a="Yes. MIT‑licensed and free. Only optional cloud providers charge for API usage if you enable them." />
          <Faq q="Do I need internet?" a="Not for local mode. Reflyx runs offline with Ollama and local embeddings. Internet is needed only for cloud providers." />
          <Faq q="Can I use it at work?" a="Yes. Self‑host and keep control of your data. Reflyx is privacy‑first by design." />
          <Faq q="Is there telemetry?" a="No forced telemetry. You remain in control. See the docs for details." />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Ready to install?</h3>
          <p className="text-slate-600 dark:text-slate-300">Get started in minutes — no credit card, no lock‑in.</p>
        </div>
        <div className="flex gap-3">
          <a className="btn btn-primary" href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx">Install from Marketplace</a>
          <a className="btn btn-secondary" href="/docs">Read the Docs</a>
        </div>
      </section>
    </main>
  );
}

/* --- Small components --- */
function Badge({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-800">
      <Icon name={icon} className="h-4 w-4" /> {children}
    </span>
  );
}

function Included({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
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

function ProviderCard({ title, desc }: { title: string; desc: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <h3 className="font-medium flex items-start gap-2"><Icon name="cloud" className="h-5 w-5" /> {title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </article>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <h3 className="font-medium flex items-start gap-2"><Icon name="help" className="h-5 w-5" /> {q}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{a}</p>
    </article>
  );
}

/* --- Icons --- */
 type IconName =
  | 'lock' | 'globe' | 'rocket' | 'heart' | 'star' | 'check' | 'layers' | 'stack' | 'cpu' | 'bolt' | 'shield' | 'search' | 'ui' | 'route' | 'help' | 'cloud';

function Icon({ name, className }: { name: IconName; className?: string }) {
  const cls = `text-slate-700 dark:text-slate-200 ${className ?? ''}`;
  switch (name) {
    case 'lock':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
    case 'globe':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>);
    case 'rocket':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13c0-6 7-10 9-10 0 0 2 2-1 5 3 0 5 2 5 2 0 2-4 9-10 9 0 0-2-2-2-6Z"/><path d="M5 13l-3 6 6-3"/></svg>);
    case 'heart':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>);
    case 'star':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
    case 'check':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>);
    case 'layers':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>);
    case 'stack':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>);
    case 'cpu':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"/></svg>);
    case 'bolt':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>);
    case 'shield':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z"/></svg>);
    case 'search':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-3.5-3.5"/></svg>);
    case 'ui':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>);
    case 'route':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 8l8 8"/></svg>);
    case 'help':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>);
    case 'cloud':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M19 18a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2A5 5 0 0 0 6 18h13z"/></svg>);
    default:
      return null;
  }
}
