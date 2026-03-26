const path = require("path");
const fs = require("fs");
const Download = require("../models/Download");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const APIFeatures = require("../utils/apiFeatures");
const { generateUniqueSlug } = require("../utils/slugify");
const { DIRS } = require("../middleware/upload");
const logger = require("../config/logger");
const { validationResult } = require("express-validator");

// ─── Helper ───────────────────────────────────────────────────────────────────
const validateRequest = (req, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map((e) => e.msg).join(". ");
        next(new AppError(message, 422));
        return false;
    }
    return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all published downloads (public)
// @route   GET /api/downloads
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getDownloads = asyncHandler(async (req, res) => {
    const baseQuery = Download.find({ status: "published" });

    const features = new APIFeatures(baseQuery, req.query)
        .search(["title", "description"])
        .sort()
        .project()
        .paginate();

    // Category filter
    if (req.query.category) {
        features.query = features.query.where("category").equals(req.query.category);
    }

    const [downloads, total] = await Promise.all([
        features.query
            .select("-seo -__v")
            .maxTimeMS(5000),
        Download.countDocuments({ status: "published" }),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { downloads },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Track download + serve file (public)
// @route   GET /api/downloads/:slug/file
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const serveDownload = asyncHandler(async (req, res, next) => {
    const download = await Download.findOne({
        slug: req.params.slug,
        status: "published",
    }).maxTimeMS(5000);

    if (!download) {
        return next(new AppError("Download not found.", 404));
    }

    // Increment download count — fire-and-forget
    Download.findByIdAndUpdate(download._id, {
        $inc: { downloadCount: 1 },
    }).exec();

    // If file is stored locally, stream it directly
    // If file URL is external (CDN), redirect to it
    const fileUrl = download.file.url;

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return res.redirect(302, fileUrl);
    }

    // Local file — resolve absolute path and stream
    const absolutePath = path.join(__dirname, "../../", fileUrl);

    if (!fs.existsSync(absolutePath)) {
        return next(new AppError("File not found on server.", 404));
    }

    const filename = download.file.originalName || path.basename(absolutePath);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", download.file.mimeType || "application/octet-stream");

    logger.info(`Download served: "${download.title}" (${download._id})`);

    res.sendFile(absolutePath);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all downloads — drafts + published (admin)
// @route   GET /api/downloads/admin
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminDownloads = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Download.find(), req.query)
        .filter()
        .search(["title", "description"])
        .sort()
        .project()
        .paginate();

    const [downloads, total] = await Promise.all([
        features.query
            .select("-seo -__v")
            .maxTimeMS(5000),
        Download.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { downloads },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single download by ID (admin)
// @route   GET /api/downloads/admin/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminDownload = asyncHandler(async (req, res, next) => {
    const download = await Download.findById(req.params.id)
        .maxTimeMS(5000);

    if (!download) {
        return next(new AppError("Download not found.", 404));
    }

    res.status(200).json({ success: true, data: { download } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create download + upload file (admin)
// @route   POST /api/downloads
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createDownload = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const {
        title, description, category,
        status, seo, coverImage,
    } = req.body;

    // File must be uploaded via multer (uploadDocument middleware)
    if (!req.file && !req.body.fileUrl) {
        return next(new AppError("Please upload a file or provide a file URL.", 400));
    }

    const slug = await generateUniqueSlug(title, Download);

    // Build file object — either from multer upload or from provided URL
    const fileData = req.file
        ? {
            url: req.file.url,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        }
        : {
            url: req.body.fileUrl,
            originalName: req.body.fileOriginalName || "",
            size: req.body.fileSize || 0,
            mimeType: req.body.fileMimeType || "application/pdf",
        };

    const metaTitle = seo?.metaTitle || title.substring(0, 70);
    const metaDescription = seo?.metaDescription || (description || "").substring(0, 160);

    const download = await Download.create({
        title,
        slug,
        description,
        file: fileData,
        coverImage: coverImage || {},
        category,
        status: status || "draft",
        seo: { ...seo, metaTitle, metaDescription },
    });

    logger.info(`Download created: "${download.title}" (${download._id}) by ${req.user.email}`);

    res.status(201).json({ success: true, data: { download } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update download (admin)
// @route   PUT /api/downloads/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateDownload = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const download = await Download.findById(req.params.id);
    if (!download) {
        return next(new AppError("Download not found.", 404));
    }

    const {
        title, description, category,
        status, seo, coverImage,
    } = req.body;

    // Regenerate slug only if title changed
    if (title && title !== download.title) {
        download.slug = await generateUniqueSlug(title, Download, download._id);
        download.title = title;
    }

    // If a new file is uploaded, delete the old local file
    if (req.file) {
        const oldUrl = download.file?.url;
        if (oldUrl && !oldUrl.startsWith("http")) {
            const oldPath = path.join(__dirname, "../../", oldUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) logger.warn(`Failed to delete old file: ${oldPath}`);
                });
            }
        }

        download.file = {
            url: req.file.url,
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        };
    }

    if (description !== undefined) download.description = description;
    if (coverImage !== undefined) download.coverImage = coverImage;
    if (category !== undefined) download.category = category;
    if (status !== undefined) download.status = status;
    if (seo !== undefined) download.seo = { ...download.seo, ...seo };

    await download.save();

    logger.info(`Download updated: "${download.title}" (${download._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, data: { download } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete download — removes file from disk too (admin only)
// @route   DELETE /api/downloads/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteDownload = asyncHandler(async (req, res, next) => {
    const download = await Download.findById(req.params.id);

    if (!download) {
        return next(new AppError("Download not found.", 404));
    }

    // Delete physical file from disk if stored locally
    const fileUrl = download.file?.url;
    if (fileUrl && !fileUrl.startsWith("http")) {
        const filePath = path.join(__dirname, "../../", fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) logger.warn(`Failed to delete file on disk: ${filePath}`);
                else logger.info(`File deleted from disk: ${filePath}`);
            });
        }
    }

    await download.deleteOne();

    logger.info(`Download deleted: "${download.title}" (${download._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Download deleted successfully." });
});

module.exports = {
    getDownloads,
    serveDownload,
    getAdminDownloads,
    getAdminDownload,
    createDownload,
    updateDownload,
    deleteDownload,
};