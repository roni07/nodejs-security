const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },
    rating: {
        type: Number,
        default: 3
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
        min: [1, 'Tour price must be greater than zero']
    }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour