import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError(401, 'Invalid token format');
  }

  // Add token to request for use in routes
  req.token = token;
  next();
};