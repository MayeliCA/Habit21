import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import apiRoutes from './routes';
import { runHourlyCron } from './modules/streaks/streak.service';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use(errorHandler);

cron.schedule('0 * * * *', () => {
  runHourlyCron();
});

app.listen(config.PORT, () => {
  console.log(`Habit21 server running on port ${config.PORT} [${config.NODE_ENV}]`);
});
