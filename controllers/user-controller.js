const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async-error');
const AppError = require('../utils/app-error');
const auth = require('../middleware/auth-middleware');

router.get('/list', auth, catchAsync(async (req, res, next) => {
    const users = await User.find();
    return res.status(200).send(users);
}));

router.get('/by-id/:id', catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError(`User not found by id ${req.params.id}`, 404));
    return res.status(200).send(user);
}));

router.post('/create', catchAsync(async (req, res, next) => {
    const user = new User(req.body);
    await user.save();
    return res.status(201).send(user);
}));

module.exports = router;
