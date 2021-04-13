const multer = require('multer');
const sharp = require('sharp');

const diskMulterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.params.id}-${Date.now()}.${ext}`);
    }
});

const memoryMulterStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
};

exports.uploadPhoto = multer({
   storage: diskMulterStorage,
   fileFilter: multerFilter
});

exports.uploadResizedPhoto = multer({
    storage: memoryMulterStorage,
    fileFilter: multerFilter
});

exports.resizePhoto = (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.params.id}-${Date.now()}.webp`;

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
};
