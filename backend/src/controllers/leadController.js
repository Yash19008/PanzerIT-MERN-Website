const Lead = require("../models/Lead");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const APIFeatures = require("../utils/apiFeatures");
const { sendLeadNotification, sendLeadAutoReply } = require("../utils/sendEmail");
const logger = require("../config/logger");
const { validationResult } = require("express-validator");

// ─── Helper ───────────────────────────────────────────────────────────────────
const validateRequest = (req, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map((e) => e.msg).join(". ");
        return next(new AppError(message, 422));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit contact form (public)
// @route   POST /api/leads
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const submitLead = asyncHandler(async (req, res, next) => {
    if (validateRequest(req, next) === undefined && validationResult(req).isEmpty() === false) return;

    const { name, email, phone, company, message, source } = req.body;

    // Capture IP for spam detection (never returned in responses)
    const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "unknown";

    const lead = await Lead.create({
        name,
        email,
        phone,
        company,
        message,
        source: source || "Website",
        ipAddress,
    });

    // Send emails — fire-and-forget both (don't block response)
    // Wrap individually so one failing doesn't prevent the other
    sendLeadNotification(lead).catch((err) =>
        logger.error(`Lead notification email failed: ${err.message}`)
    );
    sendLeadAutoReply(lead).catch((err) =>
        logger.error(`Lead auto-reply email failed: ${err.message}`)
    );

    logger.info(`New lead submitted: ${lead.email} (${lead._id})`);

    res.status(201).json({
        success: true,
        message: "Thank you for reaching out! We'll get back to you within 1–2 business days.",
    });
    // Note: we intentionally don't return the lead document to the public
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all leads (admin)
// @route   GET /api/leads
// @access  Private (admin, editor)
// ─────────────────────────────────────────────────────────────────────────────
const getLeads = asyncHandler(async (req, res) => {
    const features = new APIFeatures(Lead.find(), req.query)
        .filter()
        .search(["name", "email", "company", "message"])
        .sort()
        .project()
        .paginate();

    const [leads, total] = await Promise.all([
        features.query.maxTimeMS(5000),
        Lead.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
        success: true,
        total,
        pagination: {
            page: features.pagination.page,
            limit: features.pagination.limit,
            totalPages: Math.ceil(total / features.pagination.limit),
        },
        data: { leads },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single lead (admin)
// @route   GET /api/leads/:id
// @access  Private (admin, editor)
// ─────────────────────────────────────────────────────────────────────────────
const getLead = asyncHandler(async (req, res, next) => {
    const lead = await Lead.findById(req.params.id).maxTimeMS(5000);

    if (!lead) {
        return next(new AppError("Lead not found.", 404));
    }

    res.status(200).json({ success: true, data: { lead } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update lead status / notes (admin)
// @route   PATCH /api/leads/:id
// @access  Private (admin, editor)
// ─────────────────────────────────────────────────────────────────────────────
const updateLead = asyncHandler(async (req, res, next) => {
    if (validateRequest(req, next) === undefined && validationResult(req).isEmpty() === false) return;

    // Only allow updating status and notes — never allow overwriting core lead data
    const allowedFields = ["status", "notes"];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields provided for update.", 400));
    }

    const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            new: true,   // return updated doc
            runValidators: true,  // run schema validators on update
        }
    ).maxTimeMS(5000);

    if (!lead) {
        return next(new AppError("Lead not found.", 404));
    }

    logger.info(`Lead ${lead._id} updated — status: ${lead.status} by ${req.user.email}`);

    res.status(200).json({ success: true, data: { lead } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete lead (admin only)
// @route   DELETE /api/leads/:id
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteLead = asyncHandler(async (req, res, next) => {
    const lead = await Lead.findByIdAndDelete(req.params.id).maxTimeMS(5000);

    if (!lead) {
        return next(new AppError("Lead not found.", 404));
    }

    logger.info(`Lead ${lead._id} (${lead.email}) deleted by ${req.user.email}`);

    res.status(200).json({ success: true, message: "Lead deleted successfully." });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get lead stats summary (admin dashboard widget)
// @route   GET /api/leads/stats
// @access  Private (admin, editor)
// ─────────────────────────────────────────────────────────────────────────────
const getLeadStats = asyncHandler(async (_req, res) => {
    const stats = await Lead.aggregate([
        {
            $facet: {
                // Count by status
                byStatus: [
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                ],
                // Total leads
                total: [{ $count: "count" }],
                // Leads in last 30 days
                last30Days: [
                    {
                        $match: {
                            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                        },
                    },
                    { $count: "count" },
                ],
                // Leads in last 7 days
                last7Days: [
                    {
                        $match: {
                            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                        },
                    },
                    { $count: "count" },
                ],
            },
        },
    ]).maxTimeMS(5000);

    const result = stats[0];

    res.status(200).json({
        success: true,
        data: {
            total: result.total[0]?.count || 0,
            last30Days: result.last30Days[0]?.count || 0,
            last7Days: result.last7Days[0]?.count || 0,
            byStatus: result.byStatus,
        },
    });
});

module.exports = {
    submitLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    getLeadStats,
};