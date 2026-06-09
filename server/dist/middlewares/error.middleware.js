"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = __importDefault(require("../utils/AppError"));
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log errors in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('ERROR 💥', err);
    }
    // Handle specific DB errors (like duplicate key)
    if (err.code === '23505') {
        const message = `Duplicate field value. Please use another value.`;
        err = new AppError_1.default(message, 400);
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        err = new AppError_1.default('Invalid token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        err = new AppError_1.default('Your token has expired. Please log in again.', 401);
    }
    if (process.env.NODE_ENV === 'production') {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        else {
            // Programming or other unknown error: don't leak error details
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong on the server.',
            });
        }
    }
    else {
        // Development error: send all details
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
