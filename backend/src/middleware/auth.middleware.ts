import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'AppError';
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('No token provided', 401);
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Invalid token format', 401);
  }

  req.token = token;
  next();
};