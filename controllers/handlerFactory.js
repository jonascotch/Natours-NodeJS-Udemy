const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(
      req.params.id,
    );

    if (!doc) {
      return next(
        new AppError(
          `No document found with ID ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(204).json({
      status: 'success',
      message: 'Data successfully deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!doc) {
      return next(
        new AppError(
          `No document found with ID ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.findOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `No document found with ID ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow nested GET reviews on Tour (hack)
    const filterObj = {};
    if (req.params.tourId)
      filterObj.tour = req.params.tourId;

    const features = new APIFeatures(
      Model.find(filterObj),
      req.query,
    )
      .filter()
      .sort()
      .limit()
      .page();
    const docs = await features.query;

    // SEND RESPONSE
    const { length } = docs;
    res.status(200).json({
      status: 'success',
      data: {
        results: length,
        docs,
      },
    });
  });
