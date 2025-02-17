import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { GitHubService } from '../github.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;
  let mockOctokit: Octokit;

  beforeEach(() => {
    mockOctokit = {
      users: {
        getAuthenticated: jest.fn(() => Promise.resolve({ data: {} })),
      },
      repos: {
        listForUser: jest.fn(() => Promise.resolve({ data: [] })),
        delete: jest.fn(() => Promise.resolve({ status: 204 })),
      },
      activity: {
        listReposStarredByUser: jest.fn(() => Promise.resolve({ data: [] })),
        unstarRepoForAuthenticatedUser: jest.fn(() => Promise.resolve({ status: 204 })),
      },
    } as unknown as Octokit;

    service = new GitHubService(mockOctokit);
  });

  describe('getAccessToken', () => {
    const mockCode = 'test-code';
    const mockToken = 'test-token';

    beforeEach(() => {
      process.env.GITHUB_CLIENT_ID = 'test-client-id';
      process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    });

    it('should exchange code for access token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockToken } });

      const token = await service.getAccessToken(mockCode);

      expect(token).toBe(mockToken);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        {
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          code: mockCode,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );
    });

    it('should throw error when token exchange fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Failed to get token'));

      await expect(service.getAccessToken(mockCode)).rejects.toThrow('Failed to get token');
    });

    it('should throw error when response is missing access_token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await expect(service.getAccessToken(mockCode)).rejects.toThrow('Invalid response from GitHub');
    });

    it('should throw error when environment variables are missing', async () => {
      delete process.env.GITHUB_CLIENT_ID;
      delete process.env.GITHUB_CLIENT_SECRET;

      await expect(service.getAccessToken(mockCode)).rejects.toThrow('GitHub client configuration missing');
    });
  });

  describe('getCurrentUser', () => {
    it('should return authenticated user data', async () => {
      const mockUser = {
        id: 1,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      (mockOctokit.users.getAuthenticated as jest.Mock).mockImplementation(() => Promise.resolve({ data: mockUser }));

      const user = await service.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockOctokit.users.getAuthenticated).toHaveBeenCalled();
    });

    it('should handle missing optional fields', async () => {
      const mockUser = {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      (mockOctokit.users.getAuthenticated as jest.Mock).mockImplementation(() => Promise.resolve({ data: mockUser }));

      const user = await service.getCurrentUser();

      expect(user).toEqual({
        id: 1,
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        name: undefined,
        email: undefined,
      });
    });
  });

  describe('getUserRepositories', () => {
    it('should return user repositories', async () => {
      const mockRepos = [{
        id: 1,
        name: 'repo1',
        full_name: 'user/repo1',
        description: 'Test repo',
        owner: {
          login: 'user',
          id: 1,
        },
        private: false,
        html_url: 'https://github.com/user/repo1',
        stargazers_count: 10,
        language: 'TypeScript',
      }];

      (mockOctokit.repos.listForUser as jest.Mock).mockImplementation(() => Promise.resolve({ data: mockRepos }));

      const repos = await service.getUserRepositories('testuser');

      expect(repos).toEqual(mockRepos);
      expect(mockOctokit.repos.listForUser).toHaveBeenCalledWith({
        username: 'testuser',
        page: 1,
        per_page: 30,
        sort: 'updated',
      });
    });

    it('should handle pagination parameters', async () => {
      const mockRepos = [{
        id: 1,
        name: 'repo1',
        full_name: 'user/repo1',
        description: 'Test repo',
        owner: {
          login: 'user',
          id: 1,
        },
        private: false,
        html_url: 'https://github.com/user/repo1',
        stargazers_count: 10,
        language: 'TypeScript',
      }];

      (mockOctokit.repos!.listForUser as jest.Mock).mockResolvedValue({ data: mockRepos });

      await service.getUserRepositories('testuser', 2, 50);

      expect(mockOctokit.repos.listForUser).toHaveBeenCalledWith({
        username: 'testuser',
        page: 2,
        per_page: 50,
        sort: 'updated',
      });
    });

    it('should handle API errors', async () => {
      (mockOctokit.repos!.listForUser as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.getUserRepositories('testuser')).rejects.toThrow('API error');
    });
  });

  describe('getStarredRepositories', () => {
    const mockStarred = [{
      repo: {
        id: 1,
        name: 'repo1',
        full_name: 'user/repo1',
        description: 'Test repo',
        owner: {
          login: 'user',
          id: 1,
        },
        private: false,
        html_url: 'https://github.com/user/repo1',
        stargazers_count: 10,
        language: 'TypeScript',
      },
      starred_at: '2023-01-01T00:00:00Z',
    }];

    it('should return starred repositories', async () => {
      (mockOctokit.activity.listReposStarredByUser as jest.Mock).mockImplementation(() => Promise.resolve({ data: mockStarred }));

      const starred = await service.getStarredRepositories('testuser');

      expect(starred[0]).toEqual({
        ...mockStarred[0].repo,
        starred_at: mockStarred[0].starred_at,
      });
      expect(mockOctokit.activity.listReposStarredByUser).toHaveBeenCalledWith({
        username: 'testuser',
        page: 1,
        per_page: 30,
      });
    });

    it('should handle pagination parameters', async () => {
      (mockOctokit.activity!.listReposStarredByUser as jest.Mock).mockResolvedValue({ data: mockStarred });

      await service.getStarredRepositories('testuser', 2, 50);

      expect(mockOctokit.activity.listReposStarredByUser).toHaveBeenCalledWith({
        username: 'testuser',
        page: 2,
        per_page: 50,
      });
    });

    it('should handle API errors', async () => {
      (mockOctokit.activity!.listReposStarredByUser as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.getStarredRepositories('testuser')).rejects.toThrow('API error');
    });

    it('should handle empty response', async () => {
      (mockOctokit.activity!.listReposStarredByUser as jest.Mock).mockResolvedValue({ data: [] });

      const starred = await service.getStarredRepositories('testuser');

      expect(starred).toEqual([]);
    });
  });

  describe('unstarRepository', () => {
    it('should unstar repository successfully', async () => {
      (mockOctokit.activity!.unstarRepoForAuthenticatedUser as jest.Mock).mockResolvedValue({ status: 204 });

      await service.unstarRepository('owner', 'repo');

      expect(mockOctokit.activity.unstarRepoForAuthenticatedUser).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should handle API errors', async () => {
      (mockOctokit.activity!.unstarRepoForAuthenticatedUser as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.unstarRepository('owner', 'repo')).rejects.toThrow('API error');
    });
  });

  describe('deleteRepository', () => {
    it('should delete repository successfully', async () => {
      (mockOctokit.repos!.delete as jest.Mock).mockResolvedValue({ status: 204 });

      await service.deleteRepository('owner', 'repo');

      expect(mockOctokit.repos.delete).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
      });
    });

    it('should handle API errors', async () => {
      (mockOctokit.repos!.delete as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.deleteRepository('owner', 'repo')).rejects.toThrow('API error');
    });
  });
});
