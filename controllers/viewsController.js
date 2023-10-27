const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

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
  const reviews = await Review.find({ tour: tour.id });

  res
    .status(200)
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
      reviews,
    });
});

exports.loginUser = (req, res) => {
  res
    .status(200)
    /*.set(
      'Content-Security-Policy',
      'connect-src https://cdnjs.cloudflare.com http://127.0.0.1:8000',
    )*/
    .render('login', {
      title: 'Login',
    });
};
