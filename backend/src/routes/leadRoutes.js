const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, param } = require("express-validator");
const {
    submitLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    getLeadStats,
} = require("../controllers/leadController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Strict rate limiter for public form submission ───────────────────────────
// Prevents spam bots from flooding the contact form
const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 5,                // 5 submissions per IP per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many submissions from this IP. Please try again after an hour.",
    },
});

// ─── Validation rules ─────────────────────────────────────────────────────────
const submitValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required.")
        .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters."),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("phone")
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-().]{7,20}$/)
        .withMessage("Please provide a valid phone number."),

    body("company")
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage("Company name cannot exceed 150 characters."),

    body("message")
        .trim()
        .notEmpty().withMessage("Message is required.")
        .isLength({ min: 10 }).withMessage("Message must be at least 10 characters.")
        .isLength({ max: 2000 }).withMessage("Message cannot exceed 2000 characters."),

    body("source")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Source cannot exceed 100 characters."),
];

const updateValidation = [
    param("id")
        .isMongoId().withMessage("Invalid lead ID."),

    body("status")
        .optional()
        .isIn(["new", "contacted", "qualified", "lost"])
        .withMessage("Status must be one of: new, contacted, qualified, lost."),

    body("notes")
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters."),
];

const mongoIdValidation = [
    param("id").isMongoId().withMessage("Invalid lead ID."),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public — contact form submission
router.post("/", submitLimiter, submitValidation, submitLead);

// Private — all admin routes below
router.use(protect);

router.get("/stats", restrictTo("admin", "editor"), getLeadStats);
router.get("/", restrictTo("admin", "editor"), getLeads);
router.get("/:id", restrictTo("admin", "editor"), mongoIdValidation, getLead);
router.patch("/:id", restrictTo("admin", "editor"), updateValidation, updateLead);
router.delete("/:id", restrictTo("admin"), mongoIdValidation, deleteLead);
//                     ↑ editors can read/update leads but only admins can delete

module.exports = router;