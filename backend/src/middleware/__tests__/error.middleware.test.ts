import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should handle standard errors', () => {
    // Arrange
    const error = new Error('Test error');

    // Act
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error'
    });
  });

  it('should handle errors with status codes', () => {
    // Arrange
    const error = new Error('Not Found');
    (error as any).statusCode = 404;

    // Act
    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Not Found'
    });
  });
});