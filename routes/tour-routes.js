const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour-controller');
const {uploadMultipleResizedImage, resizeMultipleImage} = require('../middleware/tour-image-uploader');

router.get('/list', tourController.getTourList);
router.get('/list-new', tourController.getNewTourList);
router.get('/by-id/:id', tourController.getTourById);
router.post('/create', tourController.createTour);
router.put('/update/:id', uploadMultipleResizedImage, resizeMultipleImage, tourController.updateTour);

module.exports = router;