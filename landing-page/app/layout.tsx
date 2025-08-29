import './globals.css'
import type { Metadata } from 'next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LoadingProvider from '../components/LoadingProvider'
import Script from 'next/script'

// Read from environment (configure in .env/.env.local)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || ''
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reflyx-ai.vercel.app'

export const metadata: Metadata = { 
  title: 'Reflyx – Privacy-First AI Coding Assistant & GitHub Copilot Alternative',
  description:
    'Reflyx is an open-source, privacy-first AI coding assistant and VS Code extension. Features local AI processing with Ollama, semantic code search, real-time code explanations, completions, and intelligent code generation. Run AI offline, securely, and free — the best GitHub Copilot and Tabnine alternative for developers.',
  keywords: [
    // Brand + product
    'Reflyx AI coding assistant',
    'Reflyx VS Code extension',
    'Reflyx local AI',
    'Reflyx privacy-first AI',
    'Reflyx offline AI',
    'Reflyx code generation',
    'Reflyx semantic code search',
    'Reflyx developer tools',
    'Reflyx open source',
    'Reflyx Ollama integration',
    // Generic high-volume AI coding terms
    'AI coding assistant',
    'AI coding agent',
    'AI code generator',
    'VS Code AI extension',
    'local AI coding assistant',
    'offline AI coding assistant',
    'privacy-focused AI developer tools',
    'semantic code search AI',
    'code completion AI',
    'code explanation AI',
    'RAG for code',
    'vector search AI tools',
    // Competitor alternatives
    'GitHub Copilot alternative',
    'private Copilot alternative',
    'Tabnine alternative',
    // Tech-specific
    'TypeScript AI assistant',
    'Python AI assistant',
    'JavaScript AI assistant',
    'open source AI for developers',
    'MIT license AI tools',
    'offline AI code generation'
  ],
  authors: [{ name: 'Gourav', url: 'https://github.com/njrgourav11' }],
  creator: 'Gourav',
  publisher: 'Reflyx',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Reflyx – Privacy-First Local AI Coding Assistant for VS Code',
    description:
      'Reflyx is a secure, offline-capable AI coding assistant for VS Code with semantic code search, completions, and code generation. Free, open source, and a powerful GitHub Copilot alternative.',
    siteName: 'Reflyx',
    images: [
      {
        url: '/images/reflyx.png',
        width: 1200,
        height: 630,
        alt: 'Reflyx – Privacy-First Local AI Coding Assistant for VS Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reflyx – Privacy-First Local AI Coding Assistant for VS Code',
    description:
      'Open-source AI coding assistant with local processing, semantic search, and intelligent code generation. A privacy-focused Copilot alternative.',
    images: ['/images/reflyx.png'],
    creator: '@njrgourav11',
  },
  icons: {
    icon: [{ url: '/icons/favicon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.json',
  category: 'Developer Tools',
  classification: 'Software',
  verification: {
    ...(GSC_VERIFICATION ? { google: GSC_VERIFICATION } : {}),
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
};


const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Reflyx",
  "description": "Privacy-first AI coding assistant for VS Code with local AI processing, semantic code search, and intelligent code generation.",
  "url": "https://reflyx-ai.vercel.app",
  "downloadUrl": "https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": ["Windows", "macOS", "Linux"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "author": {
    "@type": "Person",
    "name": "Gourav",
    "url": "https://github.com/njrgourav11"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Reflyx"
  },
  "softwareVersion": "1.0.0",
  "datePublished": "2024-01-01",
  "license": "https://opensource.org/licenses/MIT",
  "programmingLanguage": ["TypeScript", "Python", "JavaScript", "Go", "Rust", "Java", "C++"],
  "featureList": [
    "Local AI Processing",
    "Semantic Code Search",
    "Multi-provider Support",
    "Real-time Code Explanations",
    "Intelligent Code Generation",
    "Privacy-first Design",
    "Offline Capability"
  ],
  "screenshot": "https://reflyx-ai.vercel.app/images/reflyx.png",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 antialiased">
        <LoadingProvider>
          <Header />
          {children}
          <Footer />
        </LoadingProvider>

        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        
        {/* Extra meta tags not in metadata API */}
        <Script
          id="meta-tags"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              const metaTheme = document.createElement('meta');
              metaTheme.name = 'theme-color';
              metaTheme.content = '#7C3AED';
              document.head.appendChild(metaTheme);

              const metaColorScheme = document.createElement('meta');
              metaColorScheme.name = 'color-scheme';
              metaColorScheme.content = 'light dark';
              document.head.appendChild(metaColorScheme);

              const link1 = document.createElement('link');
              link1.rel = 'preconnect';
              link1.href = 'https://fonts.googleapis.com';
              document.head.appendChild(link1);

              const link2 = document.createElement('link');
              link2.rel = 'preconnect';
              link2.href = 'https://fonts.gstatic.com';
              link2.crossOrigin = 'anonymous';
              document.head.appendChild(link2);
            `,
          }}
        />
      </body>
    </html>
  );
}
