// An error that carries the HTTP status the client should receive.
class CustomError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
  }
}

module.exports = CustomError;
