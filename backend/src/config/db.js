const mongoose = require("mongoose");
const logger = require("./logger");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retries = 0;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These are the recommended options for Mongoose 8.x
            serverSelectionTimeoutMS: 5000,  // fail fast if Atlas is unreachable
            socketTimeoutMS: 45000,
        });

        retries = 0; // reset on successful connection
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        retries += 1;
        logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${err.message}`);

        if (retries >= MAX_RETRIES) {
            logger.error("Max retries reached. Exiting process.");
            process.exit(1);
        }

        logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        setTimeout(connectDB, RETRY_DELAY_MS);
    }
};

// ─── Mongoose global settings ─────────────────────────────────────────────────

// Don't throw on queries for fields not in schema — silently strip them instead
mongoose.set("strictQuery", true);

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", (collectionName, method, query, doc) => {
        logger.debug(`Mongoose » ${collectionName}.${method} ${JSON.stringify(query)}`);
    });
}

// ─── Connection event hooks ───────────────────────────────────────────────────
mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected. Attempting reconnect...");
    connectDB();
});

mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;