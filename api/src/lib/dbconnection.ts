import { Sequelize } from 'sequelize';
import { errorLog, infoLog } from '../helper/logger';
import { createDefaultSuperAdmin } from '../controllers/auth-controller';
import { initAllModels } from '../model/init';

const IS_DEV = process.env.IS_DEV == "1";
const DB_Name = process.env.DB_Name;
const DB_Host = process.env.DB_Host;
const DB_UserName = process.env.DB_UserName;
const DB_Password = process.env.DB_Password;

let sequelizeInstance = null;
if (IS_DEV) {
    sequelizeInstance = new Sequelize(DB_Name, DB_UserName, DB_Password, {
        host: DB_Host,
        dialect: 'postgres',
        port: 5432,
        logging: false
    });
}
else {
    sequelizeInstance = new Sequelize(DB_Name, DB_UserName, DB_Password, {
        host: DB_Host,
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false
    });
}

export const initDBModel = () => {
    sequelizeInstance.authenticate().then(async () => {
        infoLog('Connected to PostgreSQL database successfully!');
        await initAllModels(sequelizeInstance);
    }).catch((err) => {
        console.log("err", err)
        errorLog('PostgreSQL Connection error:', err);
    });
}

export const sequelizeConnection = sequelizeInstance;