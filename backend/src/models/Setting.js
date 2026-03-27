const mongoose = require("mongoose");

// ─── Settings is a singleton — only ONE document ever exists ──────────────────
// We enforce this with a fixed `key: "global"` field + unique index.
// On first request the seeder/controller creates it; afterwards it's always updated.

const settingSchema = new mongoose.Schema(
    {
        // Singleton lock — always "global"
        key: {
            type: String,
            default: "global",
            unique: true,
            immutable: true,
        },

        // ── General ────────────────────────────────────────────────────────────────
        general: {
            siteName: { type: String, trim: true, default: "Panzer IT" },
            tagline: { type: String, trim: true, default: "Make IT Secure" },
            siteUrl: { type: String, trim: true },
            logo: { type: String, trim: true },   // URL
            favicon: { type: String, trim: true },   // URL
            email: { type: String, trim: true, lowercase: true },
            phone: { type: String, trim: true },
            address: { type: String, trim: true },
            // Google Analytics / Tag Manager ID
            gaId: { type: String, trim: true },
        },

        // ── Contact info ───────────────────────────────────────────────────────────
        contact: {
            email: { type: String, trim: true, lowercase: true },
            phone: { type: String, trim: true },
            whatsapp: { type: String, trim: true },
            address: { type: String, trim: true },
            mapEmbedUrl: { type: String, trim: true },
        },

        // ── Social media ──────────────────────────────────────────────────────────
        social: {
            linkedin: { type: String, trim: true },
            twitter: { type: String, trim: true },
            facebook: { type: String, trim: true },
            instagram: { type: String, trim: true },
            youtube: { type: String, trim: true },
        },

        // ── Global SEO defaults ───────────────────────────────────────────────────
        // Used as fallback when a page doesn't have its own SEO fields set
        seo: {
            metaTitle: { type: String, trim: true, maxlength: [70, "Meta title cannot exceed 70 characters"] },
            metaDescription: { type: String, trim: true, maxlength: [160, "Meta description cannot exceed 160 characters"] },
            ogImage: { type: String, trim: true },   // Default OG image URL
            twitterCard: { type: String, trim: true, default: "summary_large_image" },
            // JSON-LD Organization schema
            organization: {
                name: { type: String, trim: true },
                url: { type: String, trim: true },
                logo: { type: String, trim: true },
                sameAs: { type: [String], default: [] },  // social profile URLs
            },
        },

        // ── Scripts ───────────────────────────────────────────────────────────────
        // Injected into <head> or <body> of every page
        scripts: {
            headStart: { type: String, default: "" },   // after <head>
            headEnd: { type: String, default: "" },   // before </head>
            bodyStart: { type: String, default: "" },   // after <body>
            bodyEnd: { type: String, default: "" },   // before </body>
        },

        // ── Maintenance mode ──────────────────────────────────────────────────────
        maintenance: {
            enabled: { type: Boolean, default: false },
            message: { type: String, trim: true, default: "We'll be back soon." },
        },
    },
    {
        timestamps: true,
    }
);

// ─── Ensure singleton ─────────────────────────────────────────────────────────
settingSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model("Setting", settingSchema);