const morgan = require('morgan');
const express = require('express');
const tourRoutes = require('./tour-routes');
const userRoutes = require('./user-routes');
const authRoutes = require('./auth-routes');
const AppError = require('../utils/app-error')
const globalErrorHandler = require('../error-handler/global-error-handler');
const rateLimit = require('../middleware/rate-limit');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

require('../config/server')();

module.exports = function (app) {
    app.use(helmet()); // set security http headers

    app.use('/api/auth/login', rateLimit); //preventing brute force attack

    app.use(express.json({limit: '10kb'})); // maximum 10 Kilobytes data can be accepted by contained body

    // Data sanitization against NoSQL query injection({"email": {"$gt": ""}, "password":"123456"})
    app.use(mongoSanitize());

    app.use(xss()); // Data sanitization against XSS

    app.use(morgan('dev'));

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/tours', tourRoutes);

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    app.use(globalErrorHandler);
}
