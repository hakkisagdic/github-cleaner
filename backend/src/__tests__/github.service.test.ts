import { GitHubService } from '../services/github.service';
import { Octokit } from '@octokit/rest';

jest.mock('@octokit/rest');
jest.mock('axios');

describe('GitHubService', () => {
  let service: GitHubService;
  const mockToken = 'test-token';

  beforeEach(() => {
    service = new GitHubService(mockToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance with auth token', () => {
    expect(Octokit).toHaveBeenCalledWith({ auth: mockToken });
  });

  it('should get user repositories', async () => {
    const mockRepos = [
      {
        id: 1,
        name: 'test-repo',
        full_name: 'user/test-repo',
        description: 'Test repository',
        stargazers_count: 10,
        language: 'TypeScript',
        updated_at: '2024-02-17T00:00:00Z',
      },
    ];

    (service as any).octokit.repos.listForUser.mockResolvedValue({
      data: mockRepos,
    });

    const repos = await service.getUserRepositories('testuser');
    expect(repos).toEqual(mockRepos);
    expect(service.octokit.repos.listForUser).toHaveBeenCalledWith({
      username: 'testuser',
      page: 1,
      per_page: 30,
      sort: 'updated',
    });
  });

  it('should get starred repositories', async () => {
    const mockRepos = [
      {
        id: 1,
        name: 'starred-repo',
        full_name: 'user/starred-repo',
        description: 'Starred repository',
        stargazers_count: 100,
        language: 'JavaScript',
        updated_at: '2024-02-17T00:00:00Z',
      },
    ];

    (service as any).octokit.activity.listReposStarredByUser.mockResolvedValue({
      data: mockRepos,
    });

    const repos = await service.getStarredRepositories('testuser');
    expect(repos).toEqual(mockRepos);
    expect(service.octokit.activity.listReposStarredByUser).toHaveBeenCalledWith({
      username: 'testuser',
      page: 1,
      per_page: 30,
    });
  });

  it('should unstar a repository', async () => {
    await service.unstarRepository('owner', 'repo');
    expect(service.octokit.activity.unstarRepo).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should delete a repository', async () => {
    await service.deleteRepository('owner', 'repo');
    expect(service.octokit.repos.delete).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
    });
  });
});