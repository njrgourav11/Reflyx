import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reflyx – Privacy-First AI Coding Assistant for VS Code | Local AI Processing',
  description:
    'Reflyx is a modern, privacy-first AI coding assistant for VS Code. Features local AI processing with Ollama, semantic code search, multi-provider support (OpenAI, Anthropic, Google), and real-time code explanations. Free, open-source, and offline-capable.',
  keywords: [
    'AI coding assistant',
    'VS Code extension',
    'local AI',
    'privacy-first',
    'semantic code search',
    'Ollama',
    'offline AI',
    'code completion',
    'code explanation',
    'developer tools',
    'TypeScript',
    'Python',
    'JavaScript',
    'open source',
    'MIT license',
    'code generation',
    'RAG',
    'vector search',
    'GitHub Copilot alternative',
    'Tabnine alternative'
  ],
  authors: [{ name: 'Gourav', url: 'https://github.com/njrgourav11' }],
  creator: 'Gourav',
  publisher: 'Reflyx',
  metadataBase: new URL('https://reflyx.dev'),
  alternates: {
    canonical: 'https://reflyx.dev',
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
    url: 'https://reflyx.dev',
    title: 'Reflyx – Privacy-First AI Coding Assistant for VS Code',
    description: 'Local AI processing, semantic code search, and intelligent code generation. Free, open-source, and privacy-focused alternative to GitHub Copilot.',
    siteName: 'Reflyx',
    images: [
      {
        url: '/images/reflyx.png',
        width: 1200,
        height: 630,
        alt: 'Reflyx AI Coding Assistant - Privacy-first local AI for VS Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reflyx – Privacy-First AI Coding Assistant for VS Code',
    description: 'Local AI processing, semantic code search, and intelligent code generation. Free and open-source.',
    images: ['/images/reflyx.png'],
    creator: '@njrgourav11',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  category: 'Developer Tools',
  classification: 'Software',
  other: {
    'google-site-verification': 'your-google-verification-code', // Replace with actual verification code
    'msvalidate.01': 'your-bing-verification-code', // Replace with actual verification code
  },
};

import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingProvider from '../components/LoadingProvider';
import Script from 'next/script';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Reflyx",
  "description": "Privacy-first AI coding assistant for VS Code with local AI processing, semantic code search, and intelligent code generation.",
  "url": "https://reflyx.dev",
  "downloadUrl": "https://marketplace.visualstudio.com/items?itemName=GouravB.reflyx",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": ["Windows", "macOS", "Linux"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
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
  "screenshot": "https://reflyx.dev/images/reflyx.png",
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
      </body>
    </html>
  );
}

