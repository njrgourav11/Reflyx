"use client";
import { useEffect, useRef } from 'react';

export default function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }){
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const Prism = (await import('prismjs')).default;
        await import('prismjs/components/prism-bash');
        if (mounted && ref.current) {
          Prism.highlightElement(ref.current);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <pre className={`language-${language} whitespace-pre-wrap text-sm`}>
      <code ref={ref} className={`language-${language}`}>{code}</code>
    </pre>
  );
}

