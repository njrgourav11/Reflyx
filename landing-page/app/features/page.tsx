"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturesPage(){
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <header className="text-center">
        <motion.h1 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Features Comparison
        </motion.h1>
        <motion.p 
          className="mt-4 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Reflyx vs GitHub Copilot, Tabnine, and CodeWhisperer. Privacy‑first, local AI with multi‑provider support and semantic code search.
        </motion.p>
        <motion.div 
          className="mt-6 flex flex-wrap justify-center gap-3 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Badge icon="lock">Privacy‑first</Badge>
          <Badge icon="cpu">Local AI</Badge>
          <Badge icon="search">Semantic Search</Badge>
          <Badge icon="heart">Open Source</Badge>
        </motion.div>
      </header>

      {/* Key Features Grid */}
      <section className="mt-16">
        <motion.h2 
          className="text-xl font-semibold text-center mb-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Icon name="sparkles" className="h-5 w-5" /> 
          Why Choose Reflyx?
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {keyFeatures.map((feature, idx) => (
            <motion.article
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{feature.desc}</p>
                  <div className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium">{feature.advantage}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="mt-20">
        <motion.h2 
          className="text-xl font-semibold text-center mb-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Icon name="gauge" className="h-5 w-5" /> 
          Detailed Comparison
        </motion.h2>
        
        {/* Mobile-first responsive comparison */}
        <div className="space-y-6">
          {comparisonData.map((item, idx) => (
            <motion.div
              key={item.feature}
              className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon name={item.icon} className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-semibold text-lg">{item.feature}</h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ComparisonCard 
                  name="Reflyx" 
                  status={item.reflyx} 
                  highlight={true}
                  description={item.reflyxDesc}
                />
                <ComparisonCard 
                  name="GitHub Copilot" 
                  status={item.copilot}
                  description={item.copilotDesc}
                />
                <ComparisonCard 
                  name="Tabnine" 
                  status={item.tabnine}
                  description={item.tabnineDesc}
                />
                <ComparisonCard 
                  name="CodeWhisperer" 
                  status={item.codewhisperer}
                  description={item.codewhispererDesc}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <motion.section 
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to experience the difference?</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            Join thousands of developers who've made the switch to privacy-first AI coding assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx" className="btn btn-primary">
              Install from Marketplace
            </Link>
            <Link href="/demo" className="btn btn-secondary">
              See it in action
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

/* --- Components --- */
function Badge({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/40">
      <Icon name={icon} className="h-4 w-4" /> {children}
    </span>
  );
}

function ComparisonCard({ 
  name, 
  status, 
  highlight = false, 
  description 
}: { 
  name: string; 
  status: string; 
  highlight?: boolean; 
  description?: string;
}) {
  const getStatusColor = (status: string) => {
    if (status.includes('✅')) return 'text-emerald-600 dark:text-emerald-400';
    if (status.includes('❌')) return 'text-red-600 dark:text-red-400';
    if (status.includes('⚠️')) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div className={`rounded-lg p-4 ${
      highlight 
        ? 'bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-200 dark:ring-brand-800' 
        : 'bg-slate-50 dark:bg-slate-800/40'
    }`}>
      <div className="font-medium text-sm mb-2">{name}</div>
      <div className={`text-sm font-medium mb-1 ${getStatusColor(status)}`}>
        {status}
      </div>
      {description && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </div>
      )}
    </div>
  );
}

/* --- Icons --- */
type IconName =
  | 'lock' | 'cpu' | 'search' | 'heart' | 'sparkles' | 'gauge' | 'shield' | 'bolt' | 'globe' | 'cog' | 'terminal' | 'users';

function Icon({ name, className }: { name: IconName; className?: string }) {
  const cls = `text-slate-700 dark:text-slate-200 ${className ?? ''}`;
  switch (name) {
    case 'lock':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
    case 'cpu':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3"/></svg>);
    case 'search':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-3.5-3.5"/></svg>);
    case 'heart':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>);
    case 'sparkles':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"/><path d="M19 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/></svg>);
    case 'gauge':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l4-4"/><path d="M3 12a9 9 0 1 1 18 0"/><path d="M7 12h.01M12 12h.01M17 12h.01"/></svg>);
    case 'shield':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z"/></svg>);
    case 'bolt':
      return (<svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>);
    case 'globe':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>);
    case 'cog':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.76 17.6l.06-.06A1.65 1.65 0 0 0 3 15.4a1.65 1.65 0 0 0-1.51-1H1a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 2.6 9c.14-.45.06-.94-.2-1.33l-.06-.06A2 2 0 1 1 5.17 4.8l.06.06c.39.26.88.34 1.33.2.24-.08.44-.22.61-.39.17-.17.3-.38.39-.61V4a2 2 0 1 1 4 0v.09c.05.76.47 1.43 1.1 1.81.45.14.94.06 1.33-.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.39-.34.88-.2 1.33.63.38 1.05 1.05 1.1 1.81H23a2 2 0 1 1 0 4h-.09c-.48 0-.98.17-1.51 1Z"/></svg>);
    case 'terminal':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 8l4 4-4 4"/><path d="M11 16h6"/></svg>);
    case 'users':
      return (<svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    default:
      return null;
  }
}

/* --- Data --- */
const keyFeatures = [
  { 
    icon: 'lock' as IconName, 
    title: 'Local AI Processing', 
    desc: 'Run models via Ollama for private, offline coding help. Your code never leaves your machine.',
    advantage: 'Complete privacy & security'
  },
  { 
    icon: 'search' as IconName, 
    title: 'Semantic Code Search', 
    desc: 'Find relevant snippets instantly with vector search over your codebase.',
    advantage: 'Superior code understanding'
  },
  { 
    icon: 'globe' as IconName, 
    title: 'Multi‑provider Support', 
    desc: 'Use OpenAI, Anthropic, Google, Groq and more—choose local, cloud, or hybrid modes.',
    advantage: 'Ultimate flexibility'
  },
  { 
    icon: 'bolt' as IconName, 
    title: 'Real‑time Explanations', 
    desc: 'Hover to understand complex code with clear, contextual explanations.',
    advantage: 'Instant learning'
  },
  { 
    icon: 'cog' as IconName, 
    title: 'Intelligent Generation', 
    desc: 'Create functions, tests, and refactors with production‑ready code suggestions.',
    advantage: 'High-quality output'
  },
  { 
    icon: 'terminal' as IconName, 
    title: 'VS Code Native', 
    desc: 'CodeLens, hovers, completions and a chat view that feels right at home.',
    advantage: 'Seamless integration'
  },
];

const comparisonData = [
  { 
    feature: 'Local AI Processing',
    icon: 'cpu' as IconName,
    reflyx: '✅ Full Support',
    reflyxDesc: 'Complete offline processing with Ollama',
    copilot: '❌ Cloud Only',
    copilotDesc: 'Requires internet connection',
    tabnine: '⚠️ Limited',
    tabnineDesc: 'Some local features available',
    codewhisperer: '❌ Cloud Only',
    codewhispererDesc: 'AWS cloud processing required'
  },
  { 
    feature: 'Multi‑provider Support',
    icon: 'globe' as IconName,
    reflyx: '✅ Multiple Providers',
    reflyxDesc: 'OpenAI, Anthropic, Google, Groq, local models',
    copilot: '⚠️ OpenAI Only',
    copilotDesc: 'Limited to OpenAI models',
    tabnine: '⚠️ Proprietary',
    tabnineDesc: 'Uses proprietary models',
    codewhisperer: '⚠️ AWS Only',
    codewhispererDesc: 'Limited to AWS models'
  },
  { 
    feature: 'Semantic Code Search',
    icon: 'search' as IconName,
    reflyx: '✅ Advanced Vector Search',
    reflyxDesc: 'Full semantic understanding with embeddings',
    copilot: '⚠️ Basic Search',
    copilotDesc: 'Limited semantic capabilities',
    tabnine: '⚠️ Basic Search',
    tabnineDesc: 'Simple pattern matching',
    codewhisperer: '⚠️ Basic Search',
    codewhispererDesc: 'Limited search functionality'
  },
  { 
    feature: 'Privacy‑first Design',
    icon: 'shield' as IconName,
    reflyx: '✅ Complete Privacy',
    reflyxDesc: 'Local processing, no data collection',
    copilot: '❌ Data Collection',
    copilotDesc: 'Code sent to Microsoft servers',
    tabnine: '❌ Data Collection',
    tabnineDesc: 'Code processed on their servers',
    codewhisperer: '❌ Data Collection',
    codewhispererDesc: 'Code sent to AWS servers'
  },
  { 
    feature: 'Offline Capability',
    icon: 'bolt' as IconName,
    reflyx: '✅ Full Offline',
    reflyxDesc: 'Works completely without internet',
    copilot: '❌ Internet Required',
    copilotDesc: 'Cannot function offline',
    tabnine: '❌ Internet Required',
    tabnineDesc: 'Requires connection for most features',
    codewhisperer: '❌ Internet Required',
    codewhispererDesc: 'AWS connection mandatory'
  },
  { 
    feature: 'Open Source',
    icon: 'heart' as IconName,
    reflyx: '✅ MIT License',
    reflyxDesc: 'Fully open source and transparent',
    copilot: '❌ Proprietary',
    copilotDesc: 'Closed source Microsoft product',
    tabnine: '❌ Proprietary',
    tabnineDesc: 'Commercial closed source',
    codewhisperer: '❌ Proprietary',
    codewhispererDesc: 'Amazon proprietary service'
  },
];

