import { request } from '../setupIntegrationTests';
import { mockRepositories, mockStarredRepositories } from './mocks/repositories';
import { GitHubService } from '../services/github.service';

jest.mock('../services/github.service');

const MockedGitHubService = GitHubService as jest.MockedClass<typeof GitHubService>;

describe('GitHub API Integration', () => {
  let mockService: jest.Mocked<GitHubService>;

  beforeEach(() => {
    mockService = {
      getUserRepositories: jest.fn().mockResolvedValue(mockRepositories),
      getStarredRepositories: jest.fn().mockResolvedValue(mockStarredRepositories),
      deleteRepository: jest.fn().mockResolvedValue(undefined),
      updateRepository: jest.fn().mockResolvedValue(mockRepositories[0]),
    } as any;

    MockedGitHubService.mockImplementation(() => mockService);
  });

  describe('GET /api/repositories/:username', () => {
    it('should return repositories', async () => {
      const response = await request
        .get('/api/repositories/test-user')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories);
    });

    it('should handle unauthorized requests', async () => {
      const response = await request.get('/api/repositories/test-user');

      expect(response.status).toBe(401);
    });

    it('should handle service errors', async () => {
      mockService.getUserRepositories.mockRejectedValue(new Error('Service Error'));

      const response = await request
        .get('/api/repositories/test-user')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch repositories' });
    });
  });

  describe('GET /api/repositories/:username/starred', () => {
    it('should return starred repositories', async () => {
      const response = await request
        .get('/api/repositories/test-user/starred')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStarredRepositories);
    });
  });

  describe('DELETE /api/repositories/:owner/:repo', () => {
    it('should delete repository', async () => {
      const response = await request
        .delete('/api/repositories/test-user/test-repo')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /api/repositories/:owner/:repo', () => {
    it('should update repository', async () => {
      const response = await request
        .patch('/api/repositories/test-user/test-repo')
        .set('Authorization', 'Bearer test-token')
        .send({ archived: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepositories[0]);
    });
  });
});