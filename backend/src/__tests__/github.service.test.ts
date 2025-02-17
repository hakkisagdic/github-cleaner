import { GitHubService } from '../services/github.service';
import { Octokit } from '@octokit/rest';
import { mockRepositories } from './mocks/repositories';

jest.mock('@octokit/rest');

describe('GitHubService', () => {
  let service: GitHubService;
  let mockOctokit: jest.Mocked<Octokit>;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        repos: {
          listForAuthenticatedUser: jest.fn().mockResolvedValue({
            data: mockRepositories
          }),
          delete: jest.fn().mockResolvedValue({ status: 204 }),
          update: jest.fn().mockResolvedValue({
            data: {
              ...mockRepositories[0],
              archived: true
            }
          })
        }
      }
    } as any;

    (Octokit as jest.MockedClass<typeof Octokit>).mockImplementation(() => mockOctokit);
    service = new GitHubService('test-token');
  });

  describe('getUserRepositories', () => {
    it('should return a list of repositories', async () => {
      const repos = await service.getUserRepositories('test-user');
      expect(repos).toHaveLength(1);
      expect(repos[0].name).toBe('test-repo');
      expect(repos[0].updated_at).toBe('2024-02-17T00:00:00Z');
    });

    it('should handle errors gracefully', async () => {
      (mockOctokit.rest.repos.listForAuthenticatedUser as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getUserRepositories('test-user'))
        .rejects.toThrow('Failed to fetch repositories');
    });
  });

  describe('deleteRepository', () => {
    it('should delete a repository', async () => {
      await expect(service.deleteRepository('test-user', 'test-repo'))
        .resolves.not.toThrow();
      expect(mockOctokit.rest.repos.delete).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo'
      });
    });

    it('should handle errors gracefully', async () => {
      (mockOctokit.rest.repos.delete as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(service.deleteRepository('test-user', 'test-repo'))
        .rejects.toThrow('Failed to delete repository');
    });
  });

  describe('updateRepository', () => {
    it('should update repository archived status', async () => {
      const result = await service.updateRepository('test-user', 'test-repo', { archived: true });
      expect(result.archived).toBe(true);
      expect(mockOctokit.rest.repos.update).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo',
        archived: true
      });
    });

    it('should handle errors gracefully', async () => {
      (mockOctokit.rest.repos.update as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(service.updateRepository('test-user', 'test-repo', { archived: true }))
        .rejects.toThrow('Failed to update repository');
    });
  });
});
