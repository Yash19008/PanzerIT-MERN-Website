# Panzer IT — Frontend

> **Make IT Secure** — Public website for [panzerit.com](https://panzerit.com)

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml                   # auto-generated at build time
│
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Root component + router
│   │
│   ├── pages/                        # One file per route — no business logic
│   │   ├── Home.jsx                  # / — hero, brands marquee, solutions grid, blog preview
│   │   ├── About.jsx                 # /about
│   │   ├── Solutions.jsx             # /solutions — all solutions listing
│   │   ├── SolutionDetail.jsx        # /solutions/:slug — single solution page
│   │   ├── Brands.jsx                # /brands — all brands listing
│   │   ├── BrandDetail.jsx           # /brands/:slug — single brand/vendor page
│   │   ├── Blog.jsx                  # /blog — paginated blog listing
│   │   ├── BlogPost.jsx              # /blog/:slug — single blog post
│   │   ├── Downloads.jsx             # /downloads — downloadable resources
│   │   ├── Contact.jsx               # /contact — contact form
│   │   └── NotFound.jsx              # 404 fallback
│   │
│   ├── components/                   # Reusable UI, grouped by feature
│   │   ├── layout/
│   │   │   ├── Navbar.jsx            # Top navigation with mobile menu
│   │   │   ├── Footer.jsx            # Footer with links, contact, social
│   │   │   └── MainLayout.jsx        # Wraps all public pages
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.jsx              # Hero section with GSAP animation
│   │   │   ├── BrandsMarquee.jsx     # Infinite scrolling brand logo strip
│   │   │   ├── SolutionsGrid.jsx     # Solutions preview cards
│   │   │   ├── StatsBar.jsx          # Animated numbers / achievements
│   │   │   ├── BlogPreview.jsx       # Latest 3 blog posts
│   │   │   └── ContactCTA.jsx        # Call-to-action banner
│   │   │
│   │   ├── solutions/
│   │   │   ├── SolutionCard.jsx      # Card used in grid listing
│   │   │   └── SolutionFeatures.jsx  # Features bullet list on detail page
│   │   │
│   │   ├── brands/
│   │   │   ├── BrandCard.jsx         # Card used in brands listing
│   │   │   └── BrandHeader.jsx       # Logo + tagline on brand detail page
│   │   │
│   │   ├── blog/
│   │   │   ├── PostCard.jsx          # Blog listing card
│   │   │   ├── PostContent.jsx       # Renders TipTap HTML safely (DOMPurify)
│   │   │   └── TagFilter.jsx         # Tag-based filter chips
│   │   │
│   │   ├── downloads/
│   │   │   └── DownloadCard.jsx      # Download card with file info + CTA
│   │   │
│   │   ├── contact/
│   │   │   └── ContactForm.jsx       # Contact form → POST /api/leads
│   │   │
│   │   └── ui/                       # Generic reusable atoms
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── Spinner.jsx
│   │       ├── Pagination.jsx
│   │       ├── SEOHead.jsx           # React Helmet Async wrapper
│   │       ├── ErrorBoundary.jsx
│   │       └── SectionWrapper.jsx    # Consistent section padding + max-width
│   │
│   ├── hooks/                        # Custom React hooks — all data fetching lives here
│   │   ├── useSettings.js            # Fetches global site settings (nav, SEO, social)
│   │   ├── usePosts.js               # Blog post fetching + pagination
│   │   ├── useSolutions.js           # Solutions fetching + filtering
│   │   ├── useBrands.js              # Brands fetching + featured filter
│   │   └── useDownloads.js           # Downloads fetching + category filter
│   │
│   ├── lib/                          # Third-party config
│   │   └── axios.js                  # Axios instance with VITE_API_URL base URL
│   │
│   ├── utils/                        # Pure helper functions — no side effects
│   │   ├── formatDate.js             # Date formatting (en-IN locale)
│   │   ├── readTime.js               # Read time display ("5 min read")
│   │   └── sanitizeHtml.js           # DOMPurify wrapper for TipTap HTML output
│   │
│   └── styles/
│       ├── index.css                 # Tailwind base + global resets
│       └── animations.css            # GSAP + custom keyframe classes
│
├── index.html
├── vite.config.js                    # Vite + prerender + sitemap plugins
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Home.jsx` | Hero, brands marquee, solutions preview, latest posts, CTA |
| `/about` | `About.jsx` | Company info, mission statement, team |
| `/solutions` | `Solutions.jsx` | All published solutions as filterable cards |
| `/solutions/:slug` | `SolutionDetail.jsx` | Full solution page with features list |
| `/brands` | `Brands.jsx` | All published brands as cards |
| `/brands/:slug` | `BrandDetail.jsx` | Full vendor product detail page |
| `/blog` | `Blog.jsx` | Paginated blog listing with tag filter |
| `/blog/:slug` | `BlogPost.jsx` | Single post with JSON-LD Article schema |
| `/downloads` | `Downloads.jsx` | Downloadable resources listing |
| `/contact` | `Contact.jsx` | Contact form (submits to POST /api/leads) |
| `*` | `NotFound.jsx` | 404 fallback page |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Animations | GSAP 3 |
| HTTP | Axios |
| SEO | React Helmet Async |
| HTML Safety | DOMPurify |
| Build plugins | vite-plugin-prerender, vite-plugin-sitemap |

---

## Key Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "react-helmet-async": "^2.x",
  "axios": "^1.x",
  "gsap": "^3.x",
  "dompurify": "^3.x",
  "tailwindcss": "^3.x",
  "vite-plugin-prerender": "^x.x",
  "vite-plugin-sitemap": "^x.x"
}
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

---

## Getting Started

```bash
# Install dependencies
cd frontend && npm install

# Copy environment file
cp .env.example .env

# Start dev server (port 5173)
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build with prerender + sitemap |
| `npm run preview` | Preview production build locally |

---

## SEO Strategy

- **React Helmet Async** — per-page dynamic `<title>`, `<meta description>`, canonical, and OG tags via the `SEOHead` component
- **vite-plugin-prerender** — generates static HTML for every route at build time so crawlers always see real content (not a blank React shell)
- **vite-plugin-sitemap** — auto-generates `sitemap.xml` on every production build
- **JSON-LD structured data** — Organization schema on home page, Article schema on every blog post

### SEOHead usage

```jsx
<SEOHead
  title="Firewall Setup — Panzer IT"
  description="Enterprise firewall solutions for Indian businesses."
  ogImage="https://panzerit.com/uploads/images/firewall.webp"
  canonical="https://panzerit.com/solutions/firewall-setup"
  jsonLd={{ "@type": "Article", ... }}
/>
```

---

## GSAP Animation Plan

| Section | Animation |
|---|---|
| Hero | Text stagger reveal + fade-in on load |
| Brands Marquee | Infinite horizontal scroll loop (`gsap.to`) |
| Solutions Grid | Staggered card entrance triggered on scroll |
| Stats Bar | Count-up numbers when section enters viewport |
| Page transitions | Fade in on route enter |

All scroll-triggered animations use `ScrollTrigger` plugin. Animations respect `prefers-reduced-motion`.

---

## Folder Conventions

| Folder | Rule |
|---|---|
| `pages/` | One file per route. No API calls, no business logic — composition only |
| `components/` | Reusable UI grouped by feature. No direct API calls |
| `hooks/` | All data fetching lives here — one hook per resource |
| `lib/` | Third-party config only (Axios instance) |
| `utils/` | Pure functions with no side effects |
| `styles/` | Global CSS only — component styles via Tailwind classes |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|---|---|---|
| `GET` | `/api/settings` | `useSettings` — nav, footer, SEO defaults |
| `GET` | `/api/posts` | `usePosts` — blog listing |
| `GET` | `/api/posts/:slug` | `usePosts` — single post |
| `GET` | `/api/solutions` | `useSolutions` — solutions listing |
| `GET` | `/api/solutions/:slug` | `useSolutions` — single solution |
| `GET` | `/api/brands` | `useBrands` — brands listing + homepage marquee |
| `GET` | `/api/brands/:slug` | `useBrands` — single brand page |
| `GET` | `/api/downloads` | `useDownloads` — downloads listing |
| `GET` | `/api/downloads/:slug/file` | `DownloadCard` — tracked file download |
| `POST` | `/api/leads` | `ContactForm` — contact form submission |

---

*© 2026 Panzer IT. Developed By CodeSpine — all rights reserved.*