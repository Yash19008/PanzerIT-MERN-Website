const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const { combine, timestamp, printf, colorize, errors, json } = format;

// ─── Log directory ────────────────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "../../logs");

// ─── Custom readable format for console ───────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// ─── Shared file transport options ────────────────────────────────────────────
const fileTransportOptions = {
    dirname: LOG_DIR,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,   // compress rotated logs
    maxSize: "20m",        // rotate when file hits 20 MB
    maxFiles: "14d",       // keep 14 days of logs
};

// ─── Transports ───────────────────────────────────────────────────────────────
const logger = createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),   // log full stack traces
        json()
    ),
    transports: [
        // All logs → combined file
        new DailyRotateFile({
            ...fileTransportOptions,
            filename: "combined-%DATE%.log",
        }),
        // Error-level only → separate file for quick triage
        new DailyRotateFile({
            ...fileTransportOptions,
            filename: "error-%DATE%.log",
            level: "error",
        }),
    ],
    // Don't crash the process on logger error
    exitOnError: false,
});

// ─── Console transport (non-production) ──────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: "HH:mm:ss" }),
                errors({ stack: true }),
                consoleFormat
            ),
        })
    );
}

module.exports = logger;