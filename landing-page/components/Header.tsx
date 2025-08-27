"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = t ? t === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', initial);
    setDark(initial);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change (basic heuristic)
    const handler = () => setOpen(false);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const toggleTheme = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/">
            <img src="/icons/favicon.svg" alt="Reflyx icon" className="h-8 w-8" />
          </a>
          <a href="/"> <span className="text-lg font-semibold">Reflyx</span></a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/features" className="nav-link">Features</Link>
          <Link href="/demo" className="nav-link">Demo</Link>
          <Link href="/docs" className="nav-link">Docs</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="https://github.com/njrgourav11/Reflyx" className="nav-link" target="_blank" rel="noopener">GitHub</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle dark mode" className="icon-btn" title="Toggle dark mode">
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
          <Link href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx" target="_blank" rel="noopener" className="btn btn-primary hidden sm:inline-flex">Install</Link>
          {/* Mobile menu button */}
          <button
            className="md:hidden icon-btn"
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(v => !v)}
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav id="mobile-nav" className={`md:hidden border-t border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur transition-[max-height,opacity] duration-200 overflow-hidden ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 grid gap-2">
          <Link href="/features" className="nav-link py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="/demo" className="nav-link py-2" onClick={() => setOpen(false)}>Demo</Link>
          <Link href="/docs" className="nav-link py-2" onClick={() => setOpen(false)}>Docs</Link>
          <Link href="/pricing" className="nav-link py-2" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/about" className="nav-link py-2" onClick={() => setOpen(false)}>About</Link>
          <Link href="https://github.com/njrgourav11/Reflyx" className="nav-link py-2" target="_blank" rel="noopener" onClick={() => setOpen(false)}>GitHub</Link>
          <Link href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx" target="_blank" rel="noopener" className="btn btn-primary w-full" onClick={() => setOpen(false)}>Install</Link>
        </div>
      </nav>
    </header>
  );
}
