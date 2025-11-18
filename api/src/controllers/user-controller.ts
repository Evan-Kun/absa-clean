import express, { NextFunction, request, Request, Response } from 'express';
import { HttpResponseStatus } from '../lib/utitlity';
import { errorLog, infoLog } from '../helper/logger';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
import { User } from '../model/user';
import { Profile } from '../model/profile';
import { Role } from '../model/role';
import { Organization } from '../model/organization';
import bcrypt from 'bcrypt'
import { manageProfileSys_name } from '../helper/common-helper';
import fs from 'fs';
import path from 'path';
import { Education } from '../model/education';
import { Expertise } from '../model/expertise';
import { WorkExperience } from '../model/workExperience';
import { UserExperience } from '../model/userExperience';
const { Op } = require('sequelize');

const userRoutes = express.Router();

userRoutes.get('/list', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { page, limit, search } = request.query;
    const isSuperadmin = (request?.user?.role === 'superadmin');
    const searchField = search || '';

    const itemsPerPage: any = limit || 10;
    const currentPage: any = page || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    let userFilter: any = {};

    if (isSuperadmin) {
      userFilter['id'] = { [Op.ne]: request?.user?.id }
    }

    if (searchField) {
      userFilter[Op.or] = [
        { 'email': { [Op.iLike]: `%${searchField}%` } },
        { '$organization.organizationName$': { [Op.iLike]: `%${searchField}%` } },
        { '$role.roleName$': { [Op.iLike]: `%${searchField}%` } }
      ]
    }

    if (request?.user?.organization_id) {
      userFilter['organization_id'] = request.user.organization_id;
    }

    const { count: totalCount, rows: resUsers } = await User.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      where: userFilter,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['organizationName', 'sysName']
        },
        {
          model: Role,
          as: 'role',
          attributes: ['roleName']
        },
        {
          model: Profile,
          as: 'profile',
          attributes: ['firstName', 'lastName', 'sysName']
        },
      ],
      order: [['createdAt', 'DESC']]
    });

    response.status(HttpResponseStatus.SERVER_SUCCESS).json({
      data: resUsers,
      pagination: {
        itemsPerPage: itemsPerPage,
        currentPage: currentPage,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      }
    });
  } catch (err) {
    errorLog('Error retrieving user details:', err);
    next(err);
  }
});

userRoutes.get('/details', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const user = await User.findOne({
      where: { id: request?.user?.id },
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['profileImage', 'sysName']
        },
        {
          model: Role,
          as: 'role',
          attributes: ['roleName']
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['sysName']
        },
      ]
    });
    if (!user) { return response.status(HttpResponseStatus.NOT_FOUND).send({ data: { message: 'User not found.' } }); }
    response.status(HttpResponseStatus.SERVER_SUCCESS).json({
      message: 'User data retrieved successfully',
      success: true,
      data: user
    });
  } catch (err) {
    errorLog('Error retrieving user details:', err);
    next(err);
  }
});

userRoutes.post('/create', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    if (!objBody?.role_id || !objBody?.email || !objBody?.firstName || !objBody?.lastName) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    // check Email Exist
    const isEmailExist = await User.findOne({ where: { email: objBody?.email?.toLowerCase() } });
    if (isEmailExist) { return response.status(HttpResponseStatus.CONFLICT_DATA).send({ data: { message: 'This email address is already registered!' } }); }

    // check role
    const role = await Role.findOne({ where: { id: objBody?.role_id } });
    if (!role) { return response.status(HttpResponseStatus.NOT_FOUND).send({ data: { message: 'Role Not found.' } }); }

    let organization_id = objBody?.organization_id || request.user.organization_id || null;
    // Create Organization
    if (role?.roleName == process.env.ROLE_ORGADMIN && objBody?.organizationName && !objBody?.organization_id) {

      let sysName = objBody?.organizationName?.trim()?.toLowerCase()?.split(' ').join('-');
      const existORG = await Organization.findOne({ where: { [Op.or]: [{ organizationName: objBody?.organizationName }, { sysName }] } }).catch((err) => { throw err })
      if (!existORG) {
        const objToSaveOrg = {
          organizationName: objBody?.organizationName,
          sysName,
        }
        const newOrganization = await Organization.create(objToSaveOrg).catch((err) => { throw err })
        organization_id = newOrganization?.id;
      } else {
        if (!objBody?.id) { return response.status(HttpResponseStatus.CONFLICT_DATA).send({ data: { message: 'Organization with this name/sys_name is already exists.!' } }); }
        organization_id = existORG?.id
      }
    }

    // set user default password
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'TD123##';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await User.create({
      email: objBody?.email?.toLowerCase(),
      password: hashedPassword,
      role_id: objBody?.role_id,
      organization_id
    });

    const userResponse = newUser.toJSON();

    if (userResponse?.id) {
      let objToSave = {
        userId: userResponse?.id,
        firstName: objBody?.firstName,
        lastName: objBody?.lastName
      }

      // MANAGE SYS_NAME
      const sysName = await manageProfileSys_name(userResponse?.id, objToSave?.firstName, objToSave?.lastName);
      if (sysName) objToSave['sysName'] = sysName;

      const resCreate = await Profile.create(objToSave).catch((error) => { throw (error) });
      if (resCreate) {
        delete userResponse?.password;
        return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: "User created successfully", data: userResponse });
      }
    }
    return response.status(HttpResponseStatus.SERVER_ERROR).json({ message: "Error while creating user." });
  } catch (err) {
    errorLog('Error Create user:', err);
    next(err);
  }
});

userRoutes.put('/changePassword', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { id, newPassword } = request.body;
    if (!id || !newPassword) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [affectedRows] = await User.update({ password: hashedPassword }, { where: { id: id } }).catch((error) => { throw (error) });
    if (affectedRows === 0) { return response.status(HttpResponseStatus.SERVER_ERROR).json({ data: { message: "Password not changed" } }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: "Password changed successfully." } })

  }
  catch (err) {
    errorLog('Error Change Password:', err);
    next(err);
  }
});

userRoutes.put('/update', checkAuthorization(["superadmin", "orgadmin"]), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    if (!objBody?.id && !objBody?.firstName && !objBody.lastName) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const resUser = await User.findOne({ where: { id: objBody?.id } }).catch((error) => { throw (error) })
    if (!resUser) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'User not found.' }) }

    let objToUpdate: any = {};
    if (typeof objBody.role_id !== 'undefined') objToUpdate["role_id"] = objBody?.role_id;
    if (typeof objBody.isActive !== 'undefined') objToUpdate["isActive"] = objBody?.isActive;
    if (typeof objBody?.organization_id !== 'undefined') objToUpdate["organization_id"] = objBody?.organization_id;

    //#region Orgadmin to User downgrade
    if (resUser?.role_id != objBody?.role_id && objBody?.organization_id) {
      const new_user_Role: any = await Role.findOne({ where: { id: objBody?.role_id } })?.catch((err) => { console.log("Error while getting role") });

      if (new_user_Role?.roleName == process.env.ROLE_USER) {
        const allOrgAdminsCount: any = await User.count({
          where: {
            id: { [Op.ne]: objBody?.id },
            role_id: resUser?.role_id,
            organization_id: objBody?.organization_id
          }
        }).catch((err) => console.log("Error", err))

        if (allOrgAdminsCount === 0) {
          return response.status(HttpResponseStatus.CONFLICT_DATA).json({ data: { message: "At least one organization admin must required!" } })
        }
      }
    }
    //#endregion

    if (typeof objBody.email !== 'undefined') {
      const existEmail = await User.findOne({ where: { id: { [Op.ne]: resUser?.id }, email: objBody?.email } }).catch((err) => { throw err })
      if (existEmail) { return response.status(HttpResponseStatus.CONFLICT_DATA).json({ data: { message: "Email already exists." } }) }
      objToUpdate["email"] = objBody?.email
    };

    // Create new org if not exist
    const role: any = await Role.findOne({ where: { id: objBody?.role_id } })?.catch((err) => { });
    if (typeof objBody.organizationName !== 'undefined' && role?.roleName == process.env.ROLE_ORGADMIN && objBody.organizationName?.length > 0) {
      let sysName = objBody?.organizationName?.trim()?.toLowerCase()?.split(' ').join('-');
      const existSameNameORG = await Organization.findOne({ where: { [Op.or]: [{ organizationName: objBody?.organizationName }, { sysName }] } }).catch((err) => { throw err })
      if (!existSameNameORG) {
        const objToSaveOrg = {
          organizationName: objBody?.organizationName,
          sysName,
        }
        const newOrganization = await Organization.create(objToSaveOrg).catch((err) => { throw err })
        objToUpdate['organization_id'] = newOrganization?.id;
      } else {
        return response.status(HttpResponseStatus.CONFLICT_DATA).send({ data: { message: 'Organization with this name is already exists.!' } });
      }
    }

    //#region MANAGE PROFILE 
    if (objBody.firstName && objBody.lastName) {
      let objToSave = {
        firstName: objBody?.firstName,
        lastName: objBody?.lastName
      }

      // MANAGE SYS_NAME
      const sysName = await manageProfileSys_name(objBody?.id, objBody?.firstName, objBody?.lastName);
      if (sysName) objToSave['sysName'] = sysName
      await Profile.update(objToSave, { where: { userId: objBody?.id } }).catch((error) => { throw (error) });
    }
    //#endregion

    const [affectedRows] = await User.update(objToUpdate, { where: { id: objBody?.id } }).catch((error) => { throw (error) });
    if (affectedRows === 0) { return response.status(HttpResponseStatus.SERVER_ERROR).json({ data: { message: "User not update" } }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: "User updated successfully." } })

  } catch (err) {
    errorLog('Error Update user:', err);
    next(err);
  }
});

userRoutes.delete('/delete/:userId', checkAuthorization(["superadmin"]), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { userId } = request.params;

    const user_Role = await Role.findOne({ where: { roleName: process.env.ROLE_SUPERADMIN } });
    if (user_Role?.id == userId) {
      return response.status(HttpResponseStatus.NOT_AUTHORIZED).json({ message: 'Superadmin can not delete' });
    }


    const user = await User.findOne({ where: { id: userId } })?.catch((err) => { });
    if (!user) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'User not found.' }); }

    //#region  Find and delete user Education
    await Education.destroy({ where: { userId } })?.catch((err) => { });
    //#endregion


    //#region  Find and delete user Education
    await Expertise.destroy({ where: { userId } })?.catch((err) => { });
    //#endregion


    //#region  Find and delete user WorkExperience
    await WorkExperience.destroy({ where: { userId } })?.catch((err) => { });
    //#endregion

    //#region  Find and delete user WorkExperience
    await UserExperience.destroy({ where: { userId } })?.catch((err) => { });
    //#endregion


    //#region  Find and delete user profile
    const profile = await Profile.findOne({ where: { userId }, attributes: ['id', "profileImage"] });
    if (profile) {
      // Remove profile image if it exists
      try {
        if (profile?.profileImage) {
          const filePath = path.join(__dirname, `../${profile?.profileImage}`);
          if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
        }
        await profile.destroy();
      } catch (err) {
        console.log("Error while remove image ", err)
      }
    }
    //#endregion

    // Delete user
    await user.destroy();

    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: "User deleted successfully." });
  } catch (error) {
    errorLog('Error deleting user:', error);
    next(error);
  }
});

export { userRoutes }