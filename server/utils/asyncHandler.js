// Wraps async route handlers to catch errors and forward to errorHandler
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
