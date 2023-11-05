// const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
//const APIFeatures = require('../utils/apiFeatures');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'File is not an image. Please upload an image',
        400,
      ),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// we want to upload several files from multiple fields
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(
  async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images)
      return next();

    // 1 Resize cover image
    req.body.imageCover = `tour-${
      req.params.id
    }-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images = [];

    // 2 Other images
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${
          req.params.id
        }-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
    // console.log(req.body);
    next();
  },
);

// if just upload 1 file
// upload.simgle('photo)

// if upload multiple images from same field
// upload.array('images', 5) name of array and maxCount

// const tours = JSON.parse(
//   fs.readFileSync(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//   ),
// );

// exports.CheckID = (req, res, next, val) => {
//   console.log(`The id value is ${val} `);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-averageRating, price';
  req.query.fields =
    'name, summary, price, ratingAverage, difficulty';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // BUILD QUERY
//   // const queryObj = { ...req.query };

//   // const exclude = ['limit', 'fields', 'page', 'sort'];
//   // exclude.forEach((el) => delete queryObj[el]);

//   // // ADVANCED QUERY
//   // let queryStr = JSON.stringify(queryObj);

//   // // { difficulty:"easy", duration: { $gte:6 } }
//   // // { difficulty: 'easy', duration: { gte: '5' } }

//   // queryStr = queryStr.replace(
//   //   /\b(gt|gte|lt|lte)\b/g,
//   //   (match) => `$${match}`,
//   // );

//   // let query = Tour.find(JSON.parse(queryStr));

//   // SORTING
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('name');
//   // }

//   // FIELD LIMITING
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   //   console.log(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // PAGINATION

//   // page=3&limit=10
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;

//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) {
//   //     throw new Error('This page does not exist');
//   //   }
//   // }

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limit()
//     .page();
//   const tours = await features.query;

//   // SEND RESPONSE
//   const { length } = tours;
//   res.status(200).json({
//     status: 'success',
//     data: {
//       results: length,
//       tours,
//     },
//   });
// });
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.findOne(Tour, {
  path: 'reviews',
});

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate({
//     path: 'reviews',
//   });

//   if (!tour) {
//     return next(
//       new AppError(
//         `No tour found with ID ${req.params.id}`,
//         404,
//       ),
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });

// eslint-disable-next-line no-console
// console.log(req.params);

// const singleTour = tours.find(
//   (el) => el.id === req.params.id,
// // );
// res.status(200).json({
//   status: 'sucess',
//   data: {
//     singleTour,
//   //   },
// });
// });

// exports.createNewTour = catchAsync(
//   async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });

// try {

// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err,
//   });
// }

// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   () => {
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   },
// );
//   },
// );

// Subbed by the handle factory
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true, runValidators: true },
//   );

//   if (!tour) {
//     return next(
//       new AppError(
//         `No tour found with ID ${req.params.id}`,
//         404,
//       ),
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.createNewTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// Before the handler factory was created this is how a tour was deleted
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(
//       new AppError(
//         `No tour found with ID ${req.params.id}`,
//         404,
//       ),
//     );
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Data successfully deleted',
//   });
// });

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numRatings: { $sum: '$ratingQuantity' },
          totalTours: { $sum: 1 },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  },
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $addFields: {
          startYear: { $year: '$startDates' },
        },
      },
      {
        $match: { startYear: year },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tourNames: { $push: '$name' },
          durationTotal: { $sum: '$duration' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $addFields: {
          startMonth: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    const planLength = plan.length;
    res.status(200).json({
      status: 'success',
      data: {
        results: planLength,
        plan,
      },
    });
  },
);

exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const radius =
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format, lat, lng',
          400,
        ),
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: 'sucess',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  },
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const multiplier =
      unit === 'mi' ? 0.000621371192 : 0.001;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format, lat, lng',
          400,
        ),
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance_in_kms',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance_in_kms: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'sucess',
      data: {
        data: distances,
      },
    });
  },
);
