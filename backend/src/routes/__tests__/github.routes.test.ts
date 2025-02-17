import request from 'supertest';
import express from 'express';
import { githubRoutes } from '../github.routes';
import { GitHubService } from '../../services/github.service';

jest.mock('../../services/github.service');

describe('GitHub Routes', () => {
  let app: express.Application;
  let mockGithubService: jest.Mocked<GitHubService>;

  beforeEach(() => {
    mockGithubService = {
      getAccessToken: jest.fn(),
      getCurrentUser: jest.fn(),
      getUserRepositories: jest.fn(),
      getStarredRepositories: jest.fn(),
      unstarRepository: jest.fn(),
      deleteRepository: jest.fn(),
    } as unknown as jest.Mocked<GitHubService>;

    // Mock the GitHubService constructor
    (GitHubService as jest.MockedClass<typeof GitHubService>).mockImplementation(() => mockGithubService);

    app = express();
    app.use(express.json());
    app.use('/api/github', githubRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/github/repos/:username', () => {
    it('should return repositories for a valid username', async () => {
      // Arrange
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user1/repo1',
          description: 'Test repo 1',
          owner: { login: 'user1', id: 1 },
          private: false,
          html_url: 'https://github.com/user1/repo1',
          stargazers_count: 10,
          language: 'TypeScript'
        },
        {
          id: 2,
          name: 'repo2',
          full_name: 'user1/repo2',
          description: 'Test repo 2',
          owner: { login: 'user1', id: 1 },
          private: false,
          html_url: 'https://github.com/user1/repo2',
          stargazers_count: 5,
          language: 'JavaScript'
        }
      ];
      mockGithubService.getUserRepositories.mockResolvedValue(mockRepos);

      // Act
      const response = await request(app)
        .get('/api/github/repos/user1')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockRepos);
      expect(mockGithubService.getUserRepositories).toHaveBeenCalledWith('user1');
    });

    it('should handle errors appropriately', async () => {
      // Arrange
      mockGithubService.getUserRepositories.mockRejectedValue(new Error('GitHub API error'));

      // Act & Assert
      await request(app)
        .get('/api/github/repos/user1')
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
        });
    });
  });
});
