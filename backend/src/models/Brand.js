const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Brand name is required"],
            trim: true,
            maxlength: [200, "Brand name cannot exceed 200 characters"],
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Tagline shown under brand name (e.g. "Most Advance Malware Protection")
        tagline: {
            type: String,
            trim: true,
            maxlength: [300, "Tagline cannot exceed 300 characters"],
        },

        // Short summary for brand cards on /brands listing page
        summary: {
            type: String,
            trim: true,
            maxlength: [500, "Summary cannot exceed 500 characters"],
        },

        // Rich HTML content — full vendor product detail page (from TipTap)
        content: {
            type: String,
            required: [true, "Content is required"],
        },

        // Vendor logo
        logo: {
            url: { type: String, trim: true, required: [true, "Logo URL is required"] },
            alt: { type: String, trim: true, default: "" },
        },

        // Cover / hero image for the brand detail page
        coverImage: {
            url: { type: String, trim: true },
            alt: { type: String, trim: true, default: "" },
        },

        // External vendor website (e.g. https://www.emsisoft.com)
        website: {
            type: String,
            trim: true,
            match: [
                /^https?:\/\/.+/,
                "Please provide a valid URL starting with http:// or https://",
            ],
        },

        // Category — e.g. "DLP", "Anti-Malware", "Backup", "Remote Access", "VAPT"
        category: {
            type: String,
            trim: true,
        },

        // Display order on the /brands listing page
        order: {
            type: Number,
            default: 0,
        },

        // Featured brands shown prominently on the homepage logo section
        isFeatured: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        // SEO fields
        seo: {
            metaTitle: { type: String, trim: true, maxlength: [70, "Meta title cannot exceed 70 characters"] },
            metaDescription: { type: String, trim: true, maxlength: [160, "Meta description cannot exceed 160 characters"] },
            ogImage: { type: String, trim: true },
        },

        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
brandSchema.index({ slug: 1 });
brandSchema.index({ status: 1, order: 1 });         // public listing — published, sorted by order
brandSchema.index({ status: 1, isFeatured: 1 });    // homepage featured brands query
brandSchema.index({ category: 1, status: 1 });      // category filtering
brandSchema.index({ createdAt: -1 });               // admin default sort

// Text index for search
brandSchema.index(
    { name: "text", tagline: "text", summary: "text" },
    { weights: { name: 10, tagline: 5, summary: 3 }, name: "brand_text_search" }
);

// ─── Pre-save: set publishedAt ────────────────────────────────────────────────
brandSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("Brand", brandSchema);