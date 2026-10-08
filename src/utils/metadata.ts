import { Metadata } from 'next';

/**
 * Adds the "Make 'IT' Secure" tagline to page titles
 * @param title - The base page title (e.g., "About Us")
 * @returns Formatted title with company name and tagline (e.g., "About Us | Panzer IT | Make 'IT' Secure")
 */
export function formatPageTitle(title: string | undefined | null): string {
  if (!title) {
    return "Panzer IT | Make 'IT' Secure";
  }

  return title;
}

/**
 * Returns the site URL from environment variable without trailing slash.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://panzerit.com';
  return url.replace(/\/+$/, '');
}

/**
 * Creates metadata object with formatted title, OpenGraph, Twitter card, and canonical URL
 * @param seoData - SEO data from database
 * @param canonicalPath - Canonical URL path (e.g., '/about')
 * @returns Metadata object
 */
export function createPageMetadata(
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  },
  canonicalPath: string
): Metadata {
  const title = formatPageTitle(seoData.metaTitle);
  const description = seoData.metaDescription;
  const image = seoData.ogImage;

  return {
    title,
    description,
    keywords: seoData.metaKeywords,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}
