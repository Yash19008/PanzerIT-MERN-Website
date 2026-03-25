const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        phone: {
            type: String,
            trim: true,
            match: [
                /^[+]?[\d\s\-().]{7,20}$/,
                "Please provide a valid phone number",
            ],
        },

        company: {
            type: String,
            trim: true,
            maxlength: [150, "Company name cannot exceed 150 characters"],
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters"],
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },

        // Where did the lead come from (e.g. "Contact Page", "Solutions Page")
        source: {
            type: String,
            trim: true,
            default: "Website",
        },

        status: {
            type: String,
            enum: ["new", "contacted", "qualified", "lost"],
            default: "new",
        },

        // Internal notes from admin
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
        },

        // IP address — stored for spam/abuse detection, never exposed publicly
        ipAddress: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
leadSchema.index({ status: 1, createdAt: -1 }); // admin inbox — filter by status, sort by newest
leadSchema.index({ email: 1 });                  // look up leads by email
leadSchema.index({ createdAt: -1 });             // default sort

module.exports = mongoose.model("Lead", leadSchema);