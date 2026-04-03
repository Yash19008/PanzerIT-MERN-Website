const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

require("dotenv").config();

const connectDB = require("./src/config/db");
const logger = require("./src/config/logger");
const errorHandler = require("./src/middleware/errorHandler");
const { notFound } = require("./src/middleware/notFound");
const { swaggerUi, specs } = require("./src/config/swagger");

// ─── Route imports (uncomment as each module is built) ───────────────────────
const authRoutes = require("./src/routes/authRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const postRoutes = require("./src/routes/postRoutes");
const solutionRoutes = require("./src/routes/solutionRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const downloadRoutes = require("./src/routes/downloadRoutes");
const mediaRoutes = require("./src/routes/mediaRoutes");
const settingRoutes = require("./src/routes/settingRoutes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Trust proxy (needed for rate-limiter behind Nginx / Render / Railway) ────
app.set("trust proxy", 1);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }, // allow media served from /uploads
    })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server / curl / Postman in development
            if (!origin && process.env.NODE_ENV === "development") {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,          // allow cookies / Authorization header
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── Global rate limiter (all routes) ─────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200,                  // requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
app.use(globalLimiter);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));           // cap JSON payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ─── Data sanitisation ────────────────────────────────────────────────────────
app.use(mongoSanitize());   // strip $ and . from req.body / params / query
app.use(xssClean());        // sanitise HTML/script injection in inputs
app.use(hpp({               // prevent HTTP parameter pollution
    whitelist: ["tags", "fields", "sort", "category", "status"],
}));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── HTTP request logger (dev only) ───────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ─── Static file serving (uploaded media) ────────────────────────────────────
app.use(
    "/uploads",
    express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"), {
        maxAge: "7d",   // browser cache for media assets
    })
);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.status(200).json({ success: true, message: "Server is running." });
});

// ─── Swagger API Documentation ────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Panzer IT API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        syntaxHighlight: {
            activate: true,
            theme: 'arta'
        }
    }
}));

// ─── Maintenance mode ─────────────────────────────────────────────────────────
// Reads the singleton Setting doc — if enabled, blocks all public API calls
// except: /api/health, /api/auth/login (so admin can still log in to disable it)
app.use("/api", async (req, res, next) => {
    try {
        const Setting = require("./src/models/Setting");
        const settings = await Setting.findOne({ key: "global" }).select("maintenance").lean();

        if (!settings?.maintenance?.enabled) return next();

        // Always allow health check and admin login through
        const passthrough = ["/api/health", "/api/auth/login"];
        if (passthrough.some((p) => req.path.startsWith(p.replace("/api", "")))) {
            return next();
        }

        // Allow any authenticated admin/editor through (JWT in header or cookie)
        const token =
            req.cookies?.jwt ||
            (req.headers.authorization?.startsWith("Bearer ") &&
                req.headers.authorization.split(" ")[1]);

        if (token) {
            try {
                const jwt = require("jsonwebtoken");
                jwt.verify(token, process.env.JWT_SECRET);
                return next(); // valid token — let them through
            } catch (_) { /* invalid token falls through to maintenance response */ }
        }

        return res.status(503).json({
            success: false,
            maintenance: true,
            message: settings.maintenance.message || "We'll be back soon.",
        });
    } catch (err) {
        // If DB is down we can't read settings — let the request through
        next();
    }
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/settings", settingRoutes);

// ─── 404 + centralised error handler ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled promise rejections — log and exit so the process manager restarts
process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});