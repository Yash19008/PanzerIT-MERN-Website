const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
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

        excerpt: {
            type: String,
            trim: true,
            maxlength: [500, "Excerpt cannot exceed 500 characters"],
        },

        // Rich HTML content from TipTap editor
        content: {
            type: String,
            required: [true, "Content is required"],
        },

        // Featured image
        coverImage: {
            url: { type: String, trim: true },
            alt: { type: String, trim: true, default: "" },
        },

        // Tags for filtering / related posts
        tags: {
            type: [String],
            default: [],
            set: (tags) => tags.map((t) => t.toLowerCase().trim()),
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

        // JSON-LD Article schema (auto-generated on publish if not provided)
        jsonLd: {
            type: mongoose.Schema.Types.Mixed,
        },

        // Read time in minutes (auto-calculated on save)
        readTime: {
            type: Number,
            default: 1,
        },

        // Track publish date separately so drafts don't pollute it
        publishedAt: {
            type: Date,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
postSchema.index({ slug: 1 });
postSchema.index({ status: 1, publishedAt: -1 }); // public listing — published posts sorted by date
postSchema.index({ tags: 1 });                     // tag filtering
postSchema.index({ createdAt: -1 });               // admin listing

// Text index for full-text search across title, excerpt, tags
postSchema.index(
    { title: "text", excerpt: "text", tags: "text" },
    { weights: { title: 10, tags: 5, excerpt: 3 }, name: "post_text_search" }
);

// ─── Pre-save: calculate read time ───────────────────────────────────────────
// Strips HTML tags from content and estimates based on ~200 words/min
postSchema.pre("save", function (next) {
    if (this.isModified("content")) {
        const plainText = this.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        const wordCount = plainText.split(" ").filter(Boolean).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

// ─── Pre-save: set publishedAt when status changes to published ───────────────
postSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model("Post", postSchema);