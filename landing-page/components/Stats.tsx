"use client";
import { useEffect, useRef } from 'react';

export default function Stats(){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const nums = el.querySelectorAll<HTMLElement>('[data-target]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const t = entry.target as HTMLElement;
        const target = Number(t.dataset.target||'0');
        let n = 0; const step = Math.max(1, Math.round(target / 60));
        const tick = () => { n += step; if (n >= target) { t.textContent = String(target); obs.unobserve(t); return; } t.textContent = String(n); requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    }, { threshold: .4 });
    nums.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return (
    <section className="py-12 border-t border-slate-200/60 dark:border-slate-800">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div><div className="stat" data-target="100">0</div><p className="stat-label">Projects Indexed</p></div>
        <div><div className="stat" data-target="2000">0</div><p className="stat-label">Developers Helped</p></div>
        <div><div className="stat" data-target="15">0</div><p className="stat-label">Supported Languages</p></div>
        <div><div className="stat" data-target="5">0</div><p className="stat-label">AI Providers</p></div>
      </div>
    </section>
  );
}

