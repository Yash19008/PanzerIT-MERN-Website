# Project Structure

```
backend/
├── server.js
├── package.json
├── .env.example
├── .gitignore
│
├── uploads/                        # served as static, gitignored
│
└── src/
    ├── config/
    │   ├── db.js                   # Mongoose connection + retry logic
    │   └── logger.js               # Winston logger setup
    │
    ├── middleware/
    │   ├── errorHandler.js         # centralised error response
    │   ├── notFound.js             # 404 catch-all
    │   ├── auth.js                 # JWT verify + role guard
    │   └── upload.js               # Multer config (images + docs)
    │
    ├── utils/
    │   ├── AppError.js             # custom error class
    │   ├── asyncHandler.js         # wraps async route handlers
    │   ├── apiFeatures.js          # pagination, filtering, sorting helper
    │   ├── sendEmail.js            # Nodemailer wrapper
    │   └── slugify.js              # auto-slug generator with uniqueness check
    │
    ├── models/
    │   ├── User.js                 # admin user (JWT auth)
    │   ├── Lead.js                 # contact form submissions
    │   ├── Post.js                 # blog posts
    │   ├── Solution.js             # solutions/services
    │   ├── Brand.js                # brands/partners
    │   ├── Download.js             # downloadable resources
    │   ├── Media.js                # uploaded media library
    │   └── Setting.js              # site-wide + SEO settings
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── leadController.js
    │   ├── postController.js
    │   ├── solutionController.js
    │   ├── brandController.js
    │   ├── downloadController.js
    │   ├── mediaController.js
    │   └── settingController.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── leadRoutes.js
    │   ├── postRoutes.js
    │   ├── solutionRoutes.js
    │   ├── brandRoutes.js
    │   ├── downloadRoutes.js
    │   ├── mediaRoutes.js
    │   └── settingRoutes.js
    │
    └── seeders/
        └── adminSeeder.js          # creates first admin user
```