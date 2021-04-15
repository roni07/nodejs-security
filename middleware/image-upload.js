const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/app-error');
const fs = require('fs');

const baseUrlFormat = baseUrl => baseUrl.replace('/api/', '');

const diskMulterStorage = multer.diskStorage({// for normal photo

    destination: (req, file, cb) => {

        const path = `public/img/${baseUrlFormat(req.baseUrl)}`;
        fs.mkdirSync(path, {recursive: true});

        cb(null, path);
    },
    filename: (req, file, cb) => {
        const imageName = baseUrlFormat(req.baseUrl);
        const ext = file.mimetype.split('/')[1];
        cb(null, `${imageName.substring(0, imageName.length - 1)}-${req.params.id}-${Date.now()}.${ext}`);
    }
});

const memoryMulterStorage = multer.memoryStorage(); // for resize photo

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
};

exports.uploadImage = multer({
    storage: diskMulterStorage,
    fileFilter: multerFilter
});

exports.uploadResizedImage = multer({
    storage: memoryMulterStorage,
    fileFilter: multerFilter
});

exports.resizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const imageFolderName = baseUrlFormat(req.baseUrl);

    const path = `public/img/${baseUrlFormat(req.baseUrl)}`;
    fs.mkdirSync(path, {recursive: true});

    req.file.filename = `${imageFolderName.substring(0, imageFolderName.length - 1)}-${req.params.id}-${Date.now()}.webp`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('webp')
        .jpeg({quality: 90})
        .toFile(`${path}/${req.file.filename}`);

    next();
};