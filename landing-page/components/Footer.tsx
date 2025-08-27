import Link from 'next/link';

export default function Footer(){
  return (
    <footer className="py-10 border-t border-slate-200/60 dark:border-slate-800 text-sm mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-center md:text-left">
          © {new Date().getFullYear()} Reflyx • MIT License • Developed by{' '}
          <Link href="https://www.gourav.bio" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Gourav</Link>
        </p>
        <nav className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center md:justify-end">
          <SocialIcon label="GitHub" href="https://github.com/njrgourav11" svg={<GithubIcon/>} />
          <SocialIcon label="LinkedIn" href="https://www.linkedin.com/in/bgourav2287/" svg={<LinkedInIcon/>} />
          <SocialIcon label="Portfolio" href="https://www.gourav.bio" svg={<GlobeIcon/>} />
          <Link href="https://github.com/njrgourav11/Reflyx" target="_blank" rel="noopener" className="nav-link px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Repository</Link>
          <Link href="/docs" className="nav-link px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Docs</Link>
          <Link href="mailto:njrgourav@gmail.com" className="nav-link px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

function SocialIcon({ label, href, svg }: { label: string; href: string; svg: React.ReactNode }){
  return (
    <Link href={href} aria-label={label} className="icon-btn hover:bg-black/10 dark:hover:bg-white/10 transition-colors" target="_blank" rel="noopener">
      {svg}
    </Link>
  );
}

function GithubIcon(){
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12.6c0 5.34 3.44 9.86 8.21 11.46.6.13.82-.27.82-.6v-2.1c-3.34.74-4.04-1.62-4.04-1.62-.55-1.43-1.34-1.81-1.34-1.81-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.28 1.86 1.28 1.08 1.9 2.84 1.35 3.53 1.03.11-.8.42-1.35.76-1.66-2.66-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.44 1.24-3.3-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.26a11.3 11.3 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.66 1.69.24 2.94.12 3.25.77.86 1.23 1.96 1.23 3.3 0 4.72-2.81 5.76-5.49 6.07.43.37.82 1.1.82 2.23v3.31c0 .34.22.74.83.6A11.53 11.53 0  0 0 23.5 12.6 11.5 11.5 0  0 0 12 .5Z"/></svg>
  );
}

function LinkedInIcon(){
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7 0h3.84v2.2h.05c.54-1.01 1.86-2.2 3.83-2.2 4.1 0 4.86 2.7 4.86 6.2V24h-4v-7.2c0-1.72-.03-3.94-2.4-3.94-2.4 0-2.8 1.87-2.8 3.8V24h-4V8z"/></svg>
  );
}

function GlobeIcon(){
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm0 18a8 8 0 0 1-7.75-6h4.17c.22 1.67.85 3.19 1.77 4.38A7.96 7.96 0  0 1 12 20Zm0-16c-.86 0-1.69.13-2.46.38.92 1.2 1.55 2.71 1.77 4.38H4.25A8 8 0  0 1 12 4Zm1.46.38c.77-.25 1.6-.38 2.54-.38a8 8 0 0 1 7.75 6h-4.17c-.22-1.67-.85-3.19-1.77-4.38A7.96 7.96 0  0 0 13.46 4.38ZM20.75 12a8 8 0 0 1-7.75 6c.94 0 1.77-.13 2.54-.38-.92-1.2-1.55-2.71-1.77-4.38h7c.13-.53.2-1.08.2-1.64s-.07-1.11-.22-1.62h-6.98c.22-1.67.85-3.19 1.77-4.38A8 8 0  0 1 20.75 12Z"/></svg>
  );
}
