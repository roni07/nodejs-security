const mongoose = require('mongoose');
const Tour = require('./tour-model');

const reviewSchema = new mongoose.Schema({
        createdAt: {
            type: Date,
            default: Date.now()
        },
        review: {
            type: String,
            required: [true, 'Review can not be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: {virtuals: true}, //need for virtual populate
        toObject: {virtuals: true},
    }
);

// Indexing
reviewSchema.index({rating: 1});

/*reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'photo name'
    });
    next();
});*/

// Start calculating tour ratings average
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});
// End calculating tour ratings average

reviewSchema.pre(/^findOneAnd/, async function (next) { // when review will be update or delete tour calculation will be update
    this.oldReview = await this.findOne(); // findOne() == findById
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    //   this.oldReview = await this.findOne(); Does not work here, because query has already executed
    await this.oldReview.constructor.calcAverageRatings(this.oldReview.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;