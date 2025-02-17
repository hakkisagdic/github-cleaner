import axios from 'axios';
import { githubService, setAuthToken } from './github';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockApi = mockedAxios.create();

describe('GitHub Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should set the authorization header with the token', () => {
      const token = 'test-token';
      setAuthToken(token);
      expect(mockApi.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });
  });

  describe('getUser', () => {
    it('should fetch user data', async () => {
      const mockUser = { id: 1, login: 'testuser', avatar_url: 'test.jpg', name: 'Test User' };
      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

      const result = await githubService.getUser();
      expect(result).toEqual(mockUser);
      expect(mockApi.get).toHaveBeenCalledWith('/github/user');
    });
  });

  describe('getRepositories', () => {
    it('should fetch repositories with default pagination', async () => {
      const mockRepos = [{ id: 1, name: 'repo1' }];
      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockRepos });

      const result = await githubService.getRepositories();
      expect(result).toEqual(mockRepos);
      expect(mockApi.get).toHaveBeenCalledWith('/github/user/repos', {
        params: { page: 1, per_page: 30 },
      });
    });

    it('should fetch repositories with custom pagination', async () => {
      const mockRepos = [{ id: 1, name: 'repo1' }];
      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockRepos });

      const result = await githubService.getRepositories(2, 50);
      expect(result).toEqual(mockRepos);
      expect(mockApi.get).toHaveBeenCalledWith('/github/user/repos', {
        params: { page: 2, per_page: 50 },
      });
    });
  });

  describe('getStarredRepositories', () => {
    it('should fetch starred repositories', async () => {
      const mockRepos = [{ id: 1, name: 'repo1' }];
      (mockApi.get as jest.Mock).mockResolvedValueOnce({ data: mockRepos });

      const result = await githubService.getStarredRepositories();
      expect(result).toEqual(mockRepos);
      expect(mockApi.get).toHaveBeenCalledWith('/github/user/starred', {
        params: { page: 1, per_page: 30 },
      });
    });
  });

  describe('unstarRepositories', () => {
    it('should send unstar request', async () => {
      const repositories = ['repo1', 'repo2'];
      await githubService.unstarRepositories(repositories);
      expect(mockApi.post).toHaveBeenCalledWith('/github/repos/unstar', { repositories });
    });
  });

  describe('deleteRepositories', () => {
    it('should send delete request', async () => {
      const repositories = ['repo1', 'repo2'];
      await githubService.deleteRepositories(repositories);
      expect(mockApi.post).toHaveBeenCalledWith('/github/repos/delete', { repositories });
    });
  });
});