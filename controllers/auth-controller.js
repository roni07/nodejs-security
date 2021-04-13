const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async-error');
const AppError = require("../utils/app-error");
const generateToken = require('../utils/generate-token');

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
        return next(new AppError('Incorrect password or email', 401));
    }

    return generateToken(user, 200, res);
}));

module.exports = router;
