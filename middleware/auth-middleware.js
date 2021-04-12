const AppError = require("../utils/app-error");
const catchAsync = require('../utils/catch-async-error');
const jwt = require('jsonwebtoken');
const User = require("../models/user-model");
const {promisify} = require('util');

module.exports = catchAsync(async (req, res, next) => {
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Access denied. Please provide the token', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('The user belonging to this token does not exist', 401));

    next();
});