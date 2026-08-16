const { customResponse } = require("./customResponse");

const tryCatchFunction = async (func, res, successMessage, errorMessage, data) => {
    try {
        const result = await func(data);
        return customResponse(res, 200, successMessage, result);
    } catch (error) {
        console.error("Error during database operation:", error);
        return customResponse(res, 400, errorMessage, null, true);
    }
};

module.exports = tryCatchFunction;