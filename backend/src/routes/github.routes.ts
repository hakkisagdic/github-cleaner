import { Router } from 'express';
import { GitHubService } from '../services/github.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

router.get('/oauth/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      throw new AppError(400, 'Invalid code parameter');
    }

    const githubService = new GitHubService();
    const accessToken = await githubService.getAccessToken(code);
    res.json({ access_token: accessToken });
  } catch (error) {
    next(error);
  }
});

router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    const githubService = new GitHubService(req.token);
    const user = await githubService.getCurrentUser();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/user/repos', authMiddleware, async (req, res, next) => {
  try {
    const { page = '1', per_page = '30' } = req.query;
    const githubService = new GitHubService(req.token);
    const user = await githubService.getCurrentUser();
    const repos = await githubService.getUserRepositories(
      user.login,
      Number(page),
      Number(per_page)
    );
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.get('/user/starred', authMiddleware, async (req, res, next) => {
  try {
    const { page = '1', per_page = '30' } = req.query;
    const githubService = new GitHubService(req.token);
    const user = await githubService.getCurrentUser();
    const repos = await githubService.getStarredRepositories(
      user.login,
      Number(page),
      Number(per_page)
    );
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

router.post('/repos/unstar', authMiddleware, async (req, res, next) => {
  try {
    const { repositories } = req.body;
    if (!Array.isArray(repositories)) {
      throw new AppError(400, 'Invalid repositories parameter');
    }

    const githubService = new GitHubService(req.token);
    await Promise.all(
      repositories.map(async (repo) => {
        const [owner, repoName] = repo.split('/');
        await githubService.unstarRepository(owner, repoName);
      })
    );

    res.json({ message: 'Repositories unstarred successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/repos/delete', authMiddleware, async (req, res, next) => {
  try {
    const { repositories } = req.body;
    if (!Array.isArray(repositories)) {
      throw new AppError(400, 'Invalid repositories parameter');
    }

    const githubService = new GitHubService(req.token);
    const user = await githubService.getCurrentUser();

    await Promise.all(
      repositories.map(async (repo) => {
        const [owner, repoName] = repo.split('/');
        if (owner !== user.login) {
          throw new AppError(403, `Cannot delete repository owned by ${owner}`);
        }
        await githubService.deleteRepository(owner, repoName);
      })
    );

    res.json({ message: 'Repositories deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;