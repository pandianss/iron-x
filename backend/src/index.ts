import 'reflect-metadata';
import app from './app';
import { startCronJobs } from './cron';
import { registerObservers } from './bootstrap/registerObservers';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

import { Logger } from './utils/logger';

app.listen(port, () => {
    Logger.info(`Server is running on port ${port}`);
    registerObservers();
    startCronJobs();
});

