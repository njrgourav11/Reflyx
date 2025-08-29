import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reflyx-ai.vercel.app'
  const lastModified = new Date()

  // Minimal, controlled sitemap for key pages only
  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    { url: `${baseUrl}/features`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/docs`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/demo`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ]
}

