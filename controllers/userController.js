const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((element) => {
    if (allowedFields.includes(element))
      newObj[element] = obj[element];
  });

  // My solution, but the (for...in) loop iterates through all the prototype that includes keys that are not necessary
  // for (key in obj) {
  //   if (allowedFields.includes(key)) {
  //     newObj[key] = obj[key];
  //   }
  // }

  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400,
      ),
    );
  }

  // 2) Filter out properties that are not allowed to be changed
  const filteredData = filterObj(req.body, 'name', 'email');

  // 3) Update user data
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredData,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not defined. Please use /signup instead',
  });
};

//Do not update passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.findOne(User);
exports.getAllUsers = factory.getAll(User);

// The handler factory takes care of this
// exports.deleteUser = catchAsync(async (req, res, next) => {
//   console.log(req.user.id);
//   await User.findByIdAndUpdate(req.user.id, {
//     active: false,
//   });

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined',
//   });
// };
