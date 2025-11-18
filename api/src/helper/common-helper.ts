
import fs from "fs";
import path from "path";
import { errorLog, infoLog } from "./logger";
import { isDateBefore } from "../lib/utitlity";
import { Profile } from "../model/profile";
import { Op } from "sequelize";
import moment from "moment";

export const removeAccessLogFile = () => {
    try {
        fs.readdir(path.join(__dirname, "../sys_logs"), (err, resAllFiles) => {
            if (err) return false;
            for (let index = 0; index < resAllFiles.length; index++) {
                const eachFile = resAllFiles[index];
                if (eachFile) {
                    const datevalue = eachFile.split("_")[eachFile.split("_").length - 1].replace('.log', '');
                    // const SYS_LOG_CLEAN_IN_DAYS: number = process.env.SYS_LOG_CLEAN_IN_DAYS ? parseInt(process.env.SYS_LOG_CLEAN_IN_DAYS) : 7 || 7;
                    const SYS_LOG_CLEAN_IN_DAYS: number = process.env.SYS_LOG_CLEAN_IN_DAYS ? parseInt(process.env.SYS_LOG_CLEAN_IN_DAYS) : 7;
                    if (isDateBefore((SYS_LOG_CLEAN_IN_DAYS * 24), datevalue)) {
                        const FPath = `../sys_logs/${eachFile}`;
                        fs.unlinkSync(path.join(__dirname, FPath));
                        infoLog(`Deleted System Access log File ${FPath}`)
                    }
                }
            }
        })
        return true;
    } catch (err) {
        errorLog(`Error while removeAccessLogFile: ${err.message}`)
        return false;
    }
}

export const manageProfileSys_name = async (userId: any, firstName: string, lastName: string) => {
    let sysName = firstName?.trim()?.toLowerCase() + `-` + lastName?.trim()?.toLowerCase();
    sysName = sysName.split(' ').join('-');
    const resExistsSysName = await Profile.findOne({ where: { sysName, userId: { [Op.ne]: userId } } })?.catch((err) => console.log("ERROR manageProfileSys_name"));
    if (resExistsSysName) {
        let mili = moment().millisecond();
        sysName = sysName + `-` + mili;
    }
    return sysName
}