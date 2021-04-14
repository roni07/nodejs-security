const AppError = require("../utils/app-error");
const jwt = require('jsonwebtoken');
const User = require("../models/user-model");
const {promisify} = require('util');

module.exports.authenticate = async (req, res, next) => {
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

    if (user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Recently password changed. Please login again', 401));
    }

    req.user = user;
    next();
};

module.exports.hasPermission = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission', 403));

        next();
    }
}