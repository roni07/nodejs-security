const reviewController = require('../controllers/review-controller');
const express = require('express');
const router = express.Router();
const {authenticate} = require('../security/security');

router.get('/list', reviewController.getReviewList);
router.post('/create/:tourId', authenticate, reviewController.createReview);
router.put('/update/:id', reviewController.updateReview);
router.delete('/delete/:id', reviewController.deleteReview);

module.exports = router;