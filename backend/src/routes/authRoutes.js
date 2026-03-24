const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { login, logout, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ─── Strict rate limiter for auth endpoints ───────────────────────────────────
// Much tighter than the global limiter — prevents brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,                    // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
    // Count failed attempts only (don't penalise successful logins)
    skipSuccessfulRequests: true,
});

// ─── Validation rules ─────────────────────────────────────────────────────────
const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required.")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

const changePasswordValidation = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required."),

    body("newPassword")
        .notEmpty().withMessage("New password is required.")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters.")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
        .withMessage(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)."
        ),

    body("confirmPassword")
        .notEmpty().withMessage("Please confirm your new password.")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match.");
            }
            return true;
        }),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public
router.post("/login", authLimiter, loginValidation, login);

// Private
router.use(protect); // all routes below require a valid JWT

router.get("/me", getMe);
router.post("/logout", logout);
router.put("/password", changePasswordValidation, changePassword);

module.exports = router;