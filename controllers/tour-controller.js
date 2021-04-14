const Tour = require('../models/tour-model');
const AppError = require('../utils/app-error');

exports.getTourList = async (req, res, next) => {
   const tours = await Tour.find();
   return res.status(200).send(tours);
};

exports.getTourById = async (req, res, next) => {
   const tour = await Tour.findById(req.params.id);

   if (!tour) return next(new AppError(`Tour not found by id ${req.params.id}`, 404));

   return res.status(200).send(tour);
};

exports.createTour = async (req, res, next) => {
   const tour = new Tour(req.body);
   await tour.save();
   return res.status(201).send(tour);
};

exports.updateTour = async (req, res, next) => {

   const tour = await Tour.findOneAndUpdate(req.params.id, req.body, {
      new: true
   });

   if (!tour) return next(new AppError(`Tour is not find with id ${req.params.id}`, 404));

   return res.status(200).send(tour);
};
