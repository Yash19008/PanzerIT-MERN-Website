const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const {
    uploadMedia,
    uploadBulkMedia,
    getMedia,
    getMediaItem,
    updateMedia,
    getFolders,
    deleteMedia,
    bulkDeleteMedia,
} = require("../controllers/mediaController");
const { protect, restrictTo } = require("../middleware/auth");
const { uploadImage, uploadDocument } = require("../middleware/upload");

const router = express.Router();

// ─── Multer instance for bulk uploads (up to 10 files) ───────────────────────
// We re-use memoryStorage + processImage logic per-file inside uploadBulkMedia
const multerBulk = require("multer")({
    storage: require("multer").memoryStorage(),
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/webp",
            "image/svg+xml", "application/pdf",
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
    },
});

// ─── Process each file in bulk upload through sharp ──────────────────────────
const { processImage: _pi, saveDocument: _sd, DIRS } = require("../middleware/upload");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const processBulkFiles = async (req, _res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const processed = [];

        for (const file of req.files) {
            const isImage = file.mimetype.startsWith("image/");

            if (isImage && file.mimetype !== "image/svg+xml") {
                const filename = `img-${uuidv4()}.webp`;
                const filepath = path.join(DIRS.images, filename);

                await sharp(file.buffer)
                    .resize(1920, undefined, { fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 85 })
                    .toFile(filepath);

                file.filename = filename;
                file.path = filepath;
                file.url = `/uploads/images/${filename}`;
                file.mimetype = "image/webp";

            } else if (file.mimetype === "image/svg+xml") {
                const filename = `svg-${uuidv4()}.svg`;
                const filepath = path.join(DIRS.images, filename);
                fs.writeFileSync(filepath, file.buffer);
                file.filename = filename;
                file.path = filepath;
                file.url = `/uploads/images/${filename}`;

            } else {
                // PDF or document
                const ext = ".pdf";
                const filename = `doc-${uuidv4()}${ext}`;
                const filepath = path.join(DIRS.documents, filename);
                fs.writeFileSync(filepath, file.buffer);
                file.filename = filename;
                file.path = filepath;
                file.url = `/uploads/documents/${filename}`;
            }

            processed.push(file);
        }

        req.files = processed;
        next();
    } catch (err) {
        next(err);
    }
};

// ─── Validation rules ─────────────────────────────────────────────────────────
const updateValidation = [
    param("id").isMongoId().withMessage("Invalid media ID."),

    body("alt")
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage("Alt text cannot exceed 300 characters."),

    body("caption")
        .optional()
        .trim()
        .isLength({ max: 300 }).withMessage("Caption cannot exceed 300 characters."),

    body("folder")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("Folder name cannot exceed 100 characters."),
];

const bulkDeleteValidation = [
    body("ids")
        .isArray({ min: 1 }).withMessage("Please provide an array of media IDs.")
        .custom((ids) => {
            const mongoose = require("mongoose");
            if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
                throw new Error("One or more IDs are invalid.");
            }
            return true;
        }),
];

const mongoIdValidation = [
    param("id").isMongoId().withMessage("Invalid media ID."),
];

// ─── All media routes are private ─────────────────────────────────────────────
router.use(protect);

// ── Folders must come before /:id to avoid param collision ────────────────────
router.get("/folders", getFolders);

// ── Bulk endpoints ────────────────────────────────────────────────────────────
router.post(
    "/bulk",
    restrictTo("admin", "editor"),
    multerBulk.array("files", 10),
    processBulkFiles,
    uploadBulkMedia
);

router.delete(
    "/bulk",
    restrictTo("admin"),
    bulkDeleteValidation,
    bulkDeleteMedia
);

// ── Single file endpoints ──────────────────────────────────────────────────────
router.get("/", restrictTo("admin", "editor"), getMedia);
router.get("/:id", restrictTo("admin", "editor"), mongoIdValidation, getMediaItem);

// Single upload — auto-detect image vs document via mimetype
router.post(
    "/",
    restrictTo("admin", "editor"),
    (req, _res, next) => {
        // Peek at content-type from multer before deciding which processor to use
        // We use uploadImage by default; if it's a PDF, uploadDocument handles it
        const upload = require("../middleware/upload");
        upload.uploadImage[0](req, _res, (err) => {
            if (err) return next(err);
            if (req.file?.mimetype === "application/pdf") {
                // Re-run as document if PDF slipped through
                return upload.uploadDocument[1](req, _res, next);
            }
            upload.uploadImage[1](req, _res, next);
        });
    },
    uploadMedia
);

router.patch("/:id", restrictTo("admin", "editor"), updateValidation, updateMedia);
router.delete("/:id", restrictTo("admin"), mongoIdValidation, deleteMedia);

module.exports = router;