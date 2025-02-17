import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  error: Error & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: error.message
  });
};