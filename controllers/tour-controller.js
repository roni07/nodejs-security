const express = require('express');
const router = express.Router();
const Tour = require('../models/tour-model');
const AppError = require('../utils/app-error');
const {uploadMultipleResizedImage, resizeMultipleImage} = require('../middleware/tour-image-uploader');

router.get('/list', async (req, res, next) => {
   const tours = await Tour.find();
   return res.status(200).send(tours);
});

router.get('/by-id/:id', async (req, res, next) => {
   const tour = await Tour.findById(req.params.id);

   if (!tour) return next(new AppError(`Tour not found by id ${req.params.id}`, 404));

   return res.status(200).send(tour);
});

router.post('/create', async (req, res, next) => {
   const tour = new Tour(req.body);
   await tour.save();
   return res.status(201).send(tour);
});

router.put('/update/:id', uploadMultipleResizedImage, resizeMultipleImage, async (req, res, next) => {

   const tour = await Tour.findOneAndUpdate(req.params.id, req.body, {
      new: true
   });

   if (!tour) return next(new AppError(`Tour is not find with id ${req.params.id}`, 404));

   return res.status(200).send(tour);
});

module.exports = router;