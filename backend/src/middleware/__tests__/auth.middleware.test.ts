import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../auth.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if no authorization header is present', () => {
    // Arrange
    mockRequest.headers = {};

    // Act & Assert
    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow('No token provided');
  });

  it('should call next() if valid token is provided', () => {
    // Arrange
    mockRequest.headers = {
      authorization: 'Bearer valid-token',
    };

    // Act
    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.token).toBe('valid-token');
  });

  it('should return 401 if token format is invalid', () => {
    // Arrange
    mockRequest.headers = {
      authorization: 'InvalidFormat',
    };

    // Act & Assert
    expect(() => {
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow('Invalid token format');
  });
});
