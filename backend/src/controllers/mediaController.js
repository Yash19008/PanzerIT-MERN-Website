const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const Media = require("../models/Media");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const APIFeatures = require("../utils/apiFeatures");
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

// ─── Helper: delete file from disk ───────────────────────────────────────────
const deleteFromDisk = (url) => {
    if (!url || url.startsWith("http")) return;
    const filePath = path.join(__dirname, "../../", url);
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) logger.warn(`Failed to delete media file: ${filePath}`);
            else logger.info(`Media file deleted: ${filePath}`);
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload single image or document
// @route   POST /api/media
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadMedia = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please select a file to upload.", 400));
    }

    const { alt, caption, folder } = req.body;
    const isImage = req.file.mimetype?.startsWith("image/");
    let dimensions = {};

    // Get image dimensions from sharp metadata (file already saved by middleware)
    if (isImage && req.file.mimetype !== "image/svg+xml") {
        try {
            const meta = await sharp(req.file.path).metadata();
            dimensions = { width: meta.width, height: meta.height };
        } catch (err) {
            logger.warn(`Could not read image dimensions: ${err.message}`);
        }
    }

    const media = await Media.create({
        originalName: req.file.originalname,
        filename: req.file.filename,
        url: req.file.url,
        alt: alt || "",
        caption: caption || "",
        mimeType: req.file.mimetype,
        size: req.file.size || 0,
        dimensions,
        type: isImage ? "image" : "document",
        folder: folder || "general",
        uploadedBy: req.user._id,
    });

    logger.info(`Media uploaded: ${media.filename} by ${req.user.email}`);

    res.status(201).json({ success: true, data: { media } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload multiple images at once (max 10)
// @route   POST /api/media/bulk
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const uploadBulkMedia = asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new AppError("Please select at least one file to upload.", 400));
    }

    const { folder } = req.body;
    const mediaItems = [];

    for (const file of req.files) {
        const isImage = file.mimetype?.startsWith("image/");
        let dimensions = {};

        if (isImage && file.mimetype !== "image/svg+xml") {
            try {
                const meta = await sharp(file.path).metadata();
                dimensions = { width: meta.width, height: meta.height };
            } catch (_) { /* skip dimension read on error */ }
        }

        mediaItems.push({
            originalName: file.originalname,
            filename: file.filename,
            url: file.url,
            alt: "",
            mimeType: file.mimetype,
            size: file.size || 0,
            dimensions,
            type: isImage ? "image" : "document",
            folder: folder || "general",
            uploadedBy: req.user._id,
        });
    }

    const media = await Media.insertMany(mediaItems);

    logger.info(`Bulk upload: ${media.length} files by ${req.user.email}`);

    res.status(201).json({
        success: true,
        count: media.length,
        data: { media },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get media library (admin)
// @route   GET /api/media
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMedia = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Media.find(), req.query)
        .filter()
        .search(["originalName", "alt", "caption"])
        .sort()
        .project()
        .paginate();

    // Type filter — image or document
    if (req.query.type) {
        features.query = features.query.where("type").equals(req.query.type);
    }

    // Folder filter
    if (req.query.folder) {
        features.query = features.query.where("folder").equals(req.query.folder);
    }

    const [media, total] = await Promise.all([
        features.query
            .select("-__v")
            .populate("uploadedBy", "name")
            .maxTimeMS(5000),
        Media.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { media },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single media item (admin)
// @route   GET /api/media/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMediaItem = asyncHandler(async (req, res, next) => {
    const media = await Media.findById(req.params.id)
        .populate("uploadedBy", "name")
        .maxTimeMS(5000);

    if (!media) {
        return next(new AppError("Media item not found.", 404));
    }

    res.status(200).json({ success: true, data: { media } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update media alt text / caption / folder (admin)
// @route   PATCH /api/media/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateMedia = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    // Only allow updating metadata — never the file itself
    const allowedFields = ["alt", "caption", "folder"];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields provided for update.", 400));
    }

    const media = await Media.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).maxTimeMS(5000);

    if (!media) {
        return next(new AppError("Media item not found.", 404));
    }

    res.status(200).json({ success: true, data: { media } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all unique folder names (admin — for folder browser)
// @route   GET /api/media/folders
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getFolders = asyncHandler(async (_req, res) => {
    const folders = await Media.distinct("folder").maxTimeMS(3000);
    res.status(200).json({ success: true, data: { folders } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete single media item + file from disk (admin only)
// @route   DELETE /api/media/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteMedia = asyncHandler(async (req, res, next) => {
    const media = await Media.findById(req.params.id);

    if (!media) {
        return next(new AppError("Media item not found.", 404));
    }

    // Delete physical file
    deleteFromDisk(media.url);

    await media.deleteOne();

    logger.info(`Media deleted: ${media.filename} by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Media deleted successfully." });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk delete media items + files from disk (admin only)
// @route   DELETE /api/media/bulk
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const bulkDeleteMedia = asyncHandler(async (req, res, next) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return next(new AppError("Please provide an array of media IDs to delete.", 400));
    }

    // Fetch all items first to get their file URLs
    const items = await Media.find({ _id: { $in: ids } }).select("url filename");

    if (items.length === 0) {
        return next(new AppError("No media items found for the provided IDs.", 404));
    }

    // Delete all files from disk
    items.forEach((item) => deleteFromDisk(item.url));

    // Delete all DB records
    const result = await Media.deleteMany({ _id: { $in: ids } });

    logger.info(`Bulk delete: ${result.deletedCount} media items by ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: `${result.deletedCount} media item(s) deleted successfully.`,
    });
});

module.exports = {
    uploadMedia,
    uploadBulkMedia,
    getMedia,
    getMediaItem,
    updateMedia,
    getFolders,
    deleteMedia,
    bulkDeleteMedia,
};