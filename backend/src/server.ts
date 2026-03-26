import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '@/routes';
import { initDatabase } from '@/models/database';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { apiLimiter } from '@/middleware/rateLimiter';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

initDatabase();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
