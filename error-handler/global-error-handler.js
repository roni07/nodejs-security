const AppError = require('../utils/app-error');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).send({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).send({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR ===', err);
        res.status(500).send({
            status: 'error',
            message: 'Something went wrong....!'
        })
    }
}

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateError = error => {
    // we can check */Forest Hike/* using the error parameter
    return new AppError(`Duplicate field value ${error.keyValue.email}. Please use another value..!`, 400);
}

const handleValidationError = error => {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = error => new AppError('Invalid token', 401);
const handleJWTExpiredError = error => new AppError('Token expired. Please try to login again', 401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = err;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(error, res);
    }
}