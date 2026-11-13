const CustomError = require('../utils/CustomError');

// Last middleware: turns any error into the standard JSON response.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.status).json({ statusCode: err.status, message: err.message });
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ statusCode: 400, message: 'Request body is not valid JSON' });
  }

  // Unexpected errors: log the details, keep them away from the client.
  console.error(err);
  return res.status(500).json({ statusCode: 500, message: 'Something went wrong on the server' });
};

module.exports = errorHandler;
