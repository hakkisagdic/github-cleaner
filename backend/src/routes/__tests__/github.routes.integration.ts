import request from 'supertest';
import express from 'express';
import { githubRoutes } from '../github.routes';
import { GitHubService } from '../../services/github.service';
import { Octokit } from '@octokit/rest';

describe('GitHub Routes Integration Tests', () => {
  let app: express.Application;
  let githubService: GitHubService;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    githubService = new GitHubService(octokit);
    
    app.use('/api/github', githubRoutes);
  });

  describe('GET /api/github/repos/:username', () => {
    it('should return repositories for a real GitHub user', async () => {
      // Act
      const response = await request(app)
        .get('/api/github/repos/octocat')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('owner');
      }
    });

    it('should handle non-existent users appropriately', async () => {
      // Act & Assert
      await request(app)
        .get('/api/github/repos/this-user-definitely-does-not-exist-12345')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
});