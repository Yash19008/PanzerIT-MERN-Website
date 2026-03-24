/**
 * asyncHandler — wraps async route handlers so any rejected promise
 * is automatically forwarded to Express's next(err) error handler.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 *
 * Without this, unhandled rejections in async controllers would either
 * crash the process or silently hang the request.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;