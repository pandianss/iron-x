import app from './app';
import { startCronJobs } from './cron';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startCronJobs();
});

