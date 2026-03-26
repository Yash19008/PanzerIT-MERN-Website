const express         = require("express");
const { body, param } = require("express-validator");
const {
  getDownloads,
  serveDownload,
  getAdminDownloads,
  getAdminDownload,
  createDownload,
  updateDownload,
  deleteDownload,
} = require("../controllers/downloadController");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadDocument }      = require("../middleware/upload");

const router = express.Router();

// ─── Validation rules ─────────────────────────────────────────────────────────
const downloadValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required.")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters."),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters."),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Category cannot exceed 100 characters."),

  body("status")
    .optional()
    .isIn(["draft", "published"]).withMessage("Status must be draft or published."),

  body("fileUrl")
    .optional()
    .isURL({ require_protocol: true })
    .withMessage("File URL must be a valid URL."),

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
  param("id").isMongoId().withMessage("Invalid download ID."),
];

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/",              getDownloads);
router.get("/:slug/file",    serveDownload);   // tracked file download

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.use(protect);

router.get   ("/admin",      restrictTo("admin", "editor"), getAdminDownloads);
router.get   ("/admin/:id",  restrictTo("admin", "editor"), mongoIdValidation, getAdminDownload);

// uploadDocument runs multer + saveDocument before the controller
router.post  ("/",           restrictTo("admin", "editor"), uploadDocument, downloadValidation, createDownload);
router.put   ("/:id",        restrictTo("admin", "editor"), mongoIdValidation, uploadDocument, downloadValidation, updateDownload);
router.delete("/:id",        restrictTo("admin"),           mongoIdValidation, deleteDownload);

module.exports = router;