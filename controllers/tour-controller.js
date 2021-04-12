const express = require('express');
const router = express.Router();
const Tour = require('../models/tour-model');
const catchAsync = require('../utils/catch-async-error');
const AppError = require('../utils/app-error');

router.get('/list', catchAsync(async (req, res, next) => {
   const tours = await Tour.find();
   return res.status(200).send(tours);
}));

router.get('/by-id/:id', catchAsync(async (req, res, next) => {
   const tour = await Tour.findById(req.params.id);

   if (!tour) return next(new AppError(`Tour not found by id ${req.params.id}`, 404));

   return res.status(200).send(tour);
}));

router.post('/create', catchAsync(async (req, res, next) => {
   const tour = new Tour(req.body);
   await tour.save();
   return res.status(201).send(tour);
}));

module.exports = router;