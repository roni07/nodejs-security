const Review = require('../models/review-model');
const AppError = require("../utils/app-error");

exports.getReviewList = async (req, res, next) => {
    const reviews = await Review.find()
        .populate({
            path: 'tour',
            select: 'name'
        })
        .populate({
            path: 'user',
            select: 'name photo'
        });

    return res.status(200).send({data: reviews});
}

exports.createReview = async (req, res, next) => {

    req.body.tour = req.params.tourId;
    req.body.user = req.user.id;

    const oldReview = Review.find({tour: req.user.id}); // alternative if indexing not workingl
    if (oldReview) return next(new AppError(`Review already exist with id ${req.user.id}`, 400));

    const review = await Review.create(req.body);

    return res.status(201).send({data: review});
}

exports.updateReview = async (req, res, next) => {

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    if (!review) return next(new AppError(`Review not found with id ${req.params.id}`, 404));

    return res.status(200).send({data: review});
};

exports.deleteReview = async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return next(new AppError(`Review not found with id ${req.params.id}`, 404));

    return res.status(200).send('Deleted');
}