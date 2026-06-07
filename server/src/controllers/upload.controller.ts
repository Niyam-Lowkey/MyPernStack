import { Response, NextFunction } from 'express';
import { processUpload } from '../services/upload.service';
import AppError from '../utils/AppError';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const uploadImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const host = req.get('host') || 'localhost:5000';
    const filePath = req.file.path;
    const fileName = req.file.filename;

    const result = await processUpload(filePath, fileName, host);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
