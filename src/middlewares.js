const Joi = require('joi');

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (error, req, res, next) => {

    //Validation Errors result in a bad request
    if (error instanceof Joi.ValidationError)
        res.statusCode = 400;

    //Log the endpoint
    console.error(error);

    //SEt the status and return the JSON
    res.status(res.statusCode === 200 ? (error.statusCode || 500) : res.statusCode);
    res.json({
        message: error.message,
        _stacktrace: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};