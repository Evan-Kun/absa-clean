import { CronJob } from 'cron';
import { errorLog, infoLog } from '../helper/logger';
import { removeAccessLogFile } from '../helper/common-helper';

const midNightJob = new CronJob('15 0 * * *', () => {
    infoLog(`Cron-job Trigger[12:15 AM]`)
    removeAccessLogFile()
});

export const startCronJobs = () => {
    try {
        midNightJob.start();
    } catch (err) {
        errorLog(`Error in startCronJobs:${err.message}`)
    }
}