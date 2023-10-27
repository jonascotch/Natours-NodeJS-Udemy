const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login)
router.get('/login', authController.logout);

router.post(
  '/forgotPassword',
  authController.forgotPassword,
);
router.patch(
  '/resetPassword/:token',
  authController.resetPassword,
);

// this middleware makes this controller function run before all the routes that are after this
router.use(authController.protect);

router.patch(
  '/updatePassword',
  authController.updatePassword,
);

router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteUser);

router.get(
  '/me',
  userController.getMe,
  userController.getUser,
);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
