const express = require("express");
const { body } = require("express-validator");
const {
    getPublicSettings,
    getAdminSettings,
    updateGeneralSettings,
    updateContactSettings,
    updateSocialSettings,
    updateSeoSettings,
    updateScripts,
    updateMaintenance,
} = require("../controllers/settingController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────

const generalValidation = [
    body("siteName")
        .optional().trim()
        .isLength({ max: 100 }).withMessage("Site name cannot exceed 100 characters."),
    body("tagline")
        .optional().trim()
        .isLength({ max: 200 }).withMessage("Tagline cannot exceed 200 characters."),
    body("siteUrl")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("Site URL must be a valid URL."),
    body("email")
        .optional().trim()
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),
    body("phone")
        .optional().trim()
        .isLength({ max: 30 }).withMessage("Phone cannot exceed 30 characters."),
    body("gaId")
        .optional().trim()
        .isLength({ max: 50 }).withMessage("GA ID cannot exceed 50 characters."),
];

const contactValidation = [
    body("email")
        .optional().trim()
        .isEmail().withMessage("Please provide a valid email address.")
        .normalizeEmail(),
    body("phone")
        .optional().trim()
        .isLength({ max: 30 }).withMessage("Phone cannot exceed 30 characters."),
    body("whatsapp")
        .optional().trim()
        .isLength({ max: 30 }).withMessage("WhatsApp number cannot exceed 30 characters."),
    body("mapEmbedUrl")
        .optional().trim()
        .isLength({ max: 500 }).withMessage("Map embed URL cannot exceed 500 characters."),
];

const socialValidation = [
    body("linkedin")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("LinkedIn must be a valid URL."),
    body("twitter")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("Twitter must be a valid URL."),
    body("facebook")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("Facebook must be a valid URL."),
    body("instagram")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("Instagram must be a valid URL."),
    body("youtube")
        .optional().trim()
        .isURL({ require_protocol: true }).withMessage("YouTube must be a valid URL."),
];

const seoValidation = [
    body("metaTitle")
        .optional().trim()
        .isLength({ max: 70 }).withMessage("Meta title cannot exceed 70 characters."),
    body("metaDescription")
        .optional().trim()
        .isLength({ max: 160 }).withMessage("Meta description cannot exceed 160 characters."),
    body("twitterCard")
        .optional().trim()
        .isIn(["summary", "summary_large_image"])
        .withMessage("Twitter card must be summary or summary_large_image."),
    body("organization.sameAs")
        .optional()
        .isArray().withMessage("sameAs must be an array of URLs."),
];

const maintenanceValidation = [
    body("enabled")
        .optional()
        .isBoolean().withMessage("Enabled must be true or false."),
    body("message")
        .optional().trim()
        .isLength({ max: 500 }).withMessage("Maintenance message cannot exceed 500 characters."),
];

// Scripts have no strict validation — admin is trusted for raw script injection
// but we still protect the route to admin-only

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public — frontend fetches this on load for SEO meta, contact info, social links
router.get("/", getPublicSettings);

// Private — all settings mutations require admin JWT
router.use(protect);

router.get("/admin", restrictTo("admin"), getAdminSettings);
router.patch("/general", restrictTo("admin"), generalValidation, updateGeneralSettings);
router.patch("/contact", restrictTo("admin"), contactValidation, updateContactSettings);
router.patch("/social", restrictTo("admin"), socialValidation, updateSocialSettings);
router.patch("/seo", restrictTo("admin"), seoValidation, updateSeoSettings);
router.patch("/scripts", restrictTo("admin"), updateScripts);         // no extra validation — admin-trusted
router.patch("/maintenance", restrictTo("admin"), maintenanceValidation, updateMaintenance);

module.exports = router;