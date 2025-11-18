import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt'
import { HttpResponseStatus } from '../lib/utitlity';
import { decodeToken, generateToken } from '../lib/jwt';
import { errorLog, infoLog } from '../helper/logger';
import { User } from '../model/user';
import { Profile } from '../model/profile';
import { Role } from '../model/role';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
import { Organization } from '../model/organization';
import { sendEmail } from '../lib/mailer';
const { Op } = require('sequelize');

const authRoutes = express.Router();

authRoutes.post('/login', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    const isAdmin = request.query.isAdmin || false;
    if (!objBody?.email || !objBody?.password) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    // check email exists
    const user = await User.findOne({ where: { email: objBody?.email?.toLowerCase() } });
    if (!user) { return response.status(HttpResponseStatus.NOT_AUTHENTICATED).send({ data: { message: 'Email not register' } }); }
    if (!user?.isActive) { return response.status(HttpResponseStatus.NOT_AUTHENTICATED).send({ data: { message: 'Account inactive. Please contact administrator.' } }) }

    // check user Role
    const user_Role = await Role.findOne({ where: { id: user?.role_id } });
    if (isAdmin) {
      const allowedAdminRoles = [process.env.ROLE_SUPERADMIN, process.env.ROLE_ORGADMIN];
      if (!allowedAdminRoles.includes(user_Role?.roleName)) {
        return response.status(HttpResponseStatus.NOT_AUTHENTICATED).send({ data: { message: 'Access denied' } });
      }
    }

    // check password 
    const isPasswordValid = await bcrypt.compare(objBody.password, user.password);
    if (!isPasswordValid) { return response.status(HttpResponseStatus.NOT_AUTHENTICATED).send({ data: { message: 'Invalid email or password' } }) }

    const resProfile = await Profile.findOne({ where: { userId: user?.id } });

    const userResponse = user.toJSON();
    delete userResponse.password;
    response.status(HttpResponseStatus.SERVER_SUCCESS).json({
      message: 'Login successful',
      data: {
        id: user?.id,
        email: user?.email,
        role_id: user?.role_id,
        roleName: user_Role?.roleName,
        organization_id: user?.organization_id,
        sysName: resProfile?.sysName,
        token: generateToken({ id: user?.id, email: user?.email, role: user_Role?.roleName, role_id: user?.role_id, organization_id: user?.organization_id })
      },
    });
  } catch (err) {
    errorLog('Error Login user:', err);
    next(err);
  }
});

authRoutes.get('/roles', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const resRoles = await Role.findAll({
      where: {
        roleName: { [Op.ne]: process.env.ROLE_SUPERADMIN || 'superadmin' }
      },
    })
    if (!resRoles) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'Roles not found.' }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'successfully', data: resRoles });
  } catch (error) {
    errorLog('Error Get while get Role:', error);
    next(error);
  }
});

authRoutes.get('/organizations', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const resOrganizations = await Organization.findAll()
    if (!resOrganizations) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'Roles not found.' }) }

    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'successfully', data: resOrganizations });
  } catch (error) {
    errorLog('Error Get while get organizations:', error);
    next(error);
  }
});

const createDefaultRoles = async () => {
  try {
    let superadmin_Role = await Role.findOne({ where: { roleName: 'superadmin' } })
    if (!superadmin_Role?.id) { await Role.create({ roleName: "superadmin" }).catch(() => { }); }
    let orgadmin_Role = await Role.findOne({ where: { roleName: 'orgadmin' } })
    if (!orgadmin_Role?.id) { await Role.create({ roleName: "orgadmin" }).catch(() => { }); }
    let user_Role = await Role.findOne({ where: { roleName: 'user' } })
    if (!user_Role?.id) { await Role.create({ roleName: "user" }).catch(() => { }); }
  } catch { }
}

const createDefaultSuperAdmin = async () => {
  try {
    const email = "superadmin@gmail.com";
    const password = "td123$$$";
    await createDefaultRoles();

    let superAdmin_Role = await Role.findOne({ where: { roleName: 'superadmin' } })
    const superAdmin_RoleID = superAdmin_Role?.id;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) { return; }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
      role_id: superAdmin_RoleID,
      organization_id: null,
    });
    infoLog('Default superadmin user created successfully.');
  } catch (error) {
    errorLog('Error creating superadmin user:', error);
  }
};

authRoutes.post('/forgot-password', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    if (!objBody?.email) { return response.status(HttpResponseStatus.MISSING_PARAMS).json({ message: 'Please pass required parameters' }); }

    // check Email Exist
    const existEmail = await User.findOne({ where: { email: objBody?.email?.toLowerCase() } });
    if (!existEmail) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'Email not registered!' }); }

    // Create JWT token
    let userObj = { user_id: existEmail?.id, email: existEmail?.email };
    let token = generateToken(userObj, '5m');

    // change password access Link
    let webUrl = process.env.WEB_URL || `http://localhost:3000/`;
    let changePassword_URL = `${webUrl}account/fp/${token}`;

    // Sent Mail
    console.log("------------------change Password URL------------------------------");
    console.log(changePassword_URL);
    console.log("-------------------------------------------------------------------");

    const result = await sendEmail({
      to: existEmail?.email,
      subject: "Change password",
      text: changePassword_URL,
      template: "change_password"
    });

    if (result?.success) {
      return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ success: true, message: "Mail has been sent to your email." });
    } else {
      return response.status(HttpResponseStatus.SERVER_ERROR).json({ success: false, message: 'An error occurred while sending mail, contact administrator.' });
    }

  } catch (err) {
    errorLog('Error forgot-password:', err);
    next(err);
  }
});

authRoutes.post('/change-password/:token', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const token = request?.params?.token;
    const objBody = request?.body;
    if (!token || !objBody?.newPassword) { return response.status(HttpResponseStatus.MISSING_PARAMS).json({ message: 'Please pass required parameters' }); }

    let user: any = decodeToken(token)
    if (!user?.data?.user_id || user?.message == 'token expired') { return response.status(HttpResponseStatus.NOT_AUTHENTICATED).json({ message: 'Invalid or expired token.' }); }

    const hashedPassword = await bcrypt.hash(objBody?.newPassword, 10);

    const [affectedRows] = await User.update({ password: hashedPassword }, { where: { id: user?.data?.user_id } }).catch((error) => { throw (error) });
    if (affectedRows === 0) { return response.status(HttpResponseStatus.SERVER_ERROR).json({ message: "Password not changed" }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: "Password changed successfully." })

  } catch (err) {
    errorLog('Error forgot-password:', err);
    next(err);
  }
});

export { authRoutes, createDefaultSuperAdmin }