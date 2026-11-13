// Wraps an async route so any thrown error reaches the error handler middleware.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
