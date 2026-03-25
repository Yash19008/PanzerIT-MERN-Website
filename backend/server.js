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

// ─── Route imports (uncomment as each module is built) ───────────────────────
const authRoutes = require("./src/routes/authRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const postRoutes    = require("./src/routes/postRoutes");
// const solutionRoutes = require("./src/routes/solutionRoutes");
// const brandRoutes   = require("./src/routes/brandRoutes");
// const downloadRoutes = require("./src/routes/downloadRoutes");
// const mediaRoutes   = require("./src/routes/mediaRoutes");
// const settingRoutes = require("./src/routes/settingRoutes");

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
    windowMs: 15 * 60 * 1000, // 15 minutes
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
app.use(hpp({ whitelist: ["tags", "fields", "sort"] })); // prevent HTTP parameter pollution

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

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/posts",     postRoutes);
// app.use("/api/solutions", solutionRoutes);
// app.use("/api/brands",    brandRoutes);
// app.use("/api/downloads", downloadRoutes);
// app.use("/api/media",     mediaRoutes);
// app.use("/api/settings",  settingRoutes);

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