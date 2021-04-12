const morgan = require('morgan');
const express = require('express');
const tour = require('../controllers/tour-controller');
const user = require('../controllers/user-controller');
const auth = require('../controllers/auth-controller');
const AppError = require('../utils/app-error')
const globalErrorHandler = require('../error-handler/global-error-handler');
const rateLimit = require('../middleware/rate-limit');
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

require('../config/server')();

module.exports = function (app) {
    app.use(helmet()); // set security http headers

    app.use('/api', rateLimit); //preventing brute force attack

    app.use(express.json({limit: '10kb'})); // maximum 10 Kilobytes data can be accepted by contained body

    // Data sanitization against NoSQL query injection({"email": {"$gt": ""}, "password":"123456"})
    app.use(mongoSanitize());

    app.use(xss()); // Data sanitization against XSS

    app.use(morgan('dev'));

    app.use('/api/auth', auth);
    app.use('/api/user', user);
    app.use('/api/tour', tour);

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    app.use(globalErrorHandler);
}
