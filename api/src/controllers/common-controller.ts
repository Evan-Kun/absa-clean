import express, { NextFunction, Request, Response } from 'express';
import { HttpResponseStatus } from '../lib/utitlity';
import { errorLog, infoLog } from '../helper/logger';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
import { User } from '../model/user';
import { Role } from '../model/role';
import { Profile } from '../model/profile';
import { Organization } from '../model/organization';
import { sendEmail } from '../lib/mailer';
import { createDatabaseBackup } from '../lib/dbbackup';
const { Op } = require('sequelize');

const commonRoutes = express.Router();

commonRoutes.get('/counts', checkAuthorization(['superadmin', 'orgadmin']), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const loginUserRole = request?.user?.role;
    const isSuperadmin = loginUserRole === 'superadmin';

    const roles = await Role.findAll();
    const userRole = roles.find((role) => role.roleName === 'user');
    const orgAdminRole = roles.find((role) => role.roleName === 'orgadmin');

    // User counts
    const userFindWhere = {
      [Op.or]: [
        { role_id: userRole?.id },
        { role_id: orgAdminRole?.id }
      ],
    };

    if (isSuperadmin) { userFindWhere['id'] = { [Op.ne]: request?.user?.id } };
    if (request?.user?.organization_id) { userFindWhere['organization_id'] = request.user.organization_id; };

    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      User.count({ where: userFindWhere }),
      User.count({ where: { ...userFindWhere, isActive: true } }),
      User.count({ where: { ...userFindWhere, isActive: false } }),
    ]);

    // Organization counts (only for superadmin)
    let organizationData = {};
    if (isSuperadmin && orgAdminRole) {
      const totalOrgCount = await Organization.count()?.catch((err) => { throw err })
      organizationData = {
        organizations: {
          total: totalOrgCount,
          active: totalOrgCount,
          inactive: 0,
        },
      };
    }

    // Profile counts
    const profileFindWhere = {};
    if (isSuperadmin) { profileFindWhere['userId'] = { [Op.ne]: request?.user?.id } }
    const includeCondition = {
      model: User,
      as: 'user',
      where: {
        ...(request?.user?.organization_id && { organization_id: request.user.organization_id }),
      },
    };

    const [totalProfiles, activeProfiles, inactiveProfiles] = await Promise.all([
      Profile.count({ where: profileFindWhere, include: [includeCondition] }),
      Profile.count({ where: { ...profileFindWhere, isActive: true }, include: [includeCondition] }),
      Profile.count({ where: { ...profileFindWhere, isActive: false }, include: [includeCondition] }),
    ]);

    // Build response data
    const responseData: any = {
      user: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      profiles: {
        total: totalProfiles,
        active: activeProfiles,
        inactive: inactiveProfiles,
      },
      ...organizationData, // Include organizations only if isSuperadmin
    };

    response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: responseData });
  } catch (err) {
    errorLog('Error retrieving user details:', err);
    next(err);
  }
}
);

commonRoutes.post('/mail/send', async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { to, text } = request.body;
    if (!to || !text) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const result = await sendEmail({
      to,
      subject: "Test Email",
      text,
    });

    if (result?.success) {
      return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ success: true, message: "mail sent successfully" });
    } else {
      return response.status(HttpResponseStatus.SERVER_ERROR).json({ success: false, message: 'Error while sent mail' });
    }

  } catch (err) {
    errorLog('Error while send mail:', err);
    next(err);
  }
});

commonRoutes.get('/settings', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objSetting = {
      prompt: `Extract all the information from my CV and format it as a JSON string with the following structure. output json: {"basic":{"firstName":"","lastName":"","slogan":"","jobTitle":"","bio":"","linkdin_url":"","x_url":"","google_scholar":""},"workExperience":[{"jobTitle":"","companyName":"","joiningMonth":"","joiningYear":"","isCurrentlyWorking":true,"toMonth":"","toYear":"","description":""}],"projecthighlights":[{"title":"","link":"","description":""}],"education":[{"degreeName":"","instituteName":"","location":"","startYear":"","endYear":""},],"skills":[{"skillName":"","level":"Expert/Strong/Competent"}],"certificates":[{"title":"", "url":"","issuedYear":"","expiredOn":""}]}\n Ensure the output is a valid JSON string without any extra text or explanations.`
    }
    response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: objSetting });
  } catch (err) {
    errorLog('Error retrieving user details:', err);
    next(err);
  }
});

commonRoutes.put('/db-dump', checkAuthorization(['superadmin']), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const loginUserRole = request?.user?.role;
    const isSuperadmin = (loginUserRole === 'superadmin');
    if (!isSuperadmin) { return response.status(HttpResponseStatus.NOT_AUTHORIZED).json({ data: { message: 'You are not authorized to perform this action' } }); }
    const result = await createDatabaseBackup()
    response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: "Backup completed successfully.", data: { backupPath: "download/backup.zip" } });
  } catch (err) {
    errorLog('Error while creating database backup:', err);
    next(err);
  }
});


export { commonRoutes }