const logger = require("../config/logger");

// ─── Mongoose: CastError (invalid ObjectId) ───────────────────────────────────
const handleCastError = (err) => ({
    statusCode: 400,
    message: `Invalid value for field '${err.path}': ${err.value}`,
});

// ─── Mongoose: Duplicate key (unique constraint violation) ────────────────────
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    return {
        statusCode: 409,
        message: `'${err.keyValue[field]}' is already in use for field '${field}'.`,
    };
};

// ─── Mongoose: Validation errors ──────────────────────────────────────────────
const handleValidationError = (err) => ({
    statusCode: 422,
    message: Object.values(err.errors)
        .map((e) => e.message)
        .join(". "),
});

// ─── JWT errors ───────────────────────────────────────────────────────────────
const handleJWTError = () => ({
    statusCode: 401,
    message: "Invalid token. Please log in again.",
});

const handleJWTExpiredError = () => ({
    statusCode: 401,
    message: "Your session has expired. Please log in again.",
});

// ─── CORS error ───────────────────────────────────────────────────────────────
const handleCORSError = () => ({
    statusCode: 403,
    message: "Not allowed by CORS policy.",
});

// ─── Main error handler ───────────────────────────────────────────────────────
const errorHandler = (err, req, res, _next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ── Map known error types ──────────────────────────────────────────────────
    if (err.name === "CastError") ({ statusCode, message } = handleCastError(err));
    if (err.code === 11000) ({ statusCode, message } = handleDuplicateKeyError(err));
    if (err.name === "ValidationError") ({ statusCode, message } = handleValidationError(err));
    if (err.name === "JsonWebTokenError") ({ statusCode, message } = handleJWTError());
    if (err.name === "TokenExpiredError") ({ statusCode, message } = handleJWTExpiredError());
    if (err.message?.startsWith("Not allowed")) ({ statusCode, message } = handleCORSError());

    // ── Log 500s with full stack ───────────────────────────────────────────────
    if (statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
    } else {
        logger.warn(`${req.method} ${req.originalUrl} — ${statusCode}: ${message}`);
    }

    // ── Response ───────────────────────────────────────────────────────────────
    res.status(statusCode).json({
        success: false,
        message,
        // Expose stack only in development (never in production)
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;