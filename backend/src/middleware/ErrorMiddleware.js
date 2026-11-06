/*
Purpose:
Handle API errors in one place.
*/

const errorHandler = (error, request, response, next) => {
    console.error("API error:", error.message);

    if (response.headersSent) {
        return next(error);
    }

    const statusCode = error.status || error.statusCode || 500;

    return response.status(statusCode).json({
        message: statusCode === 500
            ? "Internal server error"
            : error.message
    });
};

module.exports = errorHandler;