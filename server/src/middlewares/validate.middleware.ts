import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import AppError from '../utils/AppError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join('.').replace(/^(body|query|params)\./, '')}: ${err.message}`)
          .join('; ');
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};

export default validate;
