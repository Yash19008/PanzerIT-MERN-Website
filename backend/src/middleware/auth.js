const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// ─── protect — verifies JWT and attaches user to req ─────────────────────────
/**
 * Reads token from:
 *   1. Authorization: Bearer <token>  (primary — used by admin SPA)
 *   2. Cookie: jwt                    (fallback — httpOnly cookie)
 */
const protect = asyncHandler(async (req, _res, next) => {
    let token;

    // 1. Check Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    // 2. Fallback to httpOnly cookie
    else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You are not logged in. Please log in to continue.", 401));
    }

    // Verify token — throws JsonWebTokenError or TokenExpiredError (caught by errorHandler)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists (could have been deleted after token was issued)
    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (!user) {
        return next(new AppError("The account associated with this token no longer exists.", 401));
    }

    // Check account is active
    if (!user.isActive) {
        return next(new AppError("Your account has been deactivated. Please contact support.", 403));
    }

    // Check password hasn't changed since token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
        return next(new AppError("Password was recently changed. Please log in again.", 401));
    }

    // Attach user to request for downstream handlers
    req.user = user;
    next();
});

// ─── restrictTo — role-based access control ───────────────────────────────────
/**
 * Usage: router.delete("/posts/:id", protect, restrictTo("admin"), deletePost)
 *
 * @param {...string} roles - Allowed roles (e.g. "admin", "editor")
 */
const restrictTo = (...roles) =>
    (req, _res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action.", 403)
            );
        }
        next();
    };

module.exports = { protect, restrictTo };