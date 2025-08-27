/* Main interactions: theme toggle, smooth nav, copy to clipboard, counters */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // year
  const y = new Date().getFullYear();
  const yEl = $('#year'); if (yEl) yEl.textContent = String(y);

  // theme toggle
  const tt = $('#themeToggle');
  const sun = $('#sunIcon');
  const moon = $('#moonIcon');
  const setTheme = (mode) => {
    const root = document.documentElement;
    const isDark = mode === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    sun.classList.toggle('hidden', !isDark);
    moon.classList.toggle('hidden', isDark);
  };
  tt && tt.addEventListener('click', () => {
    const nowDark = !document.documentElement.classList.contains('dark');
    setTheme(nowDark ? 'dark' : 'light');
  });

  // smooth nav highlight on scroll
  const sections = ['features','how','demo','specs','faq'];
  const navLinks = sections.map(id => ({ id, el: document.querySelector(`a[href="#${id}"]`) }));
  const onScroll = () => {
    let current = sections[0];
    const scrollPos = window.scrollY + 100;
    sections.forEach(id => {
      const s = document.getElementById(id);
      if (s && s.offsetTop <= scrollPos) current = id;
    });
    navLinks.forEach(({id, el}) => {
      if (!el) return;
      el.classList.toggle('text-brand-600', id === current);
      el.classList.toggle('font-semibold', id === current);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // copy commands
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Copied!'); }
    catch { alert('Copy failed'); }
  };
  const copyInstall = $('#copyInstall');
  copyInstall && copyInstall.addEventListener('click', () => copy('code --install-extension GouravB.reflyx'));
  const copyCode = $('#copyCode');
  copyCode && copyCode.addEventListener('click', () => copy('code --install-extension GouravB.reflyx'));

  // animated counters
  const counters = $$('.stat');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute('data-target')||'0');
      let n = 0;
      const step = Math.max(1, Math.round(target / 60));
      const tick = () => {
        n += step;
        if (n >= target) { el.textContent = String(target); observer.unobserve(el); return; }
        el.textContent = String(n);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .4 });
  counters.forEach(el => observer.observe(el));
})();

