import { Router } from 'express';
import { GitHubService } from '../services/github.service';
import { authMiddleware } from '../middleware/auth.middleware';

export const githubRouter = Router();
const githubService = new GitHubService();

githubRouter.get('/repos/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const repos = await githubService.getUserRepositories(username);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

githubRoutes.get('/starred/:username', authMiddleware, async (req, res, next) => {
  try {
    const { username } = req.params;
    const repos = await githubService.getStarredRepositories(username);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

githubRoutes.delete('/unstar/:owner/:repo', authMiddleware, async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    await githubService.unstarRepository(owner, repo);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default githubRoutes;
