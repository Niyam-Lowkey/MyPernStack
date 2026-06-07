import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('ERROR 💥', err);
  }

  // Handle specific DB errors (like duplicate key)
  if (err.code === '23505') {
    const message = `Duplicate field value. Please use another value.`;
    err = new AppError(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your token has expired. Please log in again.', 401);
  }

  if (process.env.NODE_ENV === 'production') {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server.',
      });
    }
  } else {
    // Development error: send all details
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

export default errorHandler;
