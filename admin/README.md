# Panzer IT — Admin Panel

> **Make IT Secure** — Internal admin panel for managing panzerit.com content

---

## Project Structure

```
admin/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Root with router + React Query provider
│   │
│   ├── pages/                        # One file per route — no business logic
│   │   ├── Login.jsx                 # /login — JWT auth form
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx         # /dashboard — stats overview + recent leads
│   │   │
│   │   ├── leads/
│   │   │   ├── Leads.jsx             # /leads — filterable inbox table
│   │   │   └── LeadDetail.jsx        # /leads/:id — single lead + status/notes update
│   │   │
│   │   ├── posts/
│   │   │   ├── Posts.jsx             # /posts — posts table with status filter
│   │   │   ├── PostCreate.jsx        # /posts/create — TipTap editor form
│   │   │   └── PostEdit.jsx          # /posts/:id/edit — pre-filled editor form
│   │   │
│   │   ├── solutions/
│   │   │   ├── Solutions.jsx         # /solutions — drag-and-drop sortable table
│   │   │   ├── SolutionCreate.jsx    # /solutions/create
│   │   │   └── SolutionEdit.jsx      # /solutions/:id/edit
│   │   │
│   │   ├── brands/
│   │   │   ├── Brands.jsx            # /brands — table with featured toggle
│   │   │   ├── BrandCreate.jsx       # /brands/create — TipTap editor form
│   │   │   └── BrandEdit.jsx         # /brands/:id/edit
│   │   │
│   │   ├── downloads/
│   │   │   ├── Downloads.jsx         # /downloads — table with download count
│   │   │   ├── DownloadCreate.jsx    # /downloads/create — file upload form
│   │   │   └── DownloadEdit.jsx      # /downloads/:id/edit
│   │   │
│   │   ├── media/
│   │   │   └── Media.jsx             # /media — grid library with folder browser
│   │   │
│   │   └── settings/
│   │       ├── Settings.jsx          # /settings — tabbed: general, contact, social, scripts, maintenance
│   │       └── SeoSettings.jsx       # /settings/seo — meta defaults + JSON-LD org schema
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx       # Sidebar + topbar shell (wraps all protected pages)
│   │   │   ├── Sidebar.jsx           # Navigation links — role-aware (hides Settings from editors)
│   │   │   └── Topbar.jsx            # Breadcrumb, user avatar, logout button
│   │   │
│   │   ├── editor/
│   │   │   ├── RichTextEditor.jsx    # TipTap editor wrapper with all extensions
│   │   │   ├── EditorToolbar.jsx     # Bold, italic, H1–H4, lists, link, image, YouTube
│   │   │   └── MediaPicker.jsx       # Modal — opens media library for image insertion
│   │   │
│   │   ├── media/
│   │   │   ├── MediaGrid.jsx         # Image/file grid with single or multi-select state
│   │   │   ├── MediaUploader.jsx     # Drag-and-drop upload zone (single + bulk)
│   │   │   └── FolderBrowser.jsx     # Folder sidebar with item counts
│   │   │
│   │   ├── leads/
│   │   │   ├── LeadsTable.jsx        # Sortable, filterable table with status chips
│   │   │   └── StatusBadge.jsx       # Coloured pill: new / contacted / qualified / lost
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx         # Metric card (total, last 7 days, last 30 days)
│   │   │   └── RecentLeads.jsx       # Latest 5 leads quick-view widget
│   │   │
│   │   └── ui/                       # Generic reusable atoms
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Textarea.jsx
│   │       ├── Toggle.jsx            # Boolean field (isFeatured, maintenance.enabled)
│   │       ├── Modal.jsx
│   │       ├── Table.jsx             # Generic sortable + paginated table
│   │       ├── Pagination.jsx
│   │       ├── Spinner.jsx
│   │       ├── Toast.jsx             # Success / error notification (top-right)
│   │       ├── ConfirmDialog.jsx     # "Are you sure?" delete confirmation modal
│   │       ├── ImageUpload.jsx       # Cover image upload field with preview
│   │       └── SlugInput.jsx         # Auto-generates slug from title, manually editable
│   │
│   ├── hooks/                        # React Query hooks — all data fetching lives here
│   │   ├── useAuth.js                # Auth state, login action, logout action
│   │   ├── useLeads.js               # getLeads, getLead, updateLead, deleteLead, getLeadStats
│   │   ├── usePosts.js               # getAdminPosts, getAdminPost, createPost, updatePost, deletePost
│   │   ├── useSolutions.js           # getAdminSolutions, createSolution, updateSolution, reorderSolutions
│   │   ├── useBrands.js              # getAdminBrands, createBrand, updateBrand, toggleFeatured, reorderBrands
│   │   ├── useDownloads.js           # getAdminDownloads, createDownload, updateDownload, deleteDownload
│   │   ├── useMedia.js               # getMedia, uploadMedia, uploadBulk, updateMedia, deleteMedia, bulkDelete
│   │   └── useSettings.js            # getAdminSettings, updateGeneral, updateContact, updateSocial, updateSeo
│   │
│   ├── lib/
│   │   ├── axios.js                  # Axios instance — auto-attaches JWT from authStore
│   │   └── queryClient.js            # React Query client — staleTime and retry config
│   │
│   ├── store/
│   │   ├── authStore.js              # Zustand — user object, token, isAuthenticated
│   │   └── uiStore.js                # Zustand — sidebar collapsed state, active modal
│   │
│   ├── utils/
│   │   ├── formatDate.js             # Date formatting (en-IN locale)
│   │   ├── formatBytes.js            # File size display ("1.2 MB", "340 KB")
│   │   └── validators.js             # Shared form validation helpers
│   │
│   └── styles/
│       └── index.css                 # Tailwind base + admin-specific overrides
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | `Login.jsx` | Public |
| `/dashboard` | `Dashboard.jsx` | Admin, Editor |
| `/leads` | `Leads.jsx` | Admin, Editor |
| `/leads/:id` | `LeadDetail.jsx` | Admin, Editor |
| `/posts` | `Posts.jsx` | Admin, Editor |
| `/posts/create` | `PostCreate.jsx` | Admin, Editor |
| `/posts/:id/edit` | `PostEdit.jsx` | Admin, Editor |
| `/solutions` | `Solutions.jsx` | Admin, Editor |
| `/solutions/create` | `SolutionCreate.jsx` | Admin, Editor |
| `/solutions/:id/edit` | `SolutionEdit.jsx` | Admin, Editor |
| `/brands` | `Brands.jsx` | Admin, Editor |
| `/brands/create` | `BrandCreate.jsx` | Admin, Editor |
| `/brands/:id/edit` | `BrandEdit.jsx` | Admin, Editor |
| `/downloads` | `Downloads.jsx` | Admin, Editor |
| `/downloads/create` | `DownloadCreate.jsx` | Admin, Editor |
| `/downloads/:id/edit` | `DownloadEdit.jsx` | Admin, Editor |
| `/media` | `Media.jsx` | Admin, Editor |
| `/settings` | `Settings.jsx` | Admin only |
| `/settings/seo` | `SeoSettings.jsx` | Admin only |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Server state | TanStack React Query v5 |
| Client state | Zustand v4 |
| Forms | React Hook Form v7 |
| Rich text editor | TipTap v2 |
| Drag-and-drop | react-beautiful-dnd |
| Styling | Tailwind CSS |
| HTTP | Axios |

---

## Key Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-image": "^2.x",
  "@tiptap/extension-link": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-character-count": "^2.x",
  "@tiptap/extension-youtube": "^2.x",
  "react-beautiful-dnd": "^13.x",
  "tailwindcss": "^3.x"
}
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Getting Started

```bash
# Install dependencies
cd admin && npm install

# Copy environment file
cp .env.example .env

# Start dev server (port 5174)
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5174 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

---

## Auth Flow

```
1. User submits login form (email + password)
2. POST /api/auth/login → { success, token, data: { user } }
3. Token + user saved to Zustand authStore + localStorage
4. Axios interceptor auto-attaches: Authorization: Bearer <token>
5. React Router protected routes check authStore.isAuthenticated
6. On any 401 response → Axios interceptor clears store → redirects to /login
7. On logout → POST /api/auth/logout → clear store + localStorage → /login
```

---

## React Query Strategy

| Data type | staleTime | Notes |
|---|---|---|
| Leads | `0` | Always fresh — inbox must be real-time |
| Posts | `30s` | Moderate — changes are deliberate |
| Solutions | `60s` | Rarely changes |
| Brands | `60s` | Rarely changes |
| Downloads | `60s` | Rarely changes |
| Media | `30s` | May change after bulk upload |
| Settings | `120s` | Very rarely changes |
| Lead stats | `60s` | Dashboard widget |

**Optimistic updates** — status/featured toggles update the UI instantly and roll back on API error.

**Cache invalidation** — after every create, update, or delete mutation the relevant query key is invalidated so the list refetches automatically.

---

## TipTap Editor Extensions

| Extension | Purpose |
|---|---|
| `StarterKit` | Bold, italic, headings H1–H4, bullet/ordered lists, blockquote, code block, horizontal rule |
| `Image` | Insert images from the media library picker |
| `Link` | Clickable links with configurable `target=_blank` |
| `Placeholder` | Greyed placeholder text in empty editor |
| `CharacterCount` | Live word + character count in toolbar |
| `Youtube` | Embed YouTube videos by pasting a URL |

---

## Role Permissions Summary

| Action | Admin | Editor |
|---|---|---|
| View dashboard | ✅ | ✅ |
| View / update leads | ✅ | ✅ |
| Delete leads | ✅ | ❌ |
| Create / edit posts | ✅ | ✅ |
| Delete posts | ✅ | ❌ |
| Create / edit solutions | ✅ | ✅ |
| Reorder solutions | ✅ | ❌ |
| Delete solutions | ✅ | ❌ |
| Create / edit brands | ✅ | ✅ |
| Reorder / feature brands | ✅ | ❌ |
| Delete brands | ✅ | ❌ |
| Create / edit downloads | ✅ | ✅ |
| Delete downloads | ✅ | ❌ |
| Upload / manage media | ✅ | ✅ |
| Bulk delete media | ✅ | ❌ |
| View / edit settings | ✅ | ❌ |

---

## API Endpoints Used

| Method | Endpoint | Used by |
|---|---|---|
| `POST` | `/api/auth/login` | `Login.jsx` |
| `GET` | `/api/auth/me` | `authStore` on app load |
| `POST` | `/api/auth/logout` | `Topbar` logout button |
| `PUT` | `/api/auth/password` | Settings > Change password |
| `GET` | `/api/leads` | `useLeads` |
| `GET` | `/api/leads/stats` | `useLeads` — dashboard |
| `GET` | `/api/leads/:id` | `useLeads` |
| `PATCH` | `/api/leads/:id` | `useLeads` — status/notes |
| `DELETE` | `/api/leads/:id` | `useLeads` |
| `GET` | `/api/posts/admin` | `usePosts` |
| `GET` | `/api/posts/admin/:id` | `usePosts` |
| `POST` | `/api/posts` | `usePosts` |
| `PUT` | `/api/posts/:id` | `usePosts` |
| `DELETE` | `/api/posts/:id` | `usePosts` |
| `GET` | `/api/solutions/admin` | `useSolutions` |
| `POST` | `/api/solutions` | `useSolutions` |
| `PUT` | `/api/solutions/:id` | `useSolutions` |
| `PATCH` | `/api/solutions/reorder` | `useSolutions` |
| `DELETE` | `/api/solutions/:id` | `useSolutions` |
| `GET` | `/api/brands/admin` | `useBrands` |
| `POST` | `/api/brands` | `useBrands` |
| `PUT` | `/api/brands/:id` | `useBrands` |
| `PATCH` | `/api/brands/reorder` | `useBrands` |
| `PATCH` | `/api/brands/:id/featured` | `useBrands` |
| `DELETE` | `/api/brands/:id` | `useBrands` |
| `GET` | `/api/downloads/admin` | `useDownloads` |
| `POST` | `/api/downloads` | `useDownloads` |
| `PUT` | `/api/downloads/:id` | `useDownloads` |
| `DELETE` | `/api/downloads/:id` | `useDownloads` |
| `GET` | `/api/media` | `useMedia` |
| `GET` | `/api/media/folders` | `useMedia` |
| `POST` | `/api/media` | `useMedia` |
| `POST` | `/api/media/bulk` | `useMedia` |
| `PATCH` | `/api/media/:id` | `useMedia` |
| `DELETE` | `/api/media/:id` | `useMedia` |
| `DELETE` | `/api/media/bulk` | `useMedia` |
| `GET` | `/api/settings/admin` | `useSettings` |
| `PATCH` | `/api/settings/general` | `useSettings` |
| `PATCH` | `/api/settings/contact` | `useSettings` |
| `PATCH` | `/api/settings/social` | `useSettings` |
| `PATCH` | `/api/settings/seo` | `useSettings` |
| `PATCH` | `/api/settings/scripts` | `useSettings` |
| `PATCH` | `/api/settings/maintenance` | `useSettings` |

---

## Folder Conventions

| Folder | Rule |
|---|---|
| `pages/` | One file per route. No API calls, no business logic — composition only |
| `components/` | Reusable UI grouped by feature. No direct API calls |
| `hooks/` | All data fetching and mutations live here — one hook file per resource |
| `lib/` | Third-party config only (Axios instance, React Query client) |
| `store/` | Zustand stores only — auth state + UI state |
| `utils/` | Pure functions with no side effects |
| `styles/` | Global CSS only — component styles via Tailwind classes |

---

*© 2026 Panzer IT. Developed By CodeSpine — all rights reserved.*