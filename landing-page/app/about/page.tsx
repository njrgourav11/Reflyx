export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Reflyx</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl">
          Reflyx is a privacy‑first, offline‑capable AI coding assistant. Built to help developers stay in flow with
          semantic search, smart generation, and contextual explanations — without compromising your code privacy.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge icon="lock">Privacy‑first</Badge>
          <Badge icon="globe">Offline‑capable</Badge>
          <Badge icon="heart">Open Source (MIT)</Badge>
          <Badge icon="rocket">Developer‑friendly</Badge>
        </div>
      </header>

      {/* Mission */}
      <section className="mt-12 grid lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="sparkles" className="h-5 w-5" /> Our mission</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Make high‑quality AI assistance accessible to every developer — locally, securely, and with great UX. You own your code and your runtime.
          </p>
        </div>
        <div className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-800 p-6">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">At a glance</h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2"><Icon name="shield" className="mt-0.5 h-4 w-4" /> Privacy by design</li>
            <li className="flex items-start gap-2"><Icon name="bolt" className="mt-0.5 h-4 w-4" /> Fast, responsive UI</li>
            <li className="flex items-start gap-2"><Icon name="search" className="mt-0.5 h-4 w-4" /> Semantic code search</li>
          </ul>
        </div>
      </section>

      {/* Core principles */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="values" className="h-5 w-5" /> Core principles</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard icon="lock" title="Privacy" desc="Local by default, with optional cloud providers you control." />
          <ValueCard icon="gauge" title="Performance" desc="Snappy interactions, streaming answers, minimal friction." />
          <ValueCard icon="book" title="Transparency" desc="Clear configs, open roadmap, and open‑source code." />
          <ValueCard icon="access" title="Accessibility" desc="Thoughtful contrast, focus states, and keyboard support." />
        </div>
      </section>

      {/* What is Reflyx */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="stack" className="h-5 w-5" /> What is Reflyx?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="cpu" title="Local AI" desc="Run models with Ollama for private, offline coding." />
          <Feature icon="route" title="Hybrid ready" desc="Optionally use cloud models for heavy tasks." />
          <Feature icon="search" title="Semantic search" desc="Vector search across your codebase with embeddings." />
          <Feature icon="ui" title="Great UX" desc="Inline suggestions, hover explain, and chat." />
          <Feature icon="terminal" title="Dev‑centric" desc="Works inside VS Code with intuitive commands." />
          <Feature icon="cog" title="Configurable" desc="Tune providers, prompts, and retrieval settings." />
        </div>
      </section>

      {/* Timeline / Roadmap */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="roadmap" className="h-5 w-5" /> Roadmap</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Milestone when="Q1" title="Public launch" desc="Core features: local AI, search, explain, chat." status="done" />
          <Milestone when="Q2" title="Hybrid routing" desc="Smart provider fallback and performance routing." status="done" />
          <Milestone when="Q3" title="Team workflows" desc="Shared prompts, policy controls, artifacts." status="wip" />
          <Milestone when="Q4" title="Plugins" desc="Extensible actions and community recipes." status="upcoming" />
        </ol>
      </section>

      {/* Team */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="users" className="h-5 w-5" /> Team</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeamCard
            name="Gourav"
            role="Creator & Maintainer"
            bio="Building privacy‑first developer tools."
            links={[
              { label: 'GitHub', href: 'https://github.com/njrgourav11' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bgourav2287/' },
              { label: 'Website', href: 'https://www.gourav.bio' },
            ]}
          />
        </div>
      </section>

      {/* Open source */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="heart" className="h-5 w-5" /> Open‑source and community</h2>
        <div className="mt-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
          <p className="text-slate-600 dark:text-slate-300">
            Reflyx is MIT‑licensed. We welcome contributions — issues, pull requests, docs, and discussions.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-start gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" /> Check open issues and choose a <span className="font-medium">good first issue</span>.</li>
            <li className="flex items-start gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" /> Submit a PR with a clear description and screenshots when relevant.</li>
            <li className="flex items-start gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" /> Improve docs and examples — they help everyone.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="https://github.com/njrgourav11/Reflyx">View on GitHub</a>
            <a className="btn btn-secondary" href="/docs">Read the Docs</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Icon name="mail" className="h-5 w-5" /> Contact</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ContactCard title="General" desc="Questions, ideas, feedback" linkText="Email" href="mailto:njrgourav@gmail.com" />
          <ContactCard title="Issues" desc="Bugs or feature requests" linkText="GitHub Issues" href="https://github.com/njrgourav11/Reflyx/issues" />
          <ContactCard title="Community" desc="Chat and announcements" linkText="Docs" href="/docs" />
        </div>
      </section>
    </main>
  );
}

/* --- Components --- */
function Badge({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-800">
      <Icon name={icon} className="h-4 w-4" /> {children}
    </span>
  );
}

function ValueCard({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
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

function Feature({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <h3 className="font-medium flex items-start gap-2"><Icon name={icon} className="h-5 w-5" /> {title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </article>
  );
}

function Milestone({ when, title, desc, status }: { when: string; title: string; desc: string; status: 'done' | 'wip' | 'upcoming' }) {
  const badge = status === 'done' ? 'bg-emerald-600' : status === 'wip' ? 'bg-amber-600' : 'bg-slate-600';
  const label = status === 'done' ? 'Done' : status === 'wip' ? 'In progress' : 'Upcoming';
  return (
    <li className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <div className="flex items-start justify-between">
        <div className="text-sm text-slate-500">{when}</div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${badge}`}>{label}</span>
      </div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </li>
  );
}

function TeamCard({ name, role, bio, links }: { name: string; role: string; bio: string; links: { label: string; href: string }[] }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <div className="text-sm text-slate-500">{role}</div>
        </div>
        <Icon name="user" className="h-8 w-8 text-slate-400" />
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{bio}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {links.map(l => (
          <a key={l.href} className="toc-link" href={l.href} target="_blank" rel="noopener">{l.label}</a>
        ))}
      </div>
    </article>
  );
}

function ContactCard({ title, desc, linkText, href }: { title: string; desc: string; linkText: string; href: string }) {
  return (
    <article className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-5">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
      <a className="mt-3 inline-flex items-center gap-2 text-sm underline" href={href}><Icon name="arrow" className="h-4 w-4" /> {linkText}</a>
    </article>
  );
}

/* --- Icons --- */
 type IconName =
  | 'lock' | 'globe' | 'heart' | 'rocket' | 'sparkles' | 'shield' | 'bolt' | 'search' | 'values' | 'gauge' | 'book' | 'access' | 'stack' | 'cpu' | 'route' | 'ui' | 'terminal' | 'cog' | 'roadmap' | 'users' | 'check' | 'mail' | 'user' | 'arrow';

function Icon({ name, className }: { name: IconName; className?: string }) {
  const cls = `text-slate-700 dark:text-slate-200 ${className ?? ''}`;
  switch (name) {
    case 'lock':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
    case 'globe':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>);
    case 'heart':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>);
    case 'rocket':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13c0-6 7-10 9-10 0 0 2 2-1 5 3 0 5 2 5 2 0 2-4 9-10 9 0 0-2-2-2-6Z"/><path d="M5 13l-3 6 6-3"/></svg>);
    case 'sparkles':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"/><path d="M19 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>);
    case 'shield':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z"/></svg>);
    case 'bolt':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>);
    case 'search':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-3.5-3.5"/></svg>);
    case 'values':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3"/><circle cx="12" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>);
    case 'gauge':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l4-4"/><path d="M3 12a9 9 0 1 1 18 0"/><path d="M7 12h.01M12 12h.01M17 12h.01"/></svg>);
    case 'book':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v15.5A2.5 2.5 0 0 0 6.5 22H20V6a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 6.5"/></svg>);
    case 'access':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 22a6.5 6.5 0 0 1 13 0"/></svg>);
    case 'stack':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>);
    case 'cpu':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"/></svg>);
    case 'route':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 8l8 8"/></svg>);
    case 'ui':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>);
    case 'terminal':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8l4 4-4 4"/><path d="M11 16h6"/></svg>);
    case 'cog':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.76 17.6l.06-.06A1.65 1.65 0 0 0 3 15.4a1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 2.6 9c.14-.45.06-.94-.2-1.33l-.06-.06A2 2 0 1 1 5.17 4.8l.06.06c.39.26.88.34 1.33.2.24-.08.44-.22.61-.39.17-.17.3-.38.39-.61V4a2 2 0 1 1 4 0v.09c.05.76.47 1.43 1.1 1.81.45.14.94.06 1.33-.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.39-.34.88-.2 1.33.63.38 1.05 1.05 1.1 1.81H23a2 2 0 1 1 0 4h-.09c-.48 0-.98.17-1.51 1Z"/></svg>);
    case 'roadmap':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h7l2 3h9"/><path d="M3 6v12h7l2-3h9"/></svg>);
    case 'users':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case 'check':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>);
    case 'mail':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>);
    case 'user':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 22a6.5 6.5 0 0 1 13 0"/></svg>);
    case 'arrow':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>);
    default:
      return null;
  }
}
