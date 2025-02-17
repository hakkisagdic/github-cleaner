import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import githubRoutes from './routes/github.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use('/api/github', githubRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});