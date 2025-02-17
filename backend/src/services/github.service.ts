import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { GitHubRepository, GitHubUser, OAuthTokenResponse } from '../types/github';

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
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
    return data;
  }

  async getUserRepositories(username: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    const { data } = await this.octokit.repos.listForUser({
      username,
      page,
      per_page: perPage,
      sort: 'updated',
    });
    return data;
  }

  async getStarredRepositories(username: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    const { data } = await this.octokit.activity.listReposStarredByUser({
      username,
      page,
      per_page: perPage,
    });
    return data;
  }

  async unstarRepository(owner: string, repo: string): Promise<void> {
    await this.octokit.activity.unstarRepo({
      owner,
      repo,
    });
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    await this.octokit.repos.delete({
      owner,
      repo,
    });
  }
}