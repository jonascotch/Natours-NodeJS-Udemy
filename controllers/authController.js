const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password',
        400,
      ),
    );
  }

  // 2) check if user exists and password is correct
  const user = await User.findOne({
    email: `${email}`,
  }).select('+password');

  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError('Incorrect email or password', 401),
    );
  }

  // 3) If everything OK, send token to client
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Get the token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please login to access',
        401,
      ),
    );
  }

  // 2) Validate the token / Verification
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user no longer exists', 401),
    );

  // 4) Check if user changed password after token was issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password changed after token was issued. Please login again.',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE;
  req.user = currentUser;
  next();
});

// only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    // 4) Check if user changed password after token was issued
    if (currentUser.passwordChangedAfter(decoded.iat)) {
      return next();
    }

    // GRANT ACCESS TO PROTECTED ROUTE;
    res.locals.user = currentUser;
  }
  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          "User doesn't have permission to perform this operation",
          403,
        ),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user)
      return next(new AppError('User not found', 404));

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send the reset token to the user email
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Send a PATCH request with your password and passwordConfirm to ${resetURL}\nIf you didn't request a password reset, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject:
          'Your password reset token (valid for 10 minutes)',
        message: message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "Couldn't send token to reset password. Please try again.",
          500,
        ),
      );
    }
  },
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // if no user, send error message
    if (!user) {
      return next(
        new AppError(
          'User not found or invalid token',
          401,
        ),
      );
    }

    // 2) If token not expired and there is user, set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // Done as pre.save in the Model

    // 4) Log the user in, send JWT
    createAndSendToken(user, 200, res);
  },
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findOne({
      _id: req.user.id,
    }).select('+password');

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password,
      ))
    )
      return next(
        new AppError('Current password not correct', 403),
      );

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // 4) Log user in , send JWT
    createAndSendToken(user, 200, res);
  },
);
