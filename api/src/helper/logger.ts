import moment from 'moment';
import chalk from 'chalk';

export const warningLog = (...args: Array<string>) => {
    let logTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.warn(chalk.yellow("WARN", '[', logTime, ']', ...args));
}

export const errorLog = (...args: Array<string>) => {
    let logTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.error(chalk.red("ERROR", '[', logTime, ']', ...args));
}

export const infoLog = (...args: Array<string>) => {
    let logTime = moment().format('YYYY-MM-DD HH:mm:ss');
    console.info(chalk.green("INFO", '[', logTime, ']', ...args));
}
