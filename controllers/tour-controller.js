const Tour = require('../models/tour-model');
const AppError = require('../utils/app-error');
const APISearch = require('../utils/api-search');
const {tourQuery} = require('../repository/tour-repository');

exports.getTourList = async (req, res, next) => {

    // const tours = await Tour.find().populate('guides');
    const apiSearch = new APISearch(Tour.find(), req.query)
        .filter()
        .pagination();

    const totalElements = await Tour.countDocuments(apiSearch.searchValue);

    const tours = await apiSearch.query;

    return res.status(200).send({page: apiSearch.pageNumber, size: apiSearch.pageSize, totalElements, data: {content: tours}
    });
};

exports.getNewTourList = async (req, res, next) => {
    let page = req.query.page ? parseInt(req.query.page): 1;
    let size = req.query.size ? parseInt(req.query.size) : 10;

    if (page < 1 || size < 1) {
        return res.status(400).send('Page size must be a positive number');
    }

    const skip = (page - 1) * size;
    const searchQuery = tourQuery(req.query);

    const totalElements = await Tour.countDocuments(searchQuery);

    const tours = await Tour.find(searchQuery).skip(skip).limit(size);

    return res.status(200).send({page, size, totalElements, content: tours});
};

exports.getTourById = async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
        .populate({
            path: 'guides',
            select: '-__v'
        }).populate('reviews'); //virtual populate

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
