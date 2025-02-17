import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { GitHubRepository, GitHubUser, OAuthTokenResponse, StarredRepository } from '../types/github';

export class GitHubService {
  protected octokit: Octokit;

  constructor(octokitOrToken?: Octokit | string) {
    if (octokitOrToken instanceof Octokit) {
      this.octokit = octokitOrToken;
    } else {
      this.octokit = new Octokit({
        auth: octokitOrToken,
      });
    }
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.post<OAuthTokenResponse>(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data.access_token;
  }

  async getCurrentUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.users.getAuthenticated();
    return {
      id: data.id,
      login: data.login,
      name: data.name || undefined,
      email: data.email || undefined,
      avatar_url: data.avatar_url,
    };
  }

  async getUserRepositories(username: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        username,
        page,
        per_page: perPage,
        sort: 'updated',
      });
      
      return data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
        },
        private: repo.private,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count || 0,
        language: repo.language || null,
        archived: repo.archived || false,
        updated_at: repo.updated_at,
      }));
    } catch (error) {
      throw new Error('Failed to fetch repositories');
    }
  }

  async getStarredRepositories(username: string, page = 1, perPage = 30): Promise<StarredRepository[]> {
    const { data } = await this.octokit.activity.listReposStarredByUser({
      username,
      page,
      per_page: perPage,
    });
    
    return data.map((item: any) => ({
      id: item.repo.id,
      name: item.repo.name,
      full_name: item.repo.full_name,
      description: item.repo.description,
      owner: {
        login: item.repo.owner.login,
        id: item.repo.owner.id,
      },
      private: item.repo.private,
      html_url: item.repo.html_url,
      stargazers_count: item.repo.stargazers_count || 0,
      language: item.repo.language || null,
      starred_at: item.starred_at,
    }));
  }

  async unstarRepository(owner: string, repo: string): Promise<void> {
    await this.octokit.activity.unstarRepoForAuthenticatedUser({
      owner,
      repo,
    });
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.repos.delete({
        owner,
        repo,
      });
    } catch (error) {
      throw new Error('Failed to delete repository');
    }
  }

  async updateRepository(owner: string, repo: string, data: { archived?: boolean }): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.repos.update({
        owner,
        repo,
        ...data
      });

      return {
        id: response.data.id,
        name: response.data.name,
        full_name: `${owner}/${repo}`,
        description: response.data.description,
        owner: {
          login: owner,
          id: 0, // Not available in response
        },
        private: response.data.private,
        html_url: response.data.html_url,
        stargazers_count: response.data.stargazers_count || 0,
        language: response.data.language || null,
        archived: response.data.archived,
        updated_at: response.data.updated_at,
      };
    } catch (error) {
      throw new Error('Failed to update repository');
    }
  }
}
