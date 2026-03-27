# Panzer IT — Website Revamp

> **Make IT Secure** — Official website, admin panel & backend API for [panzerit.com](https://panzerit.com)

> Developed by **CodeSpine** — full-stack implementation for PanzerIT, including frontend, admin UI, backend API, and deployment hardening.

---

## Project Structure

```
panzerit/
├── backend/      # Node.js + Express REST API
├── frontend/     # React + Vite  (public website)
├── admin/        # React + Vite  (admin panel)
├── .env.example
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS, GSAP |
| Admin    | React 18, Vite, React Router v6, TipTap, React Query, Zustand |
| Backend  | Node.js, Express.js, MongoDB, Mongoose          |
| Auth     | JWT + bcrypt                                    |
| Email    | Nodemailer (SMTP)                               |
| Uploads  | Multer                                          |
| SEO      | React Helmet Async, vite-plugin-prerender, vite-plugin-sitemap |

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- MongoDB (local or Atlas)
- Git

---

### 1. Clone the repo

```bash
git clone https://github.com/your-org/panzerit.git
cd panzerit
```

---

### 2. Environment setup

Copy the example env file and fill in your values:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
cp .env.example admin/.env
```

See [Environment Variables](#environment-variables) below for all required keys.

---

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install
```

---

### 4. Run in development

Open three terminals (or use a process manager like `concurrently`):

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend public site (port 5173)
cd frontend
npm run dev

# Terminal 3 — Admin panel (port 5174)
cd admin
npm run dev
```

| App      | URL                        |
|----------|----------------------------|
| Backend  | http://localhost:5000      |
| Frontend | http://localhost:5173      |
| Admin    | http://localhost:5174      |

---

### 5. Seed admin user

Before using the admin panel, create the first admin account:

```bash
cd backend
npm run seed:admin
```

Default credentials (change immediately after first login):

```
Email:    admin@panzerit.com
Password: Admin@1234
```

---

## Environment Variables

Create a `.env` file in each app based on `.env.example`.

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/panzerit

# JWT
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
LEAD_NOTIFY_EMAIL=admin@panzerit.com

# File uploads
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10mb

# CORS origins
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

### Admin (`admin/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Scripts

### Backend

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start with nodemon (hot reload)    |
| `npm start`         | Start in production                |
| `npm run seed:admin`| Create first admin user            |

### Frontend & Admin

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start dev server                         |
| `npm run build`   | Production build (with prerender for frontend) |
| `npm run preview` | Preview production build locally         |

---

## API Overview

Base URL: `http://localhost:5000/api`

### Public endpoints (no auth)

| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| POST   | `/leads`               | Submit contact form    |
| GET    | `/posts`               | List all blog posts    |
| GET    | `/posts/:slug`         | Single blog post       |
| GET    | `/solutions`           | List all solutions     |
| GET    | `/solutions/:slug`     | Single solution        |
| GET    | `/brands`              | List all brands        |
| GET    | `/brands/:slug`        | Single brand           |
| GET    | `/downloads`           | List all downloads     |
| GET    | `/settings`            | Site-wide settings     |

### Auth endpoints

| Method | Endpoint               | Description            |
|--------|------------------------|------------------------|
| POST   | `/auth/login`          | Admin login → JWT      |
| POST   | `/auth/logout`         | Invalidate session     |
| PUT    | `/auth/password`       | Change password        |

### Admin endpoints (JWT required)

All CRUD operations for leads, posts, solutions, brands, downloads, media, and settings. See `backend/src/routes/` for full details.

---

## Admin Panel Modules

| Module            | Route               |
|-------------------|---------------------|
| Dashboard         | `/dashboard`        |
| Leads inbox       | `/leads`            |
| Blog posts        | `/posts`            |
| Solutions         | `/solutions`        |
| Brands            | `/brands`           |
| Downloads         | `/downloads`        |
| Media library     | `/media`            |
| Site settings     | `/settings`         |
| SEO settings      | `/settings/seo`     |

---

## Deployment

### Backend
Deploy to any Node.js host — **Railway**, **Render**, or a plain **VPS**.

```bash
cd backend
npm start
```

### Frontend & Admin
Both are static builds. Deploy to **Vercel**, **Netlify**, or any static host.

```bash
# Frontend (includes prerender step for SEO)
cd frontend && npm run build

# Admin
cd admin && npm run build
```

> **Important:** Set all `VITE_` environment variables in your hosting platform's dashboard before building.

---

## SEO

The public frontend uses the following for SEO:

- **React Helmet Async** — dynamic `<title>`, `<meta>`, canonical, and OG tags per page
- **vite-plugin-prerender** — generates static HTML for every route at build time so crawlers see real content
- **vite-plugin-sitemap** — auto-generates `sitemap.xml` on build
- **JSON-LD structured data** — Organization schema on home, Article schema on blog posts

---

## Folder Conventions

- `pages/` — one file per route, no business logic
- `components/` — reusable UI, grouped by feature
- `hooks/` — custom React hooks only
- `lib/` — third-party config (Axios instance, React Query client)
- `store/` — Zustand stores (admin only)
- `utils/` — pure helper functions (backend)
- `middleware/` — Express middleware (backend)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with clear messages: `git commit -m "feat: add leads export to CSV"`
3. Push and open a pull request

---

## Team

| Name   | Role                  |
|--------|-----------------------|
| Yash   | Full-stack developer  |
| Adarsh | Frontend developer    |

---

## License

Developed By CodeSpine — © 2026 Panzer IT. All rights reserved.