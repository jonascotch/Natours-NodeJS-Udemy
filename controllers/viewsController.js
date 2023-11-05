const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get Tour data
  const tours = await Tour.find();

  // Build template

  // Render template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourSlug = req.params.slug;
  const tour = await Tour.findOne({ slug: tourSlug });

  if (!tour) {
    return next(
      new AppError('There is no tour with that name!', 404),
    );
  }

  const reviews = await Review.find({ tour: tour.id });

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    reviews,
  });
});

exports.loginUser = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1 Find all booking for user
  const bookings = await Booking.find({
    user: req.user.id,
  });

  // 2 Find tour from returned bookings
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  // console.log(bookings);

  res.status(200).render('overview', {
    title: 'Mytours',
    tours,
  });
});
