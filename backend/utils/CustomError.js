class CustomError extends Error {
    constructor(errors, status) {

        const message = errors.map(detail => detail.message).join(', ');
        super(message); 
        this.name = this.constructor.name; 
        this.status = status;
        this.errors = errors; 

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