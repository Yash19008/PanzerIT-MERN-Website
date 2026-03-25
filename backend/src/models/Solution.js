const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
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

        tagline: {
            type: String,
            trim: true,
            maxlength: [300, "Tagline cannot exceed 300 characters"],
        },

        // Rich HTML content from TipTap editor
        description: {
            type: String,
            required: [true, "Description is required"],
        },

        // Short summary for cards/listings
        summary: {
            type: String,
            trim: true,
            maxlength: [500, "Summary cannot exceed 500 characters"],
        },

        // Cover / hero image
        coverImage: {
            url: { type: String, trim: true },
            alt: { type: String, trim: true, default: "" },
        },

        // Icon (SVG string or icon identifier for frontend)
        icon: {
            type: String,
            trim: true,
        },

        // Key features / bullet points shown on solution page
        features: {
            type: [String],
            default: [],
        },

        // Category for grouping (e.g. "Network Security", "Cloud", "Compliance")
        category: {
            type: String,
            trim: true,
        },

        // Display order on the solutions listing page
        order: {
            type: Number,
            default: 0,
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
solutionSchema.index({ slug: 1 });
solutionSchema.index({ status: 1, order: 1 });   // public listing — published, sorted by order
solutionSchema.index({ category: 1, status: 1 }); // category filtering
solutionSchema.index({ createdAt: -1 });

// Text index for admin search
solutionSchema.index(
    { title: "text", tagline: "text", summary: "text" },
    { weights: { title: 10, tagline: 5, summary: 3 }, name: "solution_text_search" }
);

// ─── Pre-save: set publishedAt ────────────────────────────────────────────────
solutionSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("Solution", solutionSchema);