"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [elevate, setElevate] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    // Subtle shadow when scrolling for better separation on large screens
    const onScroll = () => setElevate(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const linkBase = 'nav-link px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors';
  const activeLink = 'text-slate-900 dark:text-white font-semibold';
  const cls = (href: string) => `${linkBase} ${pathname === href ? activeLink : ''}`;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800 transition-shadow ${elevate ? 'shadow-sm' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" aria-label="Reflyx home">
            <img src="/icons/favicon.svg" alt="Reflyx icon" className="h-8 w-8" />
          </a>
          <a href="/" className="select-none"><span className="text-lg font-semibold">Reflyx</span></a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className={cls('/')}> 
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"/></svg>
              Home
            </span>
          </Link>
          <Link href="/about" className={cls('/about')}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              About
            </span>
          </Link>
          <Link href="/features" className={cls('/features')}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2.5 2.5M16.5 16.5 19 19M5 19l2.5-2.5M16.5 7.5 19 5"/></svg>
              Features
            </span>
          </Link>
          <Link href="/demo" className={cls('/demo')}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Demo
            </span>
          </Link>
          <Link href="/docs" className={cls('/docs')}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4z"/><path d="M14 4v6h6"/></svg>
              Docs
            </span>
          </Link>
          <Link href="/pricing" className={cls('/pricing')}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7"/></svg>
              Pricing
            </span>
          </Link>
          <Link href="https://github.com/njrgourav11/Reflyx" className={linkBase} target="_blank" rel="noopener">
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12.6c0 5.34 3.44 9.86 8.21 11.46.6.13.82-.27.82-.6v-2.1c-3.34.74-4.04-1.62-4.04-1.62-.55-1.43-1.34-1.81-1.34-1.81-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.28 1.86 1.28 1.08 1.9 2.84 1.35 3.53 1.03.11-.8.42-1.35.76-1.66-2.66-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26a11.3 11.3 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.66 1.69.24 2.94.12 3.25.77.86 1.23 1.96 1.23 3.3 0 4.72-2.81 5.76-5.49 6.07.43.37.82 1.1.82 2.23v3.31c0 .34.22.74.83.6A11.53 11.53 0 0 0 23.5 12.6 11.5 11.5 0 0 0 12 .5Z"/></svg>
              GitHub
            </span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle dark mode" className="icon-btn md:h-10 md:w-10" title="Toggle dark mode">
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
          <Link href="/" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"/></svg>
              Home
            </span>
          </Link>
          <Link href="/about" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              About
            </span>
          </Link>
          <Link href="/features" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2.5 2.5M16.5 16.5 19 19M5 19l2.5-2.5M16.5 7.5 19 5"/></svg>
              Features
            </span>
          </Link>
          <Link href="/demo" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Demo
            </span>
          </Link>
          <Link href="/docs" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4z"/><path d="M14 4v6h6"/></svg>
              Docs
            </span>
          </Link>
          <Link href="/pricing" className="nav-link py-2" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7"/></svg>
              Pricing
            </span>
          </Link>
          <Link href="https://github.com/njrgourav11/Reflyx" className="nav-link py-2" target="_blank" rel="noopener" onClick={() => setOpen(false)}>
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12.6c0 5.34 3.44 9.86 8.21 11.46.6.13.82-.27.82-.6v-2.1c-3.34.74-4.04-1.62-4.04-1.62-.55-1.43-1.34-1.81-1.34-1.81-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.28 1.86 1.28 1.08 1.9 2.84 1.35 3.53 1.03.11-.8.42-1.35.76-1.66-2.66-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26a11.3 11.3 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.66 1.69.24 2.94.12 3.25.77.86 1.23 1.96 1.23 3.3 0 4.72-2.81 5.76-5.49 6.07.43.37.82 1.1.82 2.23v3.31c0 .34.22.74.83.6A11.53 11.53 0 0 0 23.5 12.6 11.5 11.5 0 0 0 12 .5Z"/></svg>
              GitHub
            </span>
          </Link>
          <Link href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx" target="_blank" rel="noopener" className="btn btn-primary w-full" onClick={() => setOpen(false)}>Install</Link>
        </div>
      </nav>
    </header>
  );
}
