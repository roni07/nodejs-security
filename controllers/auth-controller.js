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

router.post('/signup', catchAsync(async (req, res, next) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
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

    const token = signToken(user._id);
    return res.status(200).send({token});
}));

module.exports.protect =  function (req, res, next) {

    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Invalid token', 401));
    }
    next();
};

module.exports = router;
