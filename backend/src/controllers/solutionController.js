const Solution = require("../models/Solution");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const APIFeatures = require("../utils/apiFeatures");
const { generateUniqueSlug } = require("../utils/slugify");
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
// @desc    Get all published solutions (public)
// @route   GET /api/solutions
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getSolutions = asyncHandler(async (req, res) => {
    const baseQuery = Solution.find({ status: "published" });

    const features = new APIFeatures(baseQuery, req.query)
        .search(["title", "tagline", "summary"])
        .sort()
        .project()
        .paginate();

    // Category filter
    if (req.query.category) {
        features.query = features.query.where("category").equals(req.query.category);
    }

    // Default sort by order field for public listing
    if (!req.query.sort) {
        features.query = features.query.sort({ order: 1, publishedAt: -1 });
    }

    const [solutions, total] = await Promise.all([
        features.query
            .select("-description -seo -__v")  // strip heavy fields for listing
            .maxTimeMS(5000),
        Solution.countDocuments({ status: "published" }),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { solutions },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single published solution by slug (public)
// @route   GET /api/solutions/:slug
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getSolutionBySlug = asyncHandler(async (req, res, next) => {
    const solution = await Solution.findOne({
        slug: req.params.slug,
        status: "published",
    }).maxTimeMS(5000);

    if (!solution) {
        return next(new AppError("Solution not found.", 404));
    }

    res.status(200).json({ success: true, data: { solution } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all solutions — drafts + published (admin)
// @route   GET /api/solutions/admin
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminSolutions = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Solution.find(), req.query)
        .filter()
        .search(["title", "tagline", "summary"])
        .sort()
        .project()
        .paginate();

    const [solutions, total] = await Promise.all([
        features.query
            .select("-description -__v")
            .maxTimeMS(5000),
        Solution.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { solutions },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single solution by ID (admin)
// @route   GET /api/solutions/admin/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminSolution = asyncHandler(async (req, res, next) => {
    const solution = await Solution.findById(req.params.id).maxTimeMS(5000);

    if (!solution) {
        return next(new AppError("Solution not found.", 404));
    }

    res.status(200).json({ success: true, data: { solution } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create solution (admin)
// @route   POST /api/solutions
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createSolution = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const {
        title, tagline, description, summary,
        coverImage, icon, features, category,
        order, status, seo,
    } = req.body;

    const slug = await generateUniqueSlug(title, Solution);

    const metaTitle = seo?.metaTitle || title.substring(0, 70);
    const metaDescription = seo?.metaDescription || (tagline || summary || "").substring(0, 160);

    const solution = await Solution.create({
        title,
        slug,
        tagline,
        description,
        summary,
        coverImage: coverImage || {},
        icon,
        features: features || [],
        category,
        order: order ?? 0,
        status: status || "draft",
        seo: { ...seo, metaTitle, metaDescription },
    });

    logger.info(`Solution created: "${solution.title}" (${solution._id}) by ${req.user.email}`);

    res.status(201).json({ success: true, data: { solution } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update solution (admin)
// @route   PUT /api/solutions/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateSolution = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const solution = await Solution.findById(req.params.id);
    if (!solution) {
        return next(new AppError("Solution not found.", 404));
    }

    const {
        title, tagline, description, summary,
        coverImage, icon, features, category,
        order, status, seo,
    } = req.body;

    // Regenerate slug only if title changed
    if (title && title !== solution.title) {
        solution.slug = await generateUniqueSlug(title, Solution, solution._id);
        solution.title = title;
    }

    if (tagline !== undefined) solution.tagline = tagline;
    if (description !== undefined) solution.description = description;
    if (summary !== undefined) solution.summary = summary;
    if (coverImage !== undefined) solution.coverImage = coverImage;
    if (icon !== undefined) solution.icon = icon;
    if (features !== undefined) solution.features = features;
    if (category !== undefined) solution.category = category;
    if (order !== undefined) solution.order = order;
    if (status !== undefined) solution.status = status;
    if (seo !== undefined) solution.seo = { ...solution.seo, ...seo };

    await solution.save();

    logger.info(`Solution updated: "${solution.title}" (${solution._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, data: { solution } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reorder solutions (admin) — bulk update display order
// @route   PATCH /api/solutions/reorder
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const reorderSolutions = asyncHandler(async (req, res, next) => {
    const { order } = req.body;

    // Expects: [{ id: "...", order: 0 }, { id: "...", order: 1 }, ...]
    if (!Array.isArray(order) || order.length === 0) {
        return next(new AppError("Please provide an array of { id, order } objects.", 400));
    }

    // Run all updates in parallel
    await Promise.all(
        order.map(({ id, order: newOrder }) =>
            Solution.findByIdAndUpdate(id, { order: newOrder }).maxTimeMS(3000)
        )
    );

    logger.info(`Solutions reordered by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Solutions reordered successfully." });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete solution (admin only)
// @route   DELETE /api/solutions/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteSolution = asyncHandler(async (req, res, next) => {
    const solution = await Solution.findByIdAndDelete(req.params.id).maxTimeMS(5000);

    if (!solution) {
        return next(new AppError("Solution not found.", 404));
    }

    logger.info(`Solution deleted: "${solution.title}" (${solution._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Solution deleted successfully." });
});

module.exports = {
    getSolutions,
    getSolutionBySlug,
    getAdminSolutions,
    getAdminSolution,
    createSolution,
    updateSolution,
    reorderSolutions,
    deleteSolution,
};