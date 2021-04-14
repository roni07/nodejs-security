const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async-error');
const AppError = require("../utils/app-error");
const generateToken = require('../utils/generate-token');
const Email = require('../utils/email');
const crypto = require('crypto');

router.post('/signup', catchAsync(async (req, res, next) => {

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    await user.save();

    await new Email(user, 'http://mportfolio.codes:3000/').sendWelcome();

    return res.status(201).send({data: user});
}));

router.post('/login', catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) return next(new AppError(`Please provide password and email`, 400));

    const user = await User.findOne({email}).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect password or email', 401));
    }

    return generateToken(user, 200, res);
}));

router.post('/forgot-password', catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new AppError(`User not found with email ${req.body.email}`, 404));

    const resetToken = user.createPasswordResetToken();

    await user.save({validateBeforeSave: false});

    await new Email(user, resetToken).sendPasswordReset();

    return res.status(200).send(`Token send to email ${req.body.email}`);
}));

router.put('/reset-password/:token', catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpire: {$gt: Date.now()}});

    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    return generateToken(user, 200, res);
}));

module.exports = router;
