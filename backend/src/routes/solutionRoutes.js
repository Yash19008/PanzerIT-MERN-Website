const express = require("express");
const { body, param } = require("express-validator");
const {
    getSolutions,
    getSolutionBySlug,
    getAdminSolutions,
    getAdminSolution,
    createSolution,
    updateSolution,
    reorderSolutions,
    deleteSolution,
} = require("../controllers/solutionController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const solutionValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required.")
        .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters."),

    body("description")
        .notEmpty().withMessage("Description is required."),

    body("tagline")
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage("Tagline cannot exceed 300 characters."),

    body("summary")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Summary cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(["draft", "published"]).withMessage("Status must be draft or published."),

    body("order")
        .optional()
        .isInt({ min: 0 }).withMessage("Order must be a non-negative integer."),

    body("features")
        .optional()
        .isArray().withMessage("Features must be an array.")
        .custom((features) => {
            if (features.length > 20) throw new Error("Cannot add more than 20 features.");
            if (features.some((f) => typeof f !== "string")) throw new Error("Each feature must be a string.");
            return true;
        }),

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
    param("id").isMongoId().withMessage("Invalid solution ID."),
];

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", getSolutions);
router.get("/:slug", getSolutionBySlug);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.use(protect);

router.get("/admin", restrictTo("admin", "editor"), getAdminSolutions);
router.get("/admin/:id", restrictTo("admin", "editor"), mongoIdValidation, getAdminSolution);
router.post("/", restrictTo("admin", "editor"), solutionValidation, createSolution);
router.put("/:id", restrictTo("admin", "editor"), mongoIdValidation, solutionValidation, updateSolution);
router.patch("/reorder", restrictTo("admin"), reorderValidation, reorderSolutions);
router.delete("/:id", restrictTo("admin"), mongoIdValidation, deleteSolution);

module.exports = router;