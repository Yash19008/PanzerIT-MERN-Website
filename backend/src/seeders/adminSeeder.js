/**
 * adminSeeder.js — creates the first admin user
 *
 * Run once after fresh setup:
 *   cd backend && npm run seed:admin
 *
 * Safe to re-run — skips creation if admin already exists.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../config/logger");

const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@panzerit.com";
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@1234";
const SEED_NAME = process.env.SEED_ADMIN_NAME || "Super Admin";

const seed = async () => {
    try {
        // ── Connect ─────────────────────────────────────────────────────────────
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info("MongoDB connected for seeding.");

        // ── Check if admin already exists ────────────────────────────────────────
        const existing = await User.findOne({ email: SEED_EMAIL });

        if (existing) {
            logger.info(`Admin already exists: ${SEED_EMAIL} — skipping seed.`);
            return;
        }

        // ── Create admin ─────────────────────────────────────────────────────────
        await User.create({
            name: SEED_NAME,
            email: SEED_EMAIL,
            password: SEED_PASSWORD, // hashed by pre-save hook in User model
            role: "admin",
            isActive: true,
        });

        logger.info("─────────────────────────────────────────");
        logger.info("✓ Admin user created successfully!");
        logger.info(`  Email:    ${SEED_EMAIL}`);
        logger.info(`  Password: ${SEED_PASSWORD}`);
        logger.info("  ⚠  Change this password immediately after first login.");
        logger.info("─────────────────────────────────────────");

    } catch (err) {
        logger.error(`Seeder failed: ${err.message}`);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        logger.info("MongoDB disconnected.");
        process.exit(0);
    }
};

seed();