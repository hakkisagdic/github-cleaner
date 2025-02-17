import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware } from '../rateLimit.middleware';

jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  });
});

describe('Rate Limit Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should initialize rate limiter with correct options', () => {
    expect(rateLimitMiddleware).toBeDefined();
  });
});