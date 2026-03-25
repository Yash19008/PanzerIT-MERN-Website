const Brand = require("../models/Brand");
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
// @desc    Get all published brands — cards only (public)
// @route   GET /api/brands
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getBrands = asyncHandler(async (req, res) => {
    const baseQuery = Brand.find({ status: "published" });

    const features = new APIFeatures(baseQuery, req.query)
        .search(["name", "tagline", "summary"])
        .sort()
        .project()
        .paginate();

    // Category filter
    if (req.query.category) {
        features.query = features.query.where("category").equals(req.query.category);
    }

    // Featured-only filter (for homepage logo section)
    if (req.query.featured === "true") {
        features.query = features.query.where("isFeatured").equals(true);
    }

    // Default sort: featured first, then by order
    if (!req.query.sort) {
        features.query = features.query.sort({ isFeatured: -1, order: 1 });
    }

    const [brands, total] = await Promise.all([
        features.query
            .select("-content -seo -__v")   // strip heavy fields for listing
            .maxTimeMS(5000),
        Brand.countDocuments({ status: "published" }),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { brands },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single published brand by slug — full detail page (public)
// @route   GET /api/brands/:slug
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getBrandBySlug = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findOne({
        slug: req.params.slug,
        status: "published",
    })
        .select("-__v")
        .maxTimeMS(5000);

    if (!brand) {
        return next(new AppError("Brand not found.", 404));
    }

    res.status(200).json({ success: true, data: { brand } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all brands — drafts + published (admin)
// @route   GET /api/brands/admin
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminBrands = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Brand.find(), req.query)
        .filter()
        .search(["name", "tagline", "summary"])
        .sort()
        .project()
        .paginate();

    const [brands, total] = await Promise.all([
        features.query
            .select("-content -seo -__v")
            .maxTimeMS(5000),
        Brand.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { brands },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single brand by ID — full content (admin)
// @route   GET /api/brands/admin/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id).maxTimeMS(5000);

    if (!brand) {
        return next(new AppError("Brand not found.", 404));
    }

    res.status(200).json({ success: true, data: { brand } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create brand (admin)
// @route   POST /api/brands
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createBrand = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const {
        name, tagline, summary, content,
        logo, coverImage, website, category,
        order, isFeatured, status, seo,
    } = req.body;

    const slug = await generateUniqueSlug(name, Brand);

    const metaTitle = seo?.metaTitle || name.substring(0, 70);
    const metaDescription = seo?.metaDescription || (tagline || summary || "").substring(0, 160);

    const brand = await Brand.create({
        name,
        slug,
        tagline,
        summary,
        content,
        logo,
        coverImage: coverImage || {},
        website,
        category,
        order: order ?? 0,
        isFeatured: isFeatured ?? false,
        status: status || "draft",
        seo: { ...seo, metaTitle, metaDescription },
    });

    logger.info(`Brand created: "${brand.name}" (${brand._id}) by ${req.user.email}`);

    res.status(201).json({ success: true, data: { brand } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update brand (admin)
// @route   PUT /api/brands/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateBrand = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        return next(new AppError("Brand not found.", 404));
    }

    const {
        name, tagline, summary, content,
        logo, coverImage, website, category,
        order, isFeatured, status, seo,
    } = req.body;

    // Regenerate slug only if name changed
    if (name && name !== brand.name) {
        brand.slug = await generateUniqueSlug(name, Brand, brand._id);
        brand.name = name;
    }

    if (tagline !== undefined) brand.tagline = tagline;
    if (summary !== undefined) brand.summary = summary;
    if (content !== undefined) brand.content = content;
    if (logo !== undefined) brand.logo = logo;
    if (coverImage !== undefined) brand.coverImage = coverImage;
    if (website !== undefined) brand.website = website;
    if (category !== undefined) brand.category = category;
    if (order !== undefined) brand.order = order;
    if (isFeatured !== undefined) brand.isFeatured = isFeatured;
    if (status !== undefined) brand.status = status;
    if (seo !== undefined) brand.seo = { ...brand.seo, ...seo };

    await brand.save();

    logger.info(`Brand updated: "${brand.name}" (${brand._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, data: { brand } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle featured status (admin) — quick action from list view
// @route   PATCH /api/brands/:id/featured
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const toggleFeatured = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        return next(new AppError("Brand not found.", 404));
    }

    brand.isFeatured = !brand.isFeatured;
    await brand.save();

    logger.info(
        `Brand "${brand.name}" isFeatured=${brand.isFeatured} toggled by ${req.user.email}`
    );

    res.status(200).json({
        success: true,
        message: `Brand ${brand.isFeatured ? "marked as featured" : "removed from featured"}.`,
        data: { isFeatured: brand.isFeatured },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reorder brands (admin) — bulk update display order
// @route   PATCH /api/brands/reorder
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const reorderBrands = asyncHandler(async (req, res, next) => {
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
        return next(new AppError("Please provide an array of { id, order } objects.", 400));
    }

    await Promise.all(
        order.map(({ id, order: newOrder }) =>
            Brand.findByIdAndUpdate(id, { order: newOrder }).maxTimeMS(3000)
        )
    );

    logger.info(`Brands reordered by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Brands reordered successfully." });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete brand (admin only)
// @route   DELETE /api/brands/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findByIdAndDelete(req.params.id).maxTimeMS(5000);

    if (!brand) {
        return next(new AppError("Brand not found.", 404));
    }

    logger.info(`Brand deleted: "${brand.name}" (${brand._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Brand deleted successfully." });
});

module.exports = {
    getBrands,
    getBrandBySlug,
    getAdminBrands,
    getAdminBrand,
    createBrand,
    updateBrand,
    toggleFeatured,
    reorderBrands,
    deleteBrand,
};