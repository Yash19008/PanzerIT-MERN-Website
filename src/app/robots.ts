import { MetadataRoute } from 'next';

import { getSiteUrl } from '@/utils/metadata';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/admin/',
        '/auth/'
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
