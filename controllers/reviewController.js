const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
//const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

// exports.getAllReviews = catchAsync(
//   async (req, res, next) => {
//     const filterObj = {};
//     if (req.params.tourId)
//       filterObj.tour = req.params.tourId;
//     const reviews = await Review.find(filterObj);

//     res.status(200).json({
//       status: 'success',
//       results: reviews.length,
//       data: {
//         reviews,
//       },
//     });
//   },
// );

// Middleware to choose what data from req.body goes into new review and get author from user.id
exports.handleNewReviewData = (req, res, next) => {
  const review = {};
  review.review = req.body.review;
  review.rating = req.body.rating;
  review.tour = req.body.tour;
  review.user = req.user.id;

  // Allow nested routes
  if (req.params.tourId) review.tour = req.params.tourId;

  req.body = review;
  next();
};

// Subbed by the handle factory
// exports.createNewReview = catchAsync(
//   async (req, res, next) => {
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         review: newReview,
//       },
//     });
//   },
// );
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.findOne(Review);
exports.createNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
