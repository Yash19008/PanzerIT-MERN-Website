'use server'

import pool from '@/lib/db'
import { cache } from 'react'

type HeaderSolution = {
  label: string
  logo?: string
  menuIcon?: string
  logoAlt: string
  icon: string
  href: string
}

type HeaderBrand = {
  label: string
  logo?: string
  menuIcon?: string
  icon?: string
  href: string
}

export type HeaderData = {
  solutions: HeaderSolution[]
  brands: HeaderBrand[]
  logoData: { logoUrl: string; logoAlt: string; logoWidth: number }
}

let columnsEnsured = false
async function ensureMenuIconColumns() {
  if (columnsEnsured) return
  try {
    const [solCols] = await pool.query<any[]>("SHOW COLUMNS FROM solutions LIKE 'menu_icon'")
    if (solCols.length === 0) {
      await pool.query("ALTER TABLE solutions ADD COLUMN menu_icon VARCHAR(500) NULL AFTER logo_alt")
    }
    const [brandCols] = await pool.query<any[]>("SHOW COLUMNS FROM brands LIKE 'menu_icon'")
    if (brandCols.length === 0) {
      await pool.query("ALTER TABLE brands ADD COLUMN menu_icon VARCHAR(500) NULL AFTER logo_alt")
    }
    columnsEnsured = true
  } catch (e) {
    // Ignore schema inspection error if DB restricted
  }
}

/**
 * Optimized header data query - only fetches minimal fields needed for navigation
 */
async function fetchHeaderData(): Promise<HeaderData> {
  await ensureMenuIconColumns()

  // Single optimized query for header navigation
  const [solutionsRows] = await pool.query(`
    SELECT id, title, slug, logo, logo_alt, menu_icon
    FROM solutions 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 20
  `)

  const [brandsRows] = await pool.query(`
    SELECT id, name, slug, logo, menu_icon
    FROM brands 
    WHERE status = 'active'
    ORDER BY sort_order ASC
    LIMIT 30
  `)

  const [settingsRows] = await pool.query<any[]>(`
    SELECT value 
    FROM site_settings 
    WHERE \`key\` = 'PANZER_HEADER_SETTINGS'
  `)

  const logoData = settingsRows[0]?.value 
    ? JSON.parse(settingsRows[0].value)
    : { logoUrl: '', logoAlt: 'Header Logo', logoWidth: 140 }

  const sanitizeImage = (url: string | undefined | null) => {
    if (!url) return url;
    if (url.startsWith('data:image/') && url.length > 50000) {
      console.warn('Sanitizing massive base64 image URL in header to prevent payload explosions');
      return undefined;
    }
    return url;
  }

  return {
    solutions: (solutionsRows as any[]).map(s => {
      const sanitizedMenuIcon = sanitizeImage(s.menu_icon) || undefined;
      return {
        label: s.title,
        logo: sanitizeImage(s.logo) || undefined,
        menuIcon: sanitizedMenuIcon,
        logoAlt: s.logo_alt || s.title,
        icon: s.menu_icon || "fa-shield-check",
        href: `/solution/${s.slug}`
      };
    }),
    brands: (brandsRows as any[]).map(b => {
      const sanitizedMenuIcon = sanitizeImage(b.menu_icon) || undefined;
      return {
        label: b.name,
        logo: sanitizeImage(b.logo) || undefined,
        menuIcon: sanitizedMenuIcon,
        icon: b.menu_icon || "fa-shield-check",
        href: `/brand/${b.slug}`
      };
    }),
    logoData
  }
}

export const getHeaderData = cache(fetchHeaderData)
