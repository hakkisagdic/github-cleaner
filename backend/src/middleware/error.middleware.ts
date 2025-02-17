import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // GitHub API rate limit error
  if (err.message.includes('API rate limit exceeded')) {
    return res.status(429).json({
      status: 'error',
      message: 'GitHub API rate limit exceeded. Please try again later.',
    });
  }

  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};