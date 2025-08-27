"use client";

import Stats from '../components/Stats';
import CodeBlock from '../components/CodeBlock';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLoading } from '../components/LoadingProvider';
import { useEffect } from 'react';

export default function HomePage() {
  const { setLoading } = useLoading();

  useEffect(() => {
    // Ensure loading is complete when component mounts
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-50/30 to-purple-50/30 dark:from-slate-900 dark:via-brand-900/10 dark:to-purple-900/10">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-brand-400/5 to-purple-400/5 rounded-full blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Now available on VS Code Marketplace
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-slate-900 via-brand-800 to-purple-800 dark:from-slate-100 dark:via-brand-200 dark:to-purple-200 bg-clip-text text-transparent">
                Supercharge VS Code with a{' '}
                <span className="relative">
                  Privacy‑First
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-brand-400/30 to-purple-400/30 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </span>{' '}
                AI Coding Assistant
              </h1>
              
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-prose leading-relaxed">
                Reflyx runs local AI models for private coding assistance, with optional cloud providers. Enjoy semantic code search, real‑time explanations, and intelligent code generation—right inside your editor.
              </p>

              {/* Feature highlights */}
              <motion.div 
                className="mt-8 grid grid-cols-2 gap-4 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {[
                  { icon: '🔒', text: 'Complete Privacy' },
                  { icon: '⚡', text: 'Lightning Fast' },
                  { icon: '🧠', text: 'Smart AI Models' },
                  { icon: '🆓', text: '100% Free & Open' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-10 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link 
                  href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx" 
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Install from Marketplace</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#how" className="btn btn-secondary text-lg px-8 py-4">
                  How it works
                </a>
                <CopyInstall />
              </motion.div>
              
              <motion.div 
                className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Free Forever
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Open Source
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Offline‑first
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative" 
              initial={{ opacity: 0, y: 30, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              {/* Enhanced decorative elements */}
              <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 blur-3xl animate-pulse" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-2xl" />
              
              {/* Video container with enhanced styling */}
              <div className="relative rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 shadow-2xl">
                <div className="relative overflow-hidden rounded-xl">
                  <video
                    src="/images/reflyx.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/images/image.png"
                    className="w-full h-auto aspect-video object-cover"
                  />
                  
                  {/* Play button overlay for accessibility */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-xl">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Floating stats */}
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">Active Users</div>
                  <div className="text-lg font-bold text-brand-600 dark:text-brand-400">10,000+</div>
                </motion.div>

                <motion.div
                  className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">Rating</div>
                  <div className="flex items-center gap-1">
                    <div className="text-lg font-bold text-brand-600 dark:text-brand-400">4.8</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <p className="sr-only">Interactive demo of the Reflyx VS Code extension showing AI-powered code assistance</p>
            </motion.div>
          </div>
        </section>

        <Stats />

        {/* Features */}
        <section id="features" className="py-24 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title mb-4">Powerful features built for productivity</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Experience the next generation of AI-powered development tools designed to enhance your coding workflow
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, idx) => (
                <motion.article
                  key={f.title}
                  className="group relative feature-card bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-900/10 dark:to-purple-900/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="feature-icon text-brand-600 dark:text-brand-400" aria-hidden dangerouslySetInnerHTML={{ __html: f.icon }} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
                      {f.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {f.desc}
                    </p>

                    {/* Learn more link */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-brand-600 dark:text-brand-400 text-sm font-medium inline-flex items-center gap-1">
                        Learn more
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Call to action */}
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link 
                href="/features" 
                className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300 transition-colors duration-200"
              >
                View detailed feature comparison
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* How to Get Started */}
        <section id="how" className="py-24 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title mb-4">Get started in minutes</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Four simple steps to transform your VS Code experience with AI-powered assistance
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 dark:from-brand-800 dark:via-brand-600 dark:to-brand-800 transform -translate-y-1/2" />
              
              <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
                {steps.map((s, i) => (
                  <motion.li 
                    key={i} 
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="step-card bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 hover:shadow-lg">
                      {/* Step number with enhanced styling */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-brand-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        {i + 1}
                      </div>
                      
                      {/* Step icon */}
                      <div className="flex justify-center mb-6 mt-4">
                        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center">
                          <StepIcon step={i + 1} className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 text-center">
                        {s.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-4">
                        {s.text}
                      </p>
                      
                      {s.href && (
                        <div className="text-center">
                          <a 
                            className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300 transition-colors duration-200" 
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Marketplace
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Quick start CTA */}
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-2xl border border-brand-200 dark:border-brand-800">
                <div className="text-2xl">⚡</div>
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Ready to get started?</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Install Reflyx and boost your productivity today</div>
                </div>
                <Link 
                  href="https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx"
                  className="btn btn-primary whitespace-nowrap"
                >
                  Install Now
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title mb-4">Loved by developers worldwide</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                See what developers are saying about their experience with Reflyx
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* Technical Specs */}
        <section id="specs" className="py-20 bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="section-title">Technical specifications</h2>
              <ul className="mt-6 space-y-3 list-disc list-inside text-slate-600 dark:text-slate-300">
                <li>VS Code extension (TypeScript) with FastAPI backend</li>
                <li>Local embeddings with sentence-transformers; Tree-sitter parsing</li>
                <li>Vector DB: Qdrant/ChromaDB; Local LLM via Ollama; optional cloud LLMs</li>
                <li>RAG pipeline, offline‑first architecture, secure API key storage</li>
                <li>Accessibility: WCAG 2.1 AA‑aligned color contrast and focus states</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">License & Pricing</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">100% Free & Open Source under MIT License. Use locally with zero data exfiltration.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <blockquote className="quote"><p>“The best offline AI helper I’ve tried.”</p><footer>— Senior Engineer</footer></blockquote>
                <blockquote className="quote"><p>“Semantics + speed = instant productivity.”</p><footer>— Tech Lead</footer></blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="section-title">Frequently asked questions</h2>
            <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800" role="list">
              {faqs.map((f, i) => (
                <details key={i} className="faq" role="listitem"><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>
      </main>


    </>
  );
}


function CopyInstall() {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300">
        code --install-extension GouravB.reflyx
      </code>
      <CopySnippet value="code --install-extension GouravB.reflyx" label="Copy install command" />
    </div>
  );
}

function CopySnippet({ value, label }: { value: string; label?: string }) {
  const copy = async () => {
    try { 
      await navigator.clipboard.writeText(value); 
      // You could use a toast notification here instead of alert
      alert('Copied to clipboard!'); 
    } catch { 
      alert('Failed to copy. Please copy manually.'); 
    }
  };
  
  return (
    <button 
      onClick={copy} 
      className="btn btn-ghost text-sm px-3 py-1" 
      aria-label={label || 'Copy to clipboard'}
      title={label || 'Copy to clipboard'}
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Copy
    </button>
  );
}

const i = {
  lock: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 1 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-3.5-3.5"/></svg>',
  plug: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M7 8h10"/><path d="M7 8a5 5 0 0 0 10 0"/></svg>',
  bulb: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 12A10 10 0 1 1 22 12A10 10 0 1 1 2 12"/></svg>',
  gear: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9c.14-.45.06-.94-.2-1.33l-.06-.06A2 2 0 1 1 7.17 4.8l.06.06c.39.26.88.34 1.33.2.24-.08.44-.22.61-.39.17-.17.3-.38.39-.61V4a2 2 0 1 1 4 0v.09c.05.76.47 1.43 1.1 1.81.45.14.94.06 1.33-.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.26.39-.34.88-.2 1.33.63.38 1.05 1.05 1.1 1.81H21a2 2 0 1 1 0 4h-.09c-.48 0-.98.17-1.51 1Z"/></svg>',
  puzzle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10 3H3v7h7zM21 14h-7v7h7z"/><path d="M14 3h7v7h-7zM10 14H3v7h7z" opacity=".4"/></svg>'
};

const features = [
  { icon: i.lock, title: 'Local AI Processing', desc: 'Run models via Ollama for private, offline coding help. Your code never leaves your machine.' },
  { icon: i.search, title: 'Semantic Code Search', desc: 'Find relevant snippets instantly with vector search over your codebase.' },
  { icon: i.plug, title: 'Multi‑provider Support', desc: 'Use OpenAI, Anthropic, Google, Groq and more—choose local, cloud, or hybrid modes.' },
  { icon: i.bulb, title: 'Real‑time Explanations', desc: 'Hover to understand complex code with clear, contextual explanations.' },
  { icon: i.gear, title: 'Intelligent Generation', desc: 'Create functions, tests, and refactors with production‑ready code suggestions.' },
  { icon: i.puzzle, title: 'VS Code Native', desc: 'CodeLens, hovers, completions and a chat view that feels right at home.' },
];

const steps = [
  { title: 'Install', text: 'Install from VS Code Marketplace.', href: 'https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx' },
  { title: 'Configure', text: 'Pick your AI providers and set API keys securely.' },
  { title: 'Index', text: 'Index your workspace for semantic search.' },
  { title: 'Use AI', text: 'Ask questions, explain code, and generate with confidence.' },
];

const faqs = [
  { q: 'Does Reflyx work offline?', a: 'Yes. With Ollama and local embeddings, Reflyx works fully offline. You can optionally enable cloud models.' },
  { q: 'Is my code sent to external servers?', a: 'Not in local mode. Your code stays on your machine. Hybrid/online modes only send what’s necessary.' },
  { q: 'Which languages are supported?', a: 'Popular languages including TypeScript, Python, Go, Rust, Java, C/C++, and more.' },
  { q: 'How do I install?', a: 'Install from the VS Code Marketplace or use the CLI command above.' },
];

const testimonials = [
  {
    quote: "Reflyx has completely transformed my coding workflow. The local AI processing gives me peace of mind about privacy while delivering incredible results.",
    author: "Sarah Chen",
    role: "Senior Full Stack Developer"
  },
  {
    quote: "The semantic code search is a game-changer. I can find exactly what I need in seconds, even in large codebases.",
    author: "Marcus Rodriguez",
    role: "Tech Lead at StartupCo"
  },
  {
    quote: "Finally, an AI coding assistant that respects privacy! The offline capability means I can work anywhere without compromising security.",
    author: "Dr. Emily Watson",
    role: "Security Engineer"
  },
  {
    quote: "The multi-provider support is brilliant. I can switch between local and cloud models based on my needs.",
    author: "Alex Kim",
    role: "DevOps Engineer"
  },
  {
    quote: "Reflyx's code explanations are incredibly helpful for understanding complex legacy code. It's like having a senior developer by my side.",
    author: "Jordan Taylor",
    role: "Junior Developer"
  },
  {
    quote: "The VS Code integration is seamless. It feels like a natural extension of the editor, not a bolt-on tool.",
    author: "Priya Patel",
    role: "Frontend Architect"
  }
];

function StepIcon({ step, className }: { step: number; className?: string }) {
  const icons = {
    1: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    2: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    3: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    4: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  };
  
  return icons[step as keyof typeof icons] || null;
}

