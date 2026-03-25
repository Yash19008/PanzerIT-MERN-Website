const express = require("express");
const { body, param } = require("express-validator");
const {
    getPosts,
    getPostBySlug,
    getAdminPosts,
    getAdminPost,
    createPost,
    updatePost,
    deletePost,
} = require("../controllers/postController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const postValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required.")
        .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters."),

    body("content")
        .notEmpty().withMessage("Content is required."),

    body("excerpt")
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage("Excerpt cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(["draft", "published"]).withMessage("Status must be draft or published."),

    body("tags")
        .optional()
        .isArray().withMessage("Tags must be an array.")
        .custom((tags) => {
            if (tags.some((t) => typeof t !== "string")) {
                throw new Error("Each tag must be a string.");
            }
            if (tags.length > 10) {
                throw new Error("Cannot add more than 10 tags.");
            }
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

const mongoIdValidation = [
    param("id").isMongoId().withMessage("Invalid post ID."),
];

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

// ─── Admin routes (all require JWT) ──────────────────────────────────────────
router.use(protect);

// Note: /admin and /admin/:id must come before /:slug to avoid slug collision
router.get("/admin", restrictTo("admin", "editor"), getAdminPosts);
router.get("/admin/:id", restrictTo("admin", "editor"), mongoIdValidation, getAdminPost);
router.post("/", restrictTo("admin", "editor"), postValidation, createPost);
router.put("/:id", restrictTo("admin", "editor"), mongoIdValidation, postValidation, updatePost);
router.delete("/:id", restrictTo("admin"), mongoIdValidation, deletePost);

module.exports = router;