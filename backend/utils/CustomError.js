class CustomError extends Error {
    constructor(errors, status) {

        const message = errors.map(detail => detail.message).join(', ');
        super(message); // Call the parent constructor with the joined message
        this.name = this.constructor.name; // Set the error name to the class name
        this.status = status;
        this.errors = errors; // Store the original errors for further use

        // Ensure the error is properly serialized when converted to JSON
        this.toJSON = function() {
            return {
                name: this.name,
                message: this.message,
                status: this.status,
                errors: this.errors,
            };
        };
    }
}

module.exports = CustomError;