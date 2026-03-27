/**
 * settingsSeeder.js — pre-populates the singleton Settings document
 *
 * Run once after fresh setup (or any time you want to reset defaults):
 *   cd backend && npm run seed:settings
 *
 * Safe to re-run — uses upsert so it never creates duplicates.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Setting = require("../models/Setting");
const logger = require("../config/logger");

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info("MongoDB connected for settings seeding.");

        const defaults = {
            key: "global",

            general: {
                siteName: "Panzer IT",
                tagline: "Make IT Secure",
                siteUrl: process.env.FRONTEND_URL || "https://panzerit.com",
                email: "sales@panzerit.com",
                phone: "+91 90046 55099",
                address: "New Delhi | Mumbai, India",
            },

            contact: {
                email: "sales@panzerit.com",
                phone: "+91 90046 55099",
                whatsapp: "+919004655099",
                address: "New Delhi | Mumbai, India",
            },

            social: {
                linkedin: "",
                twitter: "",
                facebook: "",
                instagram: "",
                youtube: "",
            },

            seo: {
                metaTitle: "Panzer IT — Make IT Secure | Best IT Security Solution Provider in India",
                metaDescription: "Panzer IT provides 360° IT security solutions — Endpoint Security, DLP, Backup & DR, VAPT, IAM, PAM and more across India.",
                twitterCard: "summary_large_image",
                organization: {
                    name: "Panzer IT",
                    url: process.env.FRONTEND_URL || "https://panzerit.com",
                    logo: "",
                    sameAs: [],
                },
            },

            scripts: {
                headStart: "",
                headEnd: "",
                bodyStart: "",
                bodyEnd: "",
            },

            maintenance: {
                enabled: false,
                message: "We are performing scheduled maintenance. We'll be back shortly.",
            },
        };

        // Upsert — create if not exists, update if exists
        await Setting.findOneAndUpdate(
            { key: "global" },
            { $set: defaults },
            { upsert: true, new: true, runValidators: true }
        );

        logger.info("─────────────────────────────────────────");
        logger.info("✓ Settings seeded successfully!");
        logger.info("  Update values via Admin Panel > Settings");
        logger.info("─────────────────────────────────────────");

    } catch (err) {
        logger.error(`Settings seeder failed: ${err.message}`);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        logger.info("MongoDB disconnected.");
        process.exit(0);
    }
};

seed();