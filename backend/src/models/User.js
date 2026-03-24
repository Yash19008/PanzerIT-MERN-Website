const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [60, "Name cannot exceed 60 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // never returned in queries by default
        },

        role: {
            type: String,
            enum: ["admin", "editor"],
            default: "admin",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // Track last login for audit purposes
        lastLoginAt: {
            type: Date,
        },

        // Password change tracking — used to invalidate old JWTs
        passwordChangedAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
    // Only hash if password was actually modified
    if (!this.isModified("password")) return next();

    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
    this.password = await bcrypt.hash(this.password, rounds);

    // Set passwordChangedAt (skip on new user creation)
    if (!this.isNew) {
        // Subtract 1s to account for JWT iat precision — ensures old tokens are invalid
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }

    next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: sign JWT ────────────────────────────────────────────────
userSchema.methods.signToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ─── Instance method: check if password changed after token was issued ────────
userSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
    if (this.passwordChangedAt) {
        const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return jwtIssuedAt < changedAt; // true = password changed after token issued
    }
    return false;
};

// ─── Remove sensitive fields from JSON output ────────────────────────────────
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.passwordChangedAt;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("User", userSchema);