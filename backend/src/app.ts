import express from 'express';
import cors from 'cors';
import { githubRouter } from './routes/github.routes';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api', githubRouter);

app.use(errorHandler);

export { app };