import { GitHubController } from '../controllers/github.controller';
import { GitHubService } from '../services/github.service';
import { Request, Response } from 'express';
import { mockRepositories, mockStarredRepositories } from './mocks/repositories';

jest.mock('../services/github.service');

describe('GitHubController', () => {
  let controller: GitHubController;
  let mockService: jest.Mocked<GitHubService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockService = {
      getUserRepositories: jest.fn(),
      getStarredRepositories: jest.fn(),
      unstarRepository: jest.fn(),
      deleteRepository: jest.fn(),
      updateRepository: jest.fn(),
    } as any;

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    mockRequest = {
      params: { username: 'test-user' },
    };

    controller = new GitHubController(mockService);
  });

  describe('getUserRepositories', () => {
    it('should return repositories list', async () => {
      mockService.getUserRepositories.mockResolvedValue(mockRepositories);

      await controller.getUserRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockRepositories);
    });

    it('should handle errors', async () => {
      mockService.getUserRepositories.mockRejectedValue(new Error('Service Error'));

      await controller.getUserRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch repositories' });
    });
  });

  describe('getStarredRepositories', () => {
    it('should return starred repositories list', async () => {
      mockService.getStarredRepositories.mockResolvedValue(mockStarredRepositories);

      await controller.getStarredRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(mockStarredRepositories);
    });

    it('should handle errors', async () => {
      mockService.getStarredRepositories.mockRejectedValue(new Error('Service Error'));

      await controller.getStarredRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch starred repositories' });
    });
  });

  describe('deleteRepository', () => {
    it('should delete repository', async () => {
      mockRequest.params = { owner: 'test-user', repo: 'test-repo' };

      await controller.deleteRepository(mockRequest as Request, mockResponse as Response);

      expect(mockService.deleteRepository).toHaveBeenCalledWith('test-user', 'test-repo');
      expect(mockStatus).toHaveBeenCalledWith(204);
    });

    it('should handle errors', async () => {
      mockRequest.params = { owner: 'test-user', repo: 'test-repo' };
      mockService.deleteRepository.mockRejectedValue(new Error('Service Error'));

      await controller.deleteRepository(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to delete repository' });
    });
  });

  describe('updateRepository', () => {
    it('should update repository', async () => {
      mockRequest.params = { owner: 'test-user', repo: 'test-repo' };
      mockRequest.body = { archived: true };
      mockService.updateRepository.mockResolvedValue(mockRepositories[0]);

      await controller.updateRepository(mockRequest as Request, mockResponse as Response);

      expect(mockService.updateRepository).toHaveBeenCalledWith('test-user', 'test-repo', { archived: true });
      expect(mockJson).toHaveBeenCalledWith(mockRepositories[0]);
    });

    it('should handle errors', async () => {
      mockRequest.params = { owner: 'test-user', repo: 'test-repo' };
      mockRequest.body = { archived: true };
      mockService.updateRepository.mockRejectedValue(new Error('Service Error'));

      await controller.updateRepository(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to update repository' });
    });
  });
});