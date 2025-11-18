import express from 'express';
import { Request, Response, NextFunction, Express } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import morgan from "morgan";
import fs from "fs";
import path from "path";
import bodyParser from 'body-parser';
import cors from 'cors';
import moment from 'moment';
import { errorLog, infoLog, warningLog } from './helper/logger';
import { startCronJobs } from './lib/cron-jobs';
import { initDBModel } from './lib/dbconnection';
import { authRoutes } from './controllers/auth-controller';
// import fileRoutes from './controllers/file-controller2';
import { userRoutes } from './controllers/user-controller';
import { checkAuthorization } from './middleware/authmiddleware';
import { pageRoutes } from './controllers/page-controller';
import { userProfileRoutes } from './controllers/profile-controller';
import fileRoutes from './controllers/file-controller';
import { commonRoutes } from './controllers/common-controller';
import { masterRoutes } from './controllers/master-controller';
import { organizationProfileRoutes } from './controllers/organizationProfile-controller';

const app = express();
const port: any = process.env.PORT || 3001;
const API_PREFIX = '/api/v1';

//#region System Logger
if (process.env.SYS_LOG == '1') {
  if (!fs.existsSync(path.join(__dirname, "/sys_logs"))) { fs.mkdirSync(path.join(__dirname, "/sys_logs")); }
  let today = moment().format('YYYY-MM-DD');
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, `/sys_logs/sysaccess_${today}.log`),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
}
//#endregion

//#region CORS Middleware
app.use(cors());
//#endregion

//#region body-parser
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//#endregion

//#region static file access
if (!fs.existsSync(path.join(__dirname, "/public"))) { fs.mkdirSync(path.join(__dirname, "/public")); }
//static media file
app.use('/public', express.static(__dirname + '/public'));

// Download public_backup.zip from root folder (Superadmin only)
app.get('/download/backup.zip', checkAuthorization(['superadmin']), (req, res) => {
  const filePath = path.join(__dirname, '../backup.zip');
  const today = moment().format('YYYY-MM-DD');
  const downloadFileName = `backup_${today}.zip`;
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, downloadFileName, (err) => {
      if (err) {
        errorLog("Error downloading public_backup.zip", err.message);
        res.status(500).send({ message: "Error downloading file" });
      }
    });
  } else {
    res.status(404).send({ message: "File not found" });
  }
});
//#endregion

//#region Define Rotues
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/profile`, userProfileRoutes);
app.use(`${API_PREFIX}/file`, fileRoutes);
app.use(`${API_PREFIX}/common`, commonRoutes);
app.use(`${API_PREFIX}/pages`, pageRoutes);
app.use(`${API_PREFIX}/organization`, organizationProfileRoutes);
app.use(`${API_PREFIX}/master`, masterRoutes);

app.get('/', (req, res) => {
  res.send('Talent-Directory-API!');
});

//#endregion

//#region Common Error Handing
app.use((error: any, request: Request, response: Response, next: NextFunction) => {
  if (!error) {
    next();
  } else {
    errorLog("Internal Server Error, Please contact site administrator.", error.message)
    response.status(500).send({ message: "Internal Server Error, Please contact site administrator." });
  }
});
//#endregion

app.listen(port, () => {
  try {
    startCronJobs()
    initDBModel()
  } catch (err) {

  }

  return infoLog(`Express is listening at http://localhost:${port}`);
});