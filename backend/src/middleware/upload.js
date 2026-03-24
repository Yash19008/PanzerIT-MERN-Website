const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = (
    process.env.ALLOWED_IMAGE_TYPES ||
    "image/jpeg,image/png,image/webp,image/svg+xml"
).split(",");

const ALLOWED_DOC_TYPES = (
    process.env.ALLOWED_DOC_TYPES || "application/pdf"
).split(",");

const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

// ─── Max file size ─────────────────────────────────────────────────────────────
const parseSize = (val) => {
    if (!val) return 10 * 1024 * 1024; // default 10 MB
    const num = parseInt(val, 10);
    const unit = val.toLowerCase().replace(/[^a-z]/g, "");
    if (unit === "kb") return num * 1024;
    if (unit === "mb") return num * 1024 * 1024;
    return num;
};
const MAX_SIZE = parseSize(process.env.MAX_FILE_SIZE);

// ─── Upload directory ──────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(
    __dirname,
    "../../",
    process.env.UPLOAD_DIR || "uploads"
);

// Sub-directories
const DIRS = {
    images: path.join(UPLOAD_DIR, "images"),
    documents: path.join(UPLOAD_DIR, "documents"),
    temp: path.join(UPLOAD_DIR, "temp"),
};

// Ensure all directories exist on startup
Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Multer storage — use memoryStorage so sharp can process before saving ────
const storage = multer.memoryStorage();

// ─── File filter ───────────────────────────────────────────────────────────────
const fileFilter = (allowedTypes) => (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                `File type '${file.mimetype}' is not allowed. Allowed: ${allowedTypes.join(", ")}`,
                400
            ),
            false
        );
    }
};

// ─── Base multer instance ─────────────────────────────────────────────────────
const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: fileFilter(ALL_ALLOWED),
});

// ─── Image processing middleware (runs after multer) ─────────────────────────
/**
 * processImage — resizes + converts uploaded image to WebP, saves to disk.
 * Skips SVG files (sharp can't process them).
 *
 * @param {object} options
 * @param {number} [options.width=1920]   - Max width in px
 * @param {number} [options.height]       - Max height in px (optional)
 * @param {number} [options.quality=85]   - WebP quality 1–100
 */
const processImage = (options = {}) => async (req, _res, next) => {
    if (!req.file || !ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
        return next();
    }

    // SVGs are served as-is (sharp can't process them)
    if (req.file.mimetype === "image/svg+xml") {
        const filename = `svg-${uuidv4()}.svg`;
        const filepath = path.join(DIRS.images, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.url = `/uploads/images/${filename}`;
        return next();
    }

    try {
        const { width = 1920, height, quality = 85 } = options;
        const filename = `img-${uuidv4()}.webp`;
        const filepath = path.join(DIRS.images, filename);

        const pipeline = sharp(req.file.buffer)
            .resize(width, height, {
                fit: "inside",      // never upscale
                withoutEnlargement: true,
            })
            .webp({ quality });

        await pipeline.toFile(filepath);

        // Attach processed file info back onto req.file
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.url = `/uploads/images/${filename}`;
        req.file.mimetype = "image/webp";

        next();
    } catch (err) {
        logger.error(`Image processing failed: ${err.message}`);
        next(new AppError("Image processing failed. Please try again.", 500));
    }
};

/**
 * saveDocument — saves a PDF buffer directly to disk (no processing needed).
 */
const saveDocument = async (req, _res, next) => {
    if (!req.file || !ALLOWED_DOC_TYPES.includes(req.file.mimetype)) {
        return next();
    }

    try {
        const ext = path.extname(req.file.originalname).toLowerCase() || ".pdf";
        const filename = `doc-${uuidv4()}${ext}`;
        const filepath = path.join(DIRS.documents, filename);

        fs.writeFileSync(filepath, req.file.buffer);

        req.file.filename = filename;
        req.file.path = filepath;
        req.file.url = `/uploads/documents/${filename}`;

        next();
    } catch (err) {
        logger.error(`Document save failed: ${err.message}`);
        next(new AppError("Document upload failed. Please try again.", 500));
    }
};

// ─── Exported upload configs ──────────────────────────────────────────────────

/** Single image upload */
const uploadImage = [
    upload.single("image"),
    processImage({ width: 1920, quality: 85 }),
];

/** Single thumbnail (smaller, tighter quality) */
const uploadThumbnail = [
    upload.single("image"),
    processImage({ width: 800, quality: 80 }),
];

/** Single document (PDF) upload */
const uploadDocument = [
    upload.single("file"),
    saveDocument,
];

/** Mixed: one image + one document */
const uploadMixed = [
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    // process each field individually
    async (req, res, next) => {
        if (req.files?.image?.[0]) {
            req.file = req.files.image[0];
            await processImage({ width: 1920, quality: 85 })(req, res, () => { });
            req.files.image[0] = req.file;
        }
        if (req.files?.file?.[0]) {
            req.file = req.files.file[0];
            await saveDocument(req, res, () => { });
            req.files.file[0] = req.file;
        }
        next();
    },
];

module.exports = {
    uploadImage,
    uploadThumbnail,
    uploadDocument,
    uploadMixed,
    DIRS,
};