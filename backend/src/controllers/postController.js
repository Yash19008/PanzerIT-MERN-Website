const Post = require("../models/Post");
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
// @desc    Get all published posts (public)
// @route   GET /api/posts
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getPosts = asyncHandler(async (req, res) => {
    const baseQuery = Post.find({ status: "published" });

    const features = new APIFeatures(baseQuery, req.query)
        .search(["title", "excerpt"])   // regex search on public fields only
        .sort()
        .project()
        .paginate();

    // Handle tag filter separately (array field)
    if (req.query.tag) {
        features.query = features.query.where("tags").in(
            Array.isArray(req.query.tag) ? req.query.tag : [req.query.tag]
        );
    }

    const [posts, total] = await Promise.all([
        features.query
            .select("-content -seo -jsonLd -__v")   // strip heavy fields for listing
            .populate("author", "name")
            .maxTimeMS(5000),
        Post.countDocuments({ status: "published" }),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { posts },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single published post by slug (public)
// @route   GET /api/posts/:slug
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getPostBySlug = asyncHandler(async (req, res, next) => {
    const post = await Post.findOne({
        slug: req.params.slug,
        status: "published",
    })
        .populate("author", "name")
        .maxTimeMS(5000);

    if (!post) {
        return next(new AppError("Post not found.", 404));
    }

    res.status(200).json({ success: true, data: { post } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all posts — drafts + published (admin)
// @route   GET /api/posts/admin
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminPosts = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Post.find(), req.query)
        .filter()
        .search(["title", "excerpt"])
        .sort()
        .project()
        .paginate();

    const [posts, total] = await Promise.all([
        features.query
            .select("-content -jsonLd -__v")
            .populate("author", "name")
            .maxTimeMS(5000),
        Post.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { posts },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single post by ID (admin — includes drafts)
// @route   GET /api/posts/admin/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAdminPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id)
        .populate("author", "name email")
        .maxTimeMS(5000);

    if (!post) {
        return next(new AppError("Post not found.", 404));
    }

    res.status(200).json({ success: true, data: { post } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create post (admin)
// @route   POST /api/posts
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createPost = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const {
        title, excerpt, content, tags,
        status, seo, coverImage,
    } = req.body;

    // Auto-generate slug from title
    const slug = await generateUniqueSlug(title, Post);

    // Auto-generate SEO meta from content if not provided
    const metaTitle = seo?.metaTitle || title.substring(0, 70);
    const metaDescription = seo?.metaDescription || (excerpt || "").substring(0, 160);

    const post = await Post.create({
        title,
        slug,
        excerpt,
        content,
        tags: tags || [],
        status: status || "draft",
        coverImage: coverImage || {},
        seo: { ...seo, metaTitle, metaDescription },
        author: req.user._id,
    });

    logger.info(`Post created: "${post.title}" (${post._id}) by ${req.user.email}`);

    res.status(201).json({ success: true, data: { post } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update post (admin)
// @route   PUT /api/posts/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updatePost = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new AppError("Post not found.", 404));
    }

    const {
        title, excerpt, content, tags,
        status, seo, coverImage,
    } = req.body;

    // Regenerate slug only if title changed
    if (title && title !== post.title) {
        post.slug = await generateUniqueSlug(title, Post, post._id);
        post.title = title;
    }

    if (excerpt !== undefined) post.excerpt = excerpt;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) post.status = status;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (seo !== undefined) post.seo = { ...post.seo, ...seo };

    await post.save(); // triggers pre-save hooks (readTime, publishedAt)

    logger.info(`Post updated: "${post.title}" (${post._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, data: { post } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete post (admin only)
// @route   DELETE /api/posts/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id).maxTimeMS(5000);

    if (!post) {
        return next(new AppError("Post not found.", 404));
    }

    logger.info(`Post deleted: "${post.title}" (${post._id}) by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Post deleted successfully." });
});

module.exports = {
    getPosts,
    getPostBySlug,
    getAdminPosts,
    getAdminPost,
    createPost,
    updatePost,
    deletePost,
};