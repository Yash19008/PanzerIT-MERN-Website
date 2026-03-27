const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
    {
        // Original filename before upload
        originalName: {
            type: String,
            trim: true,
        },

        // Stored filename on disk (uuid-based)
        filename: {
            type: String,
            required: true,
            trim: true,
        },

        // Public URL path served by Express static
        url: {
            type: String,
            required: true,
            trim: true,
        },

        // Alt text for accessibility + SEO
        alt: {
            type: String,
            trim: true,
            default: "",
        },

        // Caption shown in media library
        caption: {
            type: String,
            trim: true,
            maxlength: [300, "Caption cannot exceed 300 characters"],
        },

        mimeType: {
            type: String,
            trim: true,
        },

        // File size in bytes
        size: {
            type: Number,
        },

        // Image dimensions (populated by sharp after processing)
        dimensions: {
            width: { type: Number },
            height: { type: Number },
        },

        // Type — image or document
        type: {
            type: String,
            enum: ["image", "document"],
            default: "image",
        },

        // Folder / tag for organising the media library
        folder: {
            type: String,
            trim: true,
            default: "general",
        },

        // Which admin uploaded this
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
mediaSchema.index({ type: 1, createdAt: -1 });     // library listing by type
mediaSchema.index({ folder: 1, createdAt: -1 });   // folder browsing
mediaSchema.index({ createdAt: -1 });              // default sort newest first
mediaSchema.index({ originalName: "text", alt: "text", caption: "text" }, {
    name: "media_text_search",
});

module.exports = mongoose.model("Media", mediaSchema);