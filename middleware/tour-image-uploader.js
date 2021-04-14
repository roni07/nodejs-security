const sharp = require('sharp');
const {uploadResizedImage} = require('./image-upload');

exports.uploadMultipleResizedImage = uploadResizedImage.fields([
    {name: 'coverImage', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeMultipleImage = async (req, res, next) => {

    if (!req.files.coverImage) return next();

    req.body.coverImage = `tour-${req.params.id}-${Date.now()}-cover.webp`;

    await sharp(req.files.coverImage[0].buffer)
        .resize(500, 500)
        .toFormat('webp')
        .webp({quality: 90})
        .toFile(`public/img/tours/${req.body.coverImage}`);

    if (!req.files.images || req.files.images === 'undefined') return next();
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.webp`;

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('webp')
            .webp({quality: 90})
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
    }));

    next();
};