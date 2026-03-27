const Setting = require("../models/Setting");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
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

// ─── Helper: get or create the singleton ─────────────────────────────────────
const getOrCreateSettings = async () => {
    let settings = await Setting.findOne({ key: "global" }).maxTimeMS(5000);
    if (!settings) {
        settings = await Setting.create({ key: "global" });
        logger.info("Settings document initialised with defaults.");
    }
    return settings;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get public site settings (frontend uses this for SEO, contact, social)
// @route   GET /api/settings
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getPublicSettings = asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();

    // Strip admin-only fields before sending to public
    const { general, contact, social, seo, maintenance } = settings;

    // If maintenance mode is on, signal the frontend
    res.status(200).json({
        success: true,
        data: {
            general,
            contact,
            social,
            seo,
            maintenance: {
                enabled: maintenance.enabled,
                message: maintenance.message,
            },
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get full settings including scripts (admin)
// @route   GET /api/settings/admin
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminSettings = asyncHandler(async (_req, res) => {
    const settings = await getOrCreateSettings();

    res.status(200).json({ success: true, data: { settings } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update general settings (admin)
// @route   PATCH /api/settings/general
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateGeneralSettings = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    // Merge — only update provided fields
    settings.general = { ...settings.general.toObject(), ...req.body };
    await settings.save();

    logger.info(`General settings updated by ${req.user.email}`);

    res.status(200).json({ success: true, data: { general: settings.general } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update contact settings (admin)
// @route   PATCH /api/settings/contact
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateContactSettings = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    settings.contact = { ...settings.contact.toObject(), ...req.body };
    await settings.save();

    logger.info(`Contact settings updated by ${req.user.email}`);

    res.status(200).json({ success: true, data: { contact: settings.contact } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update social links (admin)
// @route   PATCH /api/settings/social
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateSocialSettings = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    settings.social = { ...settings.social.toObject(), ...req.body };
    await settings.save();

    logger.info(`Social settings updated by ${req.user.email}`);

    res.status(200).json({ success: true, data: { social: settings.social } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update SEO defaults (admin)
// @route   PATCH /api/settings/seo
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateSeoSettings = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    // Deep merge seo + organization sub-object
    const existing = settings.seo.toObject();
    const organization = req.body.organization
        ? { ...existing.organization, ...req.body.organization }
        : existing.organization;

    settings.seo = {
        ...existing,
        ...req.body,
        organization,
    };

    await settings.save();

    logger.info(`SEO settings updated by ${req.user.email}`);

    res.status(200).json({ success: true, data: { seo: settings.seo } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update script injections (admin only — sensitive)
// @route   PATCH /api/settings/scripts
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateScripts = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    settings.scripts = { ...settings.scripts.toObject(), ...req.body };
    await settings.save();

    logger.info(`Script settings updated by ${req.user.email}`);

    res.status(200).json({ success: true, data: { scripts: settings.scripts } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle maintenance mode (admin only)
// @route   PATCH /api/settings/maintenance
// @access  Private (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateMaintenance = asyncHandler(async (req, res, next) => {
    if (!validateRequest(req, next)) return;

    const settings = await getOrCreateSettings();

    if (req.body.enabled !== undefined) settings.maintenance.enabled = req.body.enabled;
    if (req.body.message !== undefined) settings.maintenance.message = req.body.message;

    await settings.save();

    logger.info(
        `Maintenance mode ${settings.maintenance.enabled ? "ENABLED" : "DISABLED"} by ${req.user.email}`
    );

    res.status(200).json({ success: true, data: { maintenance: settings.maintenance } });
});

module.exports = {
    getPublicSettings,
    getAdminSettings,
    updateGeneralSettings,
    updateContactSettings,
    updateSocialSettings,
    updateSeoSettings,
    updateScripts,
    updateMaintenance,
};