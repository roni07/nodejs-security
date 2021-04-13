const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async-error');
const AppError = require('../utils/app-error');
const auth = require('../middleware/auth-middleware');
const jwt = require('jsonwebtoken');
const APISearch = require('../utils/api-search');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

router.get('/list', auth, catchAsync(async (req, res, next) => {

    const apiSearch = new APISearch(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    const totalElements = await User.countDocuments(apiSearch.searchValue);

    const users = await apiSearch.query;
    return res.status(200).send({page: apiSearch.pageNumber, size: apiSearch.pageSize,totalElements, content: users});
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

router.put('/update-password/:id', catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return next(new AppError(`User not found by id ${req.params.id}`, 404));

    if (!await (user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordChangedAt = Date.now();

    // User.findByIdAndUpdate will not work for correct password checker as well as
    // passwordConfirm validation
    await user.save();
    const token = signToken(user._id);

    return res.status(200).send({token, user});
}));

router.put('/update/:id', catchAsync(async (req, res, next) => {
    const filterBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.params.id, filterBody, {
        new: true,
        runValidators: true
    });

    if (!user) return next(new AppError(`User not found with id ${req.params.id}`, 404));

    return res.status(200).send({data: user});
}));

router.delete('/delete/:id', catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, {active: false});
    if (!user) return next(new AppError(`User not found with id ${req.params.id}`, 404));
    return res.status(200).send(`ID: ${req.params.id} user deleted successfully`);
}));

module.exports = router;
