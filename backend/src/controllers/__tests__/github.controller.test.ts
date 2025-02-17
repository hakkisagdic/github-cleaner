import { Request, Response } from 'express';
import { GitHubController } from '../github.controller';
import { GitHubService } from '../../services/github.service';

jest.mock('../../services/github.service');

describe('GitHubController', () => {
  let controller: GitHubController;
  let mockGithubService: jest.Mocked<GitHubService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    mockGithubService = {
      getAccessToken: jest.fn(),
      getCurrentUser: jest.fn(),
      getUserRepositories: jest.fn(),
      getStarredRepositories: jest.fn(),
      unstarRepository: jest.fn(),
      deleteRepository: jest.fn(),
    } as unknown as jest.Mocked<GitHubService>;

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();

    mockResponse = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
    };

    controller = new GitHubController(mockGithubService);
  });

  describe('getAccessToken', () => {
    it('should return access token when code is provided', async () => {
      const mockCode = 'test-code';
      const mockToken = 'test-token';
      mockRequest = {
        body: { code: mockCode },
      };

      mockGithubService.getAccessToken.mockResolvedValueOnce(mockToken);

      await controller.getAccessToken(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.getAccessToken).toHaveBeenCalledWith(mockCode);
      expect(jsonMock).toHaveBeenCalledWith({ access_token: mockToken });
    });

    it('should return 400 when code is missing', async () => {
      mockRequest = {
        body: {},
      };

      await controller.getAccessToken(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Code is required' });
    });

    it('should return 500 when service throws error', async () => {
      mockRequest = {
        body: { code: 'test-code' },
      };

      mockGithubService.getAccessToken.mockRejectedValueOnce(new Error('Service error'));

      await controller.getAccessToken(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to get access token' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data', async () => {
      const mockUser = {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockGithubService.getCurrentUser.mockResolvedValueOnce(mockUser);

      await controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.getCurrentUser).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it('should return 500 when service throws error', async () => {
      mockGithubService.getCurrentUser.mockRejectedValueOnce(new Error('Service error'));

      await controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to get user data' });
    });
  });

  describe('getUserRepositories', () => {
    it('should return repositories with default pagination', async () => {
      const mockRepos = [{
        id: 1,
        name: 'repo1',
        full_name: 'testuser/repo1',
        description: 'Test repo',
        owner: {
          login: 'testuser',
          id: 1,
        },
        private: false,
        html_url: 'https://github.com/testuser/repo1',
        stargazers_count: 10,
        language: 'TypeScript',
      }];
      mockRequest = {
        params: { username: 'testuser' },
        query: {},
      };

      mockGithubService.getUserRepositories.mockResolvedValueOnce(mockRepos);

      await controller.getUserRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.getUserRepositories).toHaveBeenCalledWith('testuser', 1, 30);
      expect(jsonMock).toHaveBeenCalledWith(mockRepos);
    });

    it('should use provided pagination parameters', async () => {
      mockRequest = {
        params: { username: 'testuser' },
        query: { page: '2', per_page: '50' },
      };

      await controller.getUserRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.getUserRepositories).toHaveBeenCalledWith('testuser', 2, 50);
    });
  });

  describe('getStarredRepositories', () => {
    it('should return starred repositories', async () => {
      const mockRepos = [{
        id: 1,
        name: 'repo1',
        full_name: 'testuser/repo1',
        description: 'Test repo',
        owner: {
          login: 'testuser',
          id: 1,
        },
        private: false,
        html_url: 'https://github.com/testuser/repo1',
        stargazers_count: 10,
        language: 'TypeScript',
        starred_at: '2023-01-01T00:00:00Z',
      }];
      mockRequest = {
        params: { username: 'testuser' },
        query: {},
      };

      mockGithubService.getStarredRepositories.mockResolvedValueOnce(mockRepos);

      await controller.getStarredRepositories(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.getStarredRepositories).toHaveBeenCalledWith('testuser', 1, 30);
      expect(jsonMock).toHaveBeenCalledWith(mockRepos);
    });
  });

  describe('unstarRepository', () => {
    it('should unstar repository and return 204', async () => {
      mockRequest = {
        params: { owner: 'testowner', repo: 'testrepo' },
      };

      await controller.unstarRepository(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.unstarRepository).toHaveBeenCalledWith('testowner', 'testrepo');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });
  });

  describe('deleteRepository', () => {
    it('should delete repository and return 204', async () => {
      mockRequest = {
        params: { owner: 'testowner', repo: 'testrepo' },
      };

      await controller.deleteRepository(mockRequest as Request, mockResponse as Response);

      expect(mockGithubService.deleteRepository).toHaveBeenCalledWith('testowner', 'testrepo');
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });
  });
});
