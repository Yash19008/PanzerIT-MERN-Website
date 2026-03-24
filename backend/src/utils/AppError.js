/**
 * AppError — operational error class
 *
 * Distinguishes between operational errors (expected, user-facing)
 * and programmer errors (bugs). Only operational errors get clean
 * JSON responses; everything else falls through as a 500.
 */
class AppError extends Error {
    /**
     * @param {string} message   - Human-readable error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith("4") ? "fail" : "error";
        this.isOperational = true; // flag used by errorHandler to distinguish from bugs

        // Capture stack trace — excludes the constructor call itself
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;