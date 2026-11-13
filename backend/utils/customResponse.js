// Every API response has the same shape: { statusCode, message, data }.
const customResponse = (res, statusCode, message, data = null) =>
  res.status(statusCode).json({ statusCode, message, data });

module.exports = customResponse;
