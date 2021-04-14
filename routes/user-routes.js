const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const {authenticate, hasPermission} = require('../middleware/auth-middleware');
const {uploadResizedImage, resizeImage} = require('../middleware/image-upload');

router.get('/list', authenticate, hasPermission('admin'), userController.getUsrList);
router.get('/by-id/:id', userController.getUserById);
router.post('/create', userController.createUser);
router.put('/update-password/:id', userController.updatePassword);
router.put('/update/:id', uploadResizedImage.single('photo'), resizeImage, userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;