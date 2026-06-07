import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import AppError from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = '';
    
    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid token or authorization signature expired.', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
