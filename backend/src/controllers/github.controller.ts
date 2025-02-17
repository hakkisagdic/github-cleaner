import { Request, Response } from 'express';
import { GitHubService } from '../services/github.service';

export class GitHubController {
  private githubService: GitHubService;

  constructor(githubService?: GitHubService) {
    this.githubService = githubService || new GitHubService();
  }

  async getAccessToken(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const token = await this.githubService.getAccessToken(code);
      return res.json({ access_token: token });
    } catch (error) {
      console.error('Error getting access token:', error);
      return res.status(500).json({ error: 'Failed to get access token' });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await this.githubService.getCurrentUser();
      return res.json(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      return res.status(500).json({ error: 'Failed to get user data' });
    }
  }

  async getUserRepositories(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 30;

      const repos = await this.githubService.getUserRepositories(username, page, perPage);
      return res.json(repos);
    } catch (error) {
      console.error('Error getting user repositories:', error);
      return res.status(500).json({ error: 'Failed to get repositories' });
    }
  }

  async getStarredRepositories(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 30;

      const repos = await this.githubService.getStarredRepositories(username, page, perPage);
      return res.json(repos);
    } catch (error) {
      console.error('Error getting starred repositories:', error);
      return res.status(500).json({ error: 'Failed to get starred repositories' });
    }
  }

  async unstarRepository(req: Request, res: Response) {
    try {
      const { owner, repo } = req.params;
      await this.githubService.unstarRepository(owner, repo);
      return res.status(204).send();
    } catch (error) {
      console.error('Error unstarring repository:', error);
      return res.status(500).json({ error: 'Failed to unstar repository' });
    }
  }

  async deleteRepository(req: Request, res: Response) {
    try {
      const { owner, repo } = req.params;
      await this.githubService.deleteRepository(owner, repo);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting repository:', error);
      return res.status(500).json({ error: 'Failed to delete repository' });
    }
  }
}