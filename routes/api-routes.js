const morgan = require('morgan');
const express = require('express');
const tour = require('../controllers/tour-controller');
const user = require('../controllers/user-controller');
const auth = require('../controllers/auth-controller');
const AppError = require('../utils/app-error')
const globalErrorHandler = require('../error-handler/global-error-handler');

require('../config/server')();

module.exports = function (app) {
    app.use(express.json());
    app.use(morgan('dev'));

    app.use('/api/auth', auth);
    app.use('/api/user', user);
    app.use('/api/tour', tour);

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    app.use(globalErrorHandler);
}
