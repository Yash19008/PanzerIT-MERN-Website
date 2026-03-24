const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");
const { validationResult } = require("express-validator");

// ─── Helper: send JWT response ────────────────────────────────────────────────
/**
 * Signs a token, optionally sets an httpOnly cookie, and sends the response.
 *
 * @param {object} user    - Mongoose User document
 * @param {number} statusCode
 * @param {object} res     - Express response
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.signToken();

    // httpOnly cookie config (used by browser-based admin panel)
    const cookieOptions = {
        expires: new Date(
            Date.now() +
            (parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7) *
            24 * 60 * 60 * 1000
        ),
        httpOnly: true,                                      // not accessible via JS
        sameSite: "strict",                                  // CSRF protection
        secure: process.env.NODE_ENV === "production",     // HTTPS only in prod
    };

    res.cookie("jwt", token, cookieOptions);

    res.status(statusCode).json({
        success: true,
        token,   // also returned in body for Authorization: Bearer usage
        data: { user },
    });
};

// ─── Helper: validate request and throw on errors ────────────────────────────
const validateRequest = (req, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors
            .array()
            .map((e) => e.msg)
            .join(". ");
        return next(new AppError(message, 422));
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res, next) => {
    validateRequest(req, next);

    const { email, password } = req.body;

    // 1. Find user — explicitly select password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
        "+password +passwordChangedAt"
    );

    // 2. Check user exists and password is correct
    //    Deliberate: combine both checks to prevent user enumeration attacks
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError("Incorrect email or password.", 401));
    }

    // 3. Check account is active
    if (!user.isActive) {
        return next(
            new AppError("Your account has been deactivated. Please contact support.", 403)
        );
    }

    // 4. Update last login timestamp (fire-and-forget — don't await)
    User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).exec();

    logger.info(`Admin login: ${user.email} (${user.role})`);

    sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout — clear JWT cookie
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
    // Overwrite cookie with an expired one — clears it in the browser
    res.cookie("jwt", "logged_out", {
        expires: new Date(Date.now() + 5 * 1000), // 5 seconds
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });

    logger.info(`Admin logout: ${req.user?.email}`);

    res.status(200).json({ success: true, message: "Logged out successfully." });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
    // req.user is already attached by protect middleware
    res.status(200).json({ success: true, data: { user: req.user } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res, next) => {
    validateRequest(req, next);

    const { currentPassword, newPassword } = req.body;

    // 1. Fetch user with password
    const user = await User.findById(req.user._id).select("+password");

    // 2. Verify current password
    if (!(await user.comparePassword(currentPassword))) {
        return next(new AppError("Your current password is incorrect.", 401));
    }

    // 3. Prevent reusing the same password
    if (await user.comparePassword(newPassword)) {
        return next(
            new AppError("New password must be different from your current password.", 400)
        );
    }

    // 4. Update — pre-save hook will hash + set passwordChangedAt
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed: ${user.email}`);

    // 5. Issue a fresh token (old tokens invalidated by passwordChangedAt)
    sendTokenResponse(user, 200, res);
});

module.exports = { login, logout, getMe, changePassword };