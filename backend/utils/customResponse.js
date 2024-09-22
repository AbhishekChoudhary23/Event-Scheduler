const customResponse = (res, statusCode, message, data = null, error = false) => {
    const response = {
        statusCode,
        message,
    };

    if (error) {
        response.timeStamp = new Date().toISOString();
    } else {
        response.data = data;
    }

    return res.json(response);
};

module.exports = { customResponse };