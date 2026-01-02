import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/buildings/',
          '/doors/',
          '/inspections/',
          '/defects/',
          '/contractors/',
          '/calendar/',
          '/reports/',
          '/qr-codes/',
          '/settings/',
          '/admin/',
          '/csv/',
        ],
      },
      {
        userAgent: '*',
        allow: [
          '/login',
          '/register',
          '/privacy-policy',
          '/terms-of-service',
          '/cookie-policy',
          '/acceptable-use-policy',
        ],
      },
    ],
    sitemap: 'https://doorcompliance.co.uk/sitemap.xml',
  }
}
