const express = require("express");
const { body, param } = require("express-validator");
const {
    getBrands,
    getBrandBySlug,
    getAdminBrands,
    getAdminBrand,
    createBrand,
    updateBrand,
    toggleFeatured,
    reorderBrands,
    deleteBrand,
} = require("../controllers/brandController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const brandValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Brand name is required.")
        .isLength({ max: 200 }).withMessage("Brand name cannot exceed 200 characters."),

    body("content")
        .notEmpty().withMessage("Content is required."),

    body("logo.url")
        .notEmpty().withMessage("Logo URL is required.")
        .isURL().withMessage("Logo must be a valid URL."),

    body("logo.alt")
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage("Logo alt text cannot exceed 150 characters."),

    body("tagline")
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage("Tagline cannot exceed 300 characters."),

    body("summary")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Summary cannot exceed 500 characters."),

    body("website")
        .optional()
        .trim()
        .isURL({ require_protocol: true })
        .withMessage("Website must be a valid URL starting with http:// or https://."),

    body("category")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Category cannot exceed 100 characters."),

    body("order")
        .optional()
        .isInt({ min: 0 }).withMessage("Order must be a non-negative integer."),

    body("isFeatured")
        .optional()
        .isBoolean().withMessage("isFeatured must be true or false."),

    body("status")
        .optional()
        .isIn(["draft", "published"]).withMessage("Status must be draft or published."),

    body("seo.metaTitle")
        .optional()
        .trim()
        .isLength({ max: 70 }).withMessage("Meta title cannot exceed 70 characters."),

    body("seo.metaDescription")
        .optional()
        .trim()
        .isLength({ max: 160 }).withMessage("Meta description cannot exceed 160 characters."),
];

const reorderValidation = [
    body("order")
        .isArray({ min: 1 }).withMessage("Please provide an array of reorder items.")
        .custom((items) => {
            if (items.some((i) => !i.id || typeof i.order !== "number")) {
                throw new Error("Each item must have an id and an order (number).");
            }
            return true;
        }),
];

const mongoIdValidation = [
    param("id").isMongoId().withMessage("Invalid brand ID."),
];

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.use(protect);

// Note: /admin, /reorder must be before /:slug and /:id to avoid param collision
router.get("/admin", restrictTo("admin", "editor"), getAdminBrands);
router.get("/admin/:id", restrictTo("admin", "editor"), mongoIdValidation, getAdminBrand);
router.post("/", restrictTo("admin", "editor"), brandValidation, createBrand);
router.put("/:id", restrictTo("admin", "editor"), mongoIdValidation, brandValidation, updateBrand);
router.patch("/reorder", restrictTo("admin"), reorderValidation, reorderBrands);
router.patch("/:id/featured", restrictTo("admin"), mongoIdValidation, toggleFeatured);
router.delete("/:id", restrictTo("admin"), mongoIdValidation, deleteBrand);

module.exports = router;