const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async-error');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/app-error");

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true // cookies can not be accessed or modified by the browser (prevent cross scripting attack)
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //only https connection allowed

    res.cookie('jwt', token, cookieOptions);

    return res.status(statusCode).send({
        token
    });
}

router.post('/signup', catchAsync(async (req, res, next) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    await user.save();
    return res.status(201).send({data: user});
}));

router.post('/login', catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) return next(new AppError(`Please provide password and email`, 400));

    const user = await User.findOne({email}).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        console.log('i am here');
        return next(new AppError('Incorrect password or email', 401));
    }

    return createSendToken(user, 200, res);
}));

module.exports = router;
