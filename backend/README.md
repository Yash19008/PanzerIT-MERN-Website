# Panzer IT — Backend API Documentation

A **production-grade REST API backend** for Panzer IT's cybersecurity solutions platform. Built with Express.js, MongoDB, Node.js 18+, and architected with security-first, scalability-first principles for enterprise-level operations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Security Implementation](#security-implementation)
- [Performance & Scalability](#performance--scalability)
- [Error Handling & Resilience](#error-handling--resilience)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [File Uploads](#file-uploads)
- [Email Notifications](#email-notifications)
- [Deployment](#deployment)
- [Development](#development)

---

## Overview

Panzer IT Backend provides a secure, scalable API for managing:

- **Blog Posts** — Content management with SEO, drafts, publishing workflow
- **Solutions & Services** — Cybersecurity offerings with reordering and categories
- **Brands/Partners** — Vendor integrations and product partnerships
- **Lead Management** — Contact form submissions with auto-reply, spam detection, admin notifications
- **Downloads** — Resource distribution (whitepapers, datasheets, brochures) with download tracking
- **Admin Users** — Role-based access control (admin, editor) with JWT authentication
- **Media Library** — Image resizing, optimization, document storage with web-safe file format conversion

**All endpoints** are secured with industry-standard practices: rate limiting, input validation, XSS/SQL injection protection, CORS policies, and comprehensive error handling.

---

## Architecture & Tech Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | High-concurrency async/await JavaScript runtime |
| **Framework** | Express.js 4.19+ | Lightweight, production-proven HTTP server |
| **Database** | MongoDB 5+ with Mongoose 8+ | Document store with schema validation + indexes |
| **Auth** | JWT (jsonwebtoken) + bcrypt | Stateless authentication, password hashing |
| **Validation** | express-validator 7+ | Input sanitization and validation rules |
| **Security** | Helmet, mongo-sanitize, xss-clean, hpp | Defense-in-depth headers, NoSQL injection protection, XSS prevention, HTTP parameter pollution prevention |
| **Rate Limiting** | express-rate-limit 7.3+ | DDoS/brute-force attack mitigation |
| **Logging** | Winston 3.13+ | Structured logging with daily file rotation and archival |
| **File Uploads** | Multer 1.4.5+, Sharp 0.33+ | Multipart form data handling, image optimization (WebP conversion) |
| **Email** | Nodemailer 6.9+ | SMTP integration for transactional emails |
| **Compression** | Compression 1.7+ | gzip payload compression for 30–50% smaller responses |

### Architectural Principles

✅ **Separation of Concerns** — Routes → Controllers → Models with clear boundaries
✅ **DRY Code** — Reusable utilities (AppError, asyncHandler, APIFeatures, slugify)
✅ **Async-First** — Promise-based, no callback hell; proper error propagation
✅ **Middleware Stack** — Security → parsing → routes → error handling in correct order
✅ **Stateless** — No session state; JWT claims carry identity information
✅ **Environment-Driven** — All configuration via .env; 12-factor app compliance

---

## Security Implementation

### 1. **HTTP Headers & CORS** (server.js)

```javascript
✓ Helmet — Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
✓ CORS — Whitelist frontend origin, credentials allowed, strict SAME-SITE cookies
✓ HPP — HTTP Parameter Pollution prevention (duplicate param filtering)
✓ Content-Security-Policy ready (recommended addition for CSP in production)
```

**Rate Limiting:**
- Global: 200 req/15 minutes per IP (all routes)
- Auth endpoints: 20 attempts/15 minutes (stricter, login/password-change only)
- Lead submissions: 5 per hour per IP (form abuse prevention)

### 2. **Authentication & Authorization** (src/middleware/auth.js)

#### JWT Flow

```
1. Admin logs in with email + password (POST /api/auth/login)
2. Backend verifies password against bcrypt hash
3. Server signs JWT (7-day expiry by default) → returned in response + httpOnly cookie
4. Frontend stores token in Authorization header (Bearer <token>) OR cookie
5. All private routes require `protect` middleware → verifies JWT signature
6. Additional checks: account active, password not changed after token issue
```

#### Role-Based Access Control

```javascript
// Usage in routes:
router.delete("/posts/:id", protect, restrictTo("admin"), deletePost);

// Two roles:
✓ admin   — Full CRUD on all resources, user management
✓ editor  — Can create/edit/publish posts & solutions, view leads
```

#### Security Details

- **Password Hashing**: bcryptjs (default 12 salt rounds, configurable)
- **JWT Secret**: Must be ≥32 characters (regenerate in production, never commit)
- **Token Expiry**: 7 days default (configurable)
- **Cookie Flags**:
  - `httpOnly` — Not accessible via JavaScript (XSS protection)
  - `sameSite: strict` — CSRF protection
  - `secure` — HTTPS-only in production

#### Password Change Enforcement

When a user changes password, a `passwordChangedAt` timestamp is set. Old JWT tokens are invalidated by comparing token issue time (`iat`) against this timestamp. Forces re-login if password compromised.

### 3. **Input Validation & Sanitization**

All fields validated at **route level** before reaching controllers:

```javascript
✓ express-validator — Type checking, length limits, format validation
✓ mongoSanitize — Strips $ and . to prevent NoSQL injection ({"$ne": null})
✓ xss-clean — Removes XSS payloads from inputs
✓ Custom regexes — Email, phone, URL validation with strict patterns
```

Example:

```javascript
body("email")
  .trim()
  .notEmpty().withMessage("Email required")
  .isEmail().withMessage("Invalid email")
  .normalizeEmail(),

body("password")
  .isLength({ min: 8 }).withMessage("Minimum 8 chars")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
  .withMessage("Must contain uppercase, lowercase, number, special char")
```

### 4. **Data Protection**

- **Sensitive fields** (`password`, `passwordChangedAt`, `ipAddress`) marked `select: false` — never returned unless explicitly requested
- **PII handling** — IP addresses captured for lead spam detection but never exposed in API responses
- **Field projection** — Controllers strip heavy fields from list endpoints (e.g., no full blog content in listings)
- **Responses** — Stack traces only in development mode; production returns generic error messages

### 5. **File Upload Security**

```javascript
✓ MIME type whitelist — Only allowed types (images: JPEG/PNG/WebP/SVG; docs: PDF)
✓ File size limits — 10MB default (configurable)
✓ Filename randomization — UUID-based names, original names stripped
✓ Path traversal prevention — Files stored outside web root; symlink attacks mitigated
✓ Content-type sniffing prevention — Returned with explicit Content-Type headers
✓ Image processing — Converted to WebP format to prevent embedded malware in other formats
```

### 6. **Environment Security**

- ✅ `.env` keys: JWT_SECRET, SMTP_PASS never logged
- ✅ NODE_ENV checks: Stack traces only in dev
- ✅ Database: Connection retries with exponential backoff
- ✅ Email credentials: App-specific passwords (Gmail) recommended, never master password

---

## Performance & Scalability

### Database Optimization

#### Indexes

All models include strategic indexes for common query patterns:

```javascript
// Posts: by slug (detail page), by status + date (listings)
postSchema.index({ slug: 1 });
postSchema.index({ status: 1, publishedAt: -1 });

// Text indexes for full-text search
postSchema.index(
  { title: "text", tags: "text", excerpt: "text" },
  { weights: { title: 10, tags: 5, excerpt: 3 } }
);
```

#### Query Optimization

```javascript
// Timeout-protected queries (5 seconds max)
features.query.maxTimeMS(5000);

// Field projection — only retrieve needed data
Post.find({ status: "published" })
  .select("-content -jsonLd -__v")  // exclude heavy fields for listings
  .populate("author", "name")       // only author name, not full doc

// Pagination with hard cap (prevents memory exhaustion)
const limit = Math.min(100, parseInt(limit) || 10);
```

#### Pagination & Filtering

```javascript
GET /api/posts?page=2&limit=20&sort=-createdAt&fields=title,slug,createdAt
    &status=published&search=security&tags=vulnerability

// ✓ Supports: filtering, sorting, field selection, pagination, full-text search
// ✓ Hard cap: 100 items/page max
// ✓ Default: page 1, limit 10
```

### Request Pipeline Optimization

1. **Compression**: All responses gzipped (30–50% size reduction)
2. **Static caching**: `/uploads` served with 7-day browser cache headers
3. **Image optimization**: Sharp resizes + converts to WebP (better compression than JPEG/PNG)
4. **Connection pooling**: MongoDB connection pool (default 100 connections)
5. **Graceful shutdown**: Drains existing requests before exit

### Scalability Patterns

#### Fire-and-Forget Operations

```javascript
// Email sending doesn't block response
sendLeadNotification(lead).catch((err) =>
  logger.error(`Email failed: ${err.message}`)
);

// Last login timestamp updated asynchronously
User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).exec();
```

#### Bulk Operations

```javascript
// Reorder solutions in parallel
await Promise.all(
  order.map(({ id, order: newOrder }) =>
    Solution.findByIdAndUpdate(id, { order: newOrder }).maxTimeMS(3000)
  )
);
```

#### Aggregation Pipeline

```javascript
// Lead stats computed server-side with MongoDB aggregation
Lead.aggregate([
  {
    $facet: {
      byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      total: [{ $count: "count" }],
      last30Days: [{ $match: { createdAt: { $gte: <30-day-date> } } }],
    }
  }
]);
```

#### Horizontal Scaling Ready

- ✅ Stateless sessions (JWT) — no session affinity needed
- ✅ No in-memory caches — scales across multiple instances
- ✅ MongoDB replica sets supported — for high availability
- ✅ Load balancer compatible — `trust proxy` configured for X-Forwarded-For headers

---

## Error Handling & Resilience

### Centralized Error Handler (src/middleware/errorHandler.js)

All errors flow through one handler for consistent responses:

```javascript
{
  "success": false,
  "message": "User-facing error message",
  "stack": "..." // development only
}
```

### Error Mapping

| Error Type | Status | Meaning |
|---|---|---|
| `CastError` (invalid ObjectId) | 400 | Bad Request |
| `ValidationError` (schema mismatch) | 422 | Unprocessable Entity |
| Duplicate key (unique constraint) | 409 | Conflict |
| `JsonWebTokenError` | 401 | Unauthorized |
| `TokenExpiredError` | 401 | Session Expired |
| Not found | 404 | Resource Not Found |
| CORS error | 403 | Forbidden |
| Unhandled exception | 500 | Internal Server Error |

### Async Error Safety

```javascript
// asyncHandler wraps controllers to catch unhandled rejections
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Usage: any thrown error auto-forwarded to errorHandler
router.get("/", asyncHandler(async (req, res) => {
  const data = await SomeModel.find(); // Error caught automatically
  res.json(data);
}));
```

### Process-Level Resilience

```javascript
// Unhandled rejections logged + process exits for restart
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled: ${err.message}`);
  server.close(() => process.exit(1)); // force restart
});

// Graceful shutdown on SIGTERM/SIGINT
process.on("SIGTERM", () => shutdown("SIGTERM"));
// — drains existing connections, logs shutdown
```

### Database Resilience

```javascript
// Automatic reconnect to MongoDB if connection drops
mongoose.connection.on("disconnected", () => {
  logger.warn("DB disconnected. Reconnecting...");
  connectDB(); // retry
});

// Connection retry on startup (max 5 attempts, 5s intervals)
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
```

### Logging Strategy

```javascript
✓ INFO — Normal operations (logins, resource created, emails sent)
✓ WARN — Recoverable issues (DB disconnect, failed email)
✓ ERROR — 5xx errors with full stack trace
✓ DEBUG — Development only; Mongoose query logs
```

Files:
- `logs/combined-YYYY-MM-DD.log` — All logs
- `logs/error-YYYY-MM-DD.log` — Errors only
- Rotation: 20MB per file, keep 14 days

---

## Project Structure

```
backend/
├── server.js                          # Express app + middleware stack + process handlers
├── package.json                       # Dependencies (production-only, no dev deps in prod)
├── .env.example                       # Environment variable template
├── logs/                              # Generated on first run; .gitignored
└── uploads/                           # Static file serving; .gitignored
    ├── images/                        # WebP-optimized images (resized)
    ├── documents/                     # PDFs and other files
    └── temp/                          # Temporary processing files

src/
├── config/
│   ├── db.js                          # MongoDB connection with retry logic
│   └── logger.js                      # Winston logger with daily file rotation
│
├── middleware/
│   ├── errorHandler.js                # 👈 Centralized error response formatter
│   ├── notFound.js                    # 404 catch-all
│   ├── auth.js                        # JWT verification + role-based access control
│   └── upload.js                      # Multer + Sharp image processing + document saving
│
├── utils/
│   ├── AppError.js                    # Custom error class (operational vs. bug errors)
│   ├── asyncHandler.js                # Wraps async handlers to prevent unhandled rejections
│   ├── apiFeatures.js                 # Query builder: filter, sort, project, paginate
│   ├── sendEmail.js                   # Nodemailer wrapper + email templates
│   └── slugify.js                     # Auto-slug generator with uniqueness check + UUID fallback
│
├── models/
│   ├── User.js                        # Admin user (auth via JWT + bcrypt)
│   ├── Lead.js                        # Contact form submission (IP tracking, status)
│   ├── Post.js                        # Blog post (title, content, SEO, read time, tags)
│   ├── Solution.js                    # Service/product (description, features, category, order)
│   ├── Brand.js                       # Partner/vendor (logo, website, featured flag)
│   └── Download.js                    # Resource: PDF/file with download count tracking
│
├── controllers/
│   ├── authController.js              # login, logout, getMe, changePassword
│   ├── leadController.js              # submitLead, getLeads, updateLead, getLeadStats
│   ├── postController.js              # CRUD + getPublished, filter, search, paginate
│   ├── solutionController.js          # CRUD + reorderSolutions (bulk update)
│   ├── brandController.js             # CRUD + featured filter
│   └── downloadController.js          # CRUD + serveDownload (tracking + file streaming)
│
└── routes/
    ├── authRoutes.js                  # POST /login, /logout, /password (with strict rate limit)
    ├── leadRoutes.js                  # POST (public + rate-limited), GET/PATCH/DELETE (admin)
    ├── postRoutes.js                  # GET (public), POST/PUT/DELETE (admin)
    ├── solutionRoutes.js              # GET (public), POST/PUT/PATCH/DELETE (admin)
    ├── brandRoutes.js                 # GET (public), POST/PUT/DELETE (admin)
    └── downloadRoutes.js              # GET (public), POST/PUT/DELETE (admin), GET /:slug/file (tracked)
```

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended: 20.x)
- **MongoDB** 5.0+ (local or Atlas cloud)
- **npm** 8+

### Local Development

```bash
# 1. Clone repository
cd backend/

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env
# Now edit .env with your values (see Environment Variables section)

# 4. Create uploads directories
mkdir -p uploads/images uploads/documents uploads/temp

# 5. (Optional) Seed initial admin user
npm run seed:admin

# 6. Start dev server (with auto-reload)
npm run dev

# Server runs on http://localhost:5000
```

### Production Build

```bash
# Install production dependencies only
npm ci --only=production

# Ensure .env exists with production values
# DATABASE: Use MongoDB Atlas or managed service
# JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# SMTP_PASS: Use app-specific password, never master password

# Start server
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Server Configuration

```env
PORT=5000
NODE_ENV=production          # or 'development'
```

### Database

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/panzerit
# Connection timeouts:
# serverSelectionTimeoutMS=5000 (fail fast if Atlas unreachable)
# socketTimeoutMS=45000 (operation timeout)
```

### Authentication

```env
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_EXPIRES_IN=7d           # Token expiry (e.g., 7d, 24h, 1w)
JWT_COOKIE_EXPIRES_IN=7     # Cookie expiry in days
BCRYPT_SALT_ROUNDS=12       # Higher = slower but safer (10–14 recommended)
```

### Email (SMTP)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587               # 587 for STARTTLS, 465 for SSL
SMTP_SECURE=false           # true for 465, false for 587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx     # Gmail: Generate App Password (NOT master password)
SMTP_FROM_NAME=Panzer IT
SMTP_FROM_EMAIL=noreply@panzerit.com

# Who receives lead notifications
LEAD_NOTIFY_EMAIL=admin@panzerit.com
```

### File Uploads

```env
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10mb           # Single file size limit
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/svg+xml
ALLOWED_DOC_TYPES=application/pdf
# Images are auto-converted to WebP for better compression
# SVG kept as-is (sharp cannot process)
```

### CORS & Origins

```env
FRONTEND_URL=http://localhost:5173      # Customer-facing website
ADMIN_URL=http://localhost:5174         # Admin panel
# Other origins will be CORS-blocked
```

### Rate Limiting (Optional Overrides)

```env
RATE_LIMIT_WINDOW_MS=900000            # 15 minutes in ms
RATE_LIMIT_MAX=200                     # Req/window for global limiter
AUTH_RATE_LIMIT_MAX=20                 # Stricter: /auth endpoints only
```

---

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/api/auth/login` | Admin login (email + password) | 20/15min |
| `POST` | `/api/auth/logout` | Clear JWT + cookie | N/A |

### Authentication (Private)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/auth/me` | Get current user | Required |
| `PUT` | `/api/auth/password` | Change password (requires current password) | Required |

### Leads (Public Form)

| Method | Endpoint | Description | Auth | Rate Limit |
|---|---|---|---|---|
| `POST` | `/api/leads` | Submit contact form | N/A | 5/hour |

### Leads (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/leads` | List all leads (paginated, filterable) | admin/editor |
| `GET` | `/api/leads/:id` | Get single lead details | admin/editor |
| `PATCH` | `/api/leads/:id` | Update status + notes | admin/editor |
| `DELETE` | `/api/leads/:id` | Delete lead | admin |
| `GET` | `/api/leads/stats` | Dashboard widgets (count by status, last 7/30 days) | admin/editor |

### Posts (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts` | List published posts (paginated) | N/A |
| `GET` | `/api/posts/:slug` | Get single post by slug | N/A |

### Posts (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts/admin` | List all posts (draft + published) | admin/editor |
| `GET` | `/api/posts/admin/:id` | Get single post by ID | admin/editor |
| `POST` | `/api/posts` | Create post (auto-slug, auto-readTime) | admin/editor |
| `PUT` | `/api/posts/:id` | Update post | admin/editor |
| `DELETE` | `/api/posts/:id` | Delete post | admin |

### Solutions (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/solutions` | List published solutions (searchable, filterable by category) | N/A |
| `GET` | `/api/solutions/:slug` | Get single solution by slug | N/A |

### Solutions (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/solutions/admin` | List all solutions (draft + published) | admin/editor |
| `GET` | `/api/solutions/admin/:id` | Get single solution by ID | admin/editor |
| `POST` | `/api/solutions` | Create solution | admin/editor |
| `PUT` | `/api/solutions/:id` | Update solution | admin/editor |
| `PATCH` | `/api/solutions/reorder` | Bulk reorder by display order | admin |
| `DELETE` | `/api/solutions/:id` | Delete solution | admin |

### Brands (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/brands` | List published brands (filterable, featured-only option) | N/A |
| `GET` | `/api/brands/:slug` | Get single brand detail page | N/A |

### Brands (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/brands/admin` | List all brands (draft + published) | admin/editor |
| `GET` | `/api/brands/admin/:id` | Get single brand by ID | admin/editor |
| `POST` | `/api/brands` | Create brand (auto-slug, auto-SEO) | admin/editor |
| `PUT` | `/api/brands/:id` | Update brand | admin/editor |
| `DELETE` | `/api/brands/:id` | Delete brand | admin |

### Downloads (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/downloads` | List published downloads (searchable, filterable by category) | N/A |
| `GET` | `/api/downloads/:slug/file` | Download file (increments downloadCount, supports local + CDN redirects) | N/A |

### Downloads (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/downloads/admin` | List all downloads (draft + published) | admin/editor |
| `GET` | `/api/downloads/admin/:id` | Get single download by ID | admin/editor |
| `POST` | `/api/downloads` | Upload + create download (multipart form) | admin/editor |
| `PUT` | `/api/downloads/:id` | Update download + file | admin/editor |
| `DELETE` | `/api/downloads/:id` | Delete download | admin |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status (no auth required; useful for load balancers) |

### Query String Examples

```bash
# Filtering
GET /api/posts?status=published

# Search (full-text or keyword-based)
GET /api/posts?search=security

# Sorting (use - for descending)
GET /api/posts?sort=-createdAt,title

# Pagination
GET /api/posts?page=2&limit=20

# Field selection (projection)
GET /api/posts?fields=title,slug,createdAt

# Complex query
GET /api/solutions?status=published&category=Network+Security&sort=order&page=1&limit=10
```

---

## Database Schema

### User (Admin)

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (bcrypt hash, never returned),
  role: "admin" | "editor" (default: "admin"),
  isActive: Boolean (default: true),
  lastLoginAt: Date,
  passwordChangedAt: Date (used for JWT invalidation),
  createdAt: Date,
  updatedAt: Date
}
```

### Lead

```javascript
{
  name: String (max 100),
  email: String (regex validated),
  phone: String (optional, regex validated),
  company: String (optional, max 150),
  message: String (10–2000 chars),
  source: String (default: "Website"),
  status: "new" | "contacted" | "qualified" | "lost" (default: "new"),
  notes: String (optional, admin-only),
  ipAddress: String (captured, select: false, never returned),
  createdAt: Date,
  updatedAt: Date
}
```

### Post

```javascript
{
  title: String (required, max 200),
  slug: String (unique, auto-generated),
  excerpt: String (max 500),
  content: String (rich HTML, required),
  coverImage: { url, alt },
  tags: [String],
  status: "draft" | "published",
  seo: { metaTitle, metaDescription, ogImage },
  jsonLd: Object (auto-generated for schema.org),
  readTime: Number (auto-calculated from word count),
  publishedAt: Date (auto-set on publish),
  author: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Solution

```javascript
{
  title: String (required, max 200),
  slug: String (unique, auto-generated),
  tagline: String (max 300),
  description: String (rich HTML, required),
  summary: String (max 500),
  coverImage: { url, alt },
  icon: String (SVG identifier),
  features: [String],
  category: String,
  order: Number (for display ordering),
  status: "draft" | "published",
  seo: { metaTitle, metaDescription, ogImage },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Brand

```javascript
{
  name: String (required, max 200),
  slug: String (unique, auto-generated),
  tagline: String (max 300),
  summary: String (max 500),
  content: String (rich HTML, required),
  logo: { url, alt },
  coverImage: { url, alt },
  website: String (URL with protocol),
  category: String,
  order: Number,
  isFeatured: Boolean (default: false),
  status: "draft" | "published",
  seo: { metaTitle, metaDescription, ogImage },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Download

```javascript
{
  title: String (required, max 200),
  slug: String (unique, auto-generated),
  description: String (max 500),
  file: { url, originalName, size, mimeType },
  coverImage: { url, alt },
  category: String,
  downloadCount: Number (default: 0, incremented on serve),
  status: "draft" | "published",
  seo: { metaTitle, metaDescription },
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication

### JWT (JSON Web Token)

**Token Structure:**

```javascript
Header: { alg: "HS256", typ: "JWT" }
Payload: { id, role, iat, exp }
Signature: HMAC-SHA256(header.payload, JWT_SECRET)
```

**Flow:**

1. **Login** `POST /api/auth/login`
   ```json
   {
     "email": "admin@panzerit.com",
     "password": "SecurePass123!"
   }
   ```
   Response:
   ```json
   {
     "success": true,
     "token": "eyJhbGc...",
     "data": {
       "user": { "id", "name", "email", "role" }
     }
   }
   ```

2. **Use Token**
   ```bash
   curl -H "Authorization: Bearer eyJhbGc..." https://api.panzerit.com/api/posts/admin
   # OR use cookie if set (httpOnly)
   ```

3. **Check Current User** `GET /api/auth/me`
   ```bash
   curl -H "Authorization: Bearer eyJhbGc..." https://api.panzerit.com/api/auth/me
   ```

4. **Change Password** `PUT /api/auth/password`
   ```json
   {
     "currentPassword": "OldPass123!",
     "newPassword": "NewPass456!",
     "confirmPassword": "NewPass456!"
   }
   ```
   — Issues a fresh token; old tokens invalidated.

5. **Logout** `POST /api/auth/logout`
   — Clears JWT cookie; token remains valid but frontend should discard it.

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character: `@$!%*?&#`

Example valid: `SecurePass123!`, `MyApp#2026!`

### Session Security

- **Token Expiry**: 7 days (configurable)
- **httpOnly Cookies**: Not accessible to JavaScript (XSS protection)
- **SAME-SITE Strict**: Cookies not sent cross-origin (CSRF protection)
- **Secure Flag**: HTTPS-only in production
- **Password Change**: Invalidates all existing tokens (sets `passwordChangedAt`)

---

## File Uploads

### Image Upload

**Endpoint:** `POST /api/posts` with multipart form data

```bash
curl -F "image=@screenshot.png" \
  -H "Authorization: Bearer <token>" \
  https://api.panzerit.com/api/posts
```

**Processing:**
1. Multer captures file from `image` field
2. Sharp resizes to 1920px width (maintains aspect ratio, no upscaling)
3. Converts to WebP format (better compression)
4. Generates UUID filename: `img-<uuid>.webp`
5. Stored in `uploads/images/`
6. Returns file URL: `/uploads/images/img-abc123.webp`

**Allowed Types:**
- `image/jpeg` → WebP
- `image/png` → WebP
- `image/webp` → WebP
- `image/svg+xml` → Kept as SVG

**Size Limit:** 10MB default (configurable via `MAX_FILE_SIZE`)

### Document Upload (PDF)

**Endpoint:** `POST /api/downloads` with multipart form data

```bash
curl -F "file=@whitepaper.pdf" \
  -H "Authorization: Bearer <token>" \
  https://api.panzerit.com/api/downloads
```

**Processing:**
1. Multer captures file from `file` field
2. No processing (PDF stored as-is)
3. Generates UUID filename: `doc-<uuid>.pdf`
4. Stored in `uploads/documents/`
5. Returns file URL: `/uploads/documents/doc-abc123.pdf`

**Allowed Types:**
- `application/pdf`

### File Serving

**Local Files:**
```bash
GET /uploads/images/img-abc123.webp
GET /uploads/documents/doc-abc123.pdf
```
Static files served with 7-day cache headers.

**Download Tracking:**
```bash
GET /api/downloads/:slug/file
```
Increments `downloadCount` and either:
- Streams local file, or
- Redirects to CDN URL if file is external (e.g., S3, CloudFlare)

---

## Email Notifications

### Lead Submission

**Trigger:** `POST /api/leads` (contact form)

**Admin Notification:**
- **To:** `LEAD_NOTIFY_EMAIL`
- **Subject:** "New Lead: {name} — {company}"
- **Body:** Table with name, email, phone, company, message, source, timestamp
- **Reply-To:** Lead's email (admin can reply directly)

**Lead Auto-Reply:**
- **To:** Lead's email
- **Subject:** "We received your message — Panzer IT"
- **Body:** Thank you message + link to website
- Sent regardless of admin notification success (fire-and-forget)

### Configuration

```env
SMTP_HOST=smtp.gmail.com (or other provider)
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Gmail App Password
LEAD_NOTIFY_EMAIL=admin@panzerit.com
```

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer" (or relevant device)
4. Copy the 16-character password → paste into `SMTP_PASS`
5. Use your full Gmail address in `SMTP_USER`

**Example:**
```env
SMTP_USER=admin@gmail.com (NOT admin@panzerit.com for Gmail)
SMTP_PASS=abcd efgh ijkl mnop
```

---

## Deployment

### Hosting Options

#### 1. **Render.com** (Node.js + MongoDB)

```bash
# 1. Push to GitHub (Render connects to repo)

# 2. Create new Web Service
# — GitHub repo selection
# — Runtime: Node
# — Build command: npm install
# — Start command: npm start

# 3. Set environment variables in Render dashboard
MONGO_URI=mongodb+srv://...
JWT_SECRET=<generated 32-char secret>
# ... (all vars from .env.example)

# 4. Deploy — automatic on git push
```

#### 2. **Railway.app** (Docker + Render similar)

```bash
# 1. Install CLI: npm i -g @railway/cli

# 2. Login: railway login

# 3. Deploy: railway up

# 4. Set vars: railway variables set MONGO_URI=... JWT_SECRET=...
```

#### 3. **AWS EC2 + RDS + S3**

```bash
# 1. Launch t3.medium EC2 (Ubuntu 22.04 LTS)
# 2. Install Node.js: curl -sL https://deb.nodesource.com/setup_20.x | bash
# 3. Install PM2: npm i -g pm2
# 4. Create RDS MongoDB cluster
# 5. Upload app code (git or SCP)
# 6. npm ci --only=production
# 7. pm2 start server.js --name "panzerit-api" --watch
# 8. pm2 startup && pm2 save (auto-restart on reboot)
# 9. Configure security groups: allow port 5000 from load balancer
# 10. Use S3 for file uploads (set UPLOAD_DIR to S3 path)
```

### Pre-Deployment Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Generate new `JWT_SECRET` (not from .env.example)
- ✅ Use MongoDB Atlas (not local) with proper credentials
- ✅ Enable replication/backup on MongoDB
- ✅ Use SMTP for production email (Gmail app password or SendGrid)
- ✅ Set `FRONTEND_URL` and `ADMIN_URL` to production domains
- ✅ Verify all rate limits are appropriate for production traffic
- ✅ Enable HTTPS (Render/Railway auto-issue SSL; AWS: use ACM + CloudFront)
- ✅ Set up log monitoring (CloudWatch, Datadog, or similar)
- ✅ Configure MongoDB backup schedule
- ✅ Test health check: `curl https://api.panzerit.com/api/health`

### Scaling for Production

**Horizontal Scaling (multiple instances):**
- ✅ Stateless: JWT carries auth info; no session affinity needed
- ✅ Load balancer: Distribute traffic across instances
- ✅ MongoDB Atlas: Replica sets for high availability
- ✅ S3: Store uploads on CDN instead of local filesystem

**Vertical Scaling (bigger server):**
- ✅ Increase Node process memory (`--max-old-space-size`)
- ✅ Increase MongoDB connection pool
- ✅ Add Redis caching layer for frequently accessed data

**Monitoring:**
- ✅ Set up APM (Application Performance Monitoring): New Relic, DataDog
- ✅ Log aggregation: ELK Stack, Splunk, or CloudWatch
- ✅ Uptime monitoring: Pingdom, StatusCake
- ✅ Error tracking: Sentry

---

## Development

### Scripts

```bash
npm run dev          # Start with auto-reload (nodemon)
npm start            # Production start (no auto-reload)
npm run seed:admin   # Create initial admin user
npm run seed:all     # Seed admin + settings
```

### Development Tools

```bash
# Run single file seeders
node src/seeders/adminSeeder.js

# MongoDB shell (if using local MongoDB)
mongosh panzerit

# Test API endpoints
curl -X GET http://localhost:5000/api/health

# Check logs
tail -f logs/error-$(date +%Y-%m-%d).log
```

### Adding a New Endpoint

**Example: Add "Featured Posts" filter**

1. **Update Model** (`src/models/Post.js`)
   - Add `isFeatured: Boolean` field if not exists
   - Add index: `postSchema.index({ isFeatured: 1, publishedAt: -1 })`

2. **Update Controller** (`src/controllers/postController.js`)
   - Add filter logic in `getPosts`:
   ```javascript
   if (req.query.featured === "true") {
     features.query = features.query.where("isFeatured").equals(true);
   }
   ```

3. **Update Route** (`src/routes/postRoutes.js`)
   - No changes needed; query param auto-handled by controller

4. **Test**
   ```bash
   curl "http://localhost:5000/api/posts?featured=true"
   ```

### Code Style

- **No linting enforced** (ESLint not configured)
- **Conventions used:**
  - 4-space indentation
  - camelCase for variables/functions
  - PascalCase for classes/models
  - Comments above complex logic
  - JSDoc-style blocks for utility functions
  - Arrow functions for callbacks
  - Async/await (no callbacks)

### Testing

No automated tests included. For production, add:

```bash
npm install --save-dev jest supertest
```

Example test file:

```javascript
// __tests__/auth.test.js
const request = require("supertest");
const app = require("../server");

describe("Auth", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@panzerit.com", password: "SecurePass123!" });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **"Cannot find module"** | Run `npm install` again; check Node version with `node -v` (need 18+) |
| **"MongoDB connection failed"** | Check `MONGO_URI` in .env; verify network access is allowed in MongoDB Atlas |
| **"Email sending failed"** | Verify `SMTP_USER`, `SMTP_PASS` in .env; for Gmail, use App Password not master password |
| **"File upload 413 Payload Too Large"** | Increase `MAX_FILE_SIZE` in .env (default 10mb) |
| **"Rate limit exceeded"** | Wait for time window to pass; or adjust `RATE_LIMIT_MAX` and `AUTH_RATE_LIMIT_MAX` in .env |
| **"Token expired"** | Login again; token is 7 days by default (set `JWT_EXPIRES_IN` to extend) |
| **Port 5000 already in use** | Change `PORT` in .env or kill process: `lsof -i :5000` then `kill <PID>` |
| **Logs not visible** | Check `logs/` directory exists; logs rotate daily; check `logs/error-YYYY-MM-DD.log` for errors |

---

## Security Audit Summary

✅ **Authentication** — JWT + bcrypt, password change invalidation, rate limiting
✅ **Authorization** — Role-based access control (admin/editor)
✅ **Input Validation** — express-validator + custom regex rules
✅ **Data Sanitization** — mongoSanitize, xssClean, hpp
✅ **File Security** — MIME whitelist, UUID naming, image optimization
✅ **Error Handling** — No stack traces in production, generic error messages
✅ **CORS** — Whitelist-based, credentials protected
✅ **Headers** — Helmet for X-Frame-Options, CSP-ready
✅ **Secrets** — Never logged; .env not committed; JWT_SECRET rotatable
✅ **Process Safety** — Graceful shutdown, unhandled rejection capture

---

## License

Proprietary — Panzer IT (2026)
Developed By CodeSpine

---

## Support

For API issues, questions, or feature requests:

1. **Check logs:** `logs/error-YYYY-MM-DD.log`
2. **Test endpoint:** `curl http://localhost:5000/api/health`
3. **Verify .env:** All required variables set, no typos
4. **Review code:** Check relevant controller/model for business logic
