const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Short description shown on the downloads listing page
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },

        // The actual file
        file: {
            url: { type: String, trim: true, required: [true, "File URL is required"] },
            originalName: { type: String, trim: true },  // original filename before upload
            size: { type: Number },               // in bytes
            mimeType: { type: String, trim: true },
        },

        // Optional thumbnail / cover image for the download card
        coverImage: {
            url: { type: String, trim: true },
            alt: { type: String, trim: true, default: "" },
        },

        // Category — e.g. "Datasheet", "Whitepaper", "Brochure", "Case Study"
        category: {
            type: String,
            trim: true,
        },

        // Download count — incremented on every download
        downloadCount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        // SEO
        seo: {
            metaTitle: { type: String, trim: true, maxlength: [70, "Meta title cannot exceed 70 characters"] },
            metaDescription: { type: String, trim: true, maxlength: [160, "Meta description cannot exceed 160 characters"] },
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
downloadSchema.index({ slug: 1 });
downloadSchema.index({ status: 1, createdAt: -1 });   // public listing
downloadSchema.index({ category: 1, status: 1 });     // category filtering
downloadSchema.index({ createdAt: -1 });

// ─── Pre-save: set publishedAt ────────────────────────────────────────────────
downloadSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("Download", downloadSchema);