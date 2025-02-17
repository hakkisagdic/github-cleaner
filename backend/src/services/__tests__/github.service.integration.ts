import { GitHubService } from '../github.service';
import { Octokit } from '@octokit/rest';

describe('GitHubService Integration Tests', () => {
  let githubService: GitHubService;

  beforeEach(() => {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    githubService = new GitHubService(octokit);
  });

  it('should fetch repositories for a user', async () => {
    // Arrange
    const username = 'testuser';

    // Act
    const repos = await githubService.getUserRepositories(username);

    // Assert
    expect(Array.isArray(repos)).toBe(true);
    if (repos.length > 0) {
      expect(repos[0]).toHaveProperty('id');
      expect(repos[0]).toHaveProperty('name');
      expect(repos[0]).toHaveProperty('owner');
    }
  });

  // Add more integration tests for other GitHub service methods
});