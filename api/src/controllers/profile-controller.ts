import express, { NextFunction, Request, response, Response } from 'express';
const moment = require('moment');
import { HttpResponseStatus } from '../lib/utitlity';
import { decodeToken } from '../lib/jwt';
import { errorLog, infoLog } from '../helper/logger';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
import uploadFile from './file-controller';
import { Profile } from '../model/profile';
import { WorkExperience } from '../model/workExperience';
import { UserExperience } from '../model/userExperience';
import { Education } from '../model/education';
import { Expertise } from '../model/expertise';
import { User } from '../model/user';
import { Op, Sequelize } from 'sequelize';
import { Organization } from '../model/organization';
import { manageProfileSys_name } from '../helper/common-helper';
import fs from 'fs';
import path from 'path';
import { sequelizeConnection } from '../lib/dbconnection';
import { Certificate } from '../model/certificate';
import { SkillMaster } from '../model/master';

const userProfileRoutes = express.Router();

userProfileRoutes.get('/list', checkAuthorization(['superadmin', 'orgadmin']), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { page, limit, search } = request.query;
    const isSuperadmin = (request?.user?.role === 'superadmin');
    const searchField = search || '';
    const itemsPerPage: any = limit || 10;
    const currentPage: any = page || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    const findWhere = {
      [Op.or]: [{ 'firstName': { [Op.iLike]: `%${searchField}%` } }, { 'lastName': { [Op.iLike]: `%${searchField}%` } },
      { '$user.email$': { [Op.iLike]: `%${searchField}%` } }, { '$user.organization.organizationName$': { [Op.iLike]: `%${searchField}%` } }]
    }

    if (isSuperadmin && request?.user?.id) {
      findWhere['userId'] = { [Op.ne]: request?.user?.id }
    }

    const { count: totalCount, rows: resUsers } = await Profile.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      where: findWhere,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role_id', 'organization_id'],
          where: {
            ...(request?.user?.organization_id && { organization_id: request.user.organization_id }),
          },
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['organizationName']
            },

          ]
        },
      ],
      order: [
        [Sequelize.literal(`CASE WHEN "Profile"."profileImage" IS NULL OR "Profile"."profileImage" = '' THEN 1 ELSE 0 END`), 'ASC'],
        ['createdAt', 'DESC']
      ]
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
    errorLog('Error retrieving profile details:', err);
    next(err);
  }
});

userProfileRoutes.get('/validate/:sysName', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const token = request?.headers?.authorization?.split(' ')[1];
    const resLoginUser: any = decodeToken(token)?.data;

    const sysName = request?.params?.sysName;
    if (!sysName) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const filter: any = { isActive: true, sysName }
    if (!resLoginUser?.id) { filter['isPublic'] = true }

    const resProfile = await Profile.findOne({
      where: filter,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'organizationName', 'sysName', 'contactEmail', 'emailTemplate']
            },
          ]
        },
      ]
    });

    if (!resProfile) { return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Profile not found.' } }) }

    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'Profile details retrieved successfully', data: resProfile });

  } catch (error) {
    errorLog('Error Get Profile Details:', error);
    next(error);
  }
});

userProfileRoutes.post('/active-list', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const token = request?.headers?.authorization?.split(' ')[1];
    const resLoginUser: any = decodeToken(token)?.data;

    const { filterCriteria } = request.body;
    const { organization_id, firstName, lastName, bio, skillName = [] } = filterCriteria || {};

    const { page, limit } = request.query;
    const itemsPerPage: any = limit || 100;
    const currentPage: any = page || 1;
    const offset = (currentPage - 1) * itemsPerPage;

    //#region FilterCriteria

    //Profile
    const profileFilter: any = {
      // ...(resLoginUser?.id && { userId: { [Op.ne]: resLoginUser?.id } }),
      isActive: true
    };
    if (typeof firstName !== 'undefined' && firstName) { profileFilter["firstName"] = { [Op.iLike]: `%${firstName}%` } }
    if (typeof lastName !== 'undefined' && lastName) { profileFilter["lastName"] = { [Op.iLike]: `%${lastName}%` } }
    if (typeof bio !== 'undefined' && bio) { profileFilter["bio"] = { [Op.iLike]: `%${bio}%` } }
    if (!resLoginUser?.id) { profileFilter['isPublic'] = true }

    //User
    //IN UI SHOW LOGIN USER'S ORGANIZATION'S PROFILE LIST
    // if (resLoginUser?.organization_id) { profileFilter['$user.organization_id$'] = { [Op.eq]: resLoginUser.organization_id } }

    //IN UI WHEN FILTER WITH ORGANIZATION ID SHOW FILTER ORAGAZATION'S PROFILE LIST
    if (organization_id?.length > 0) { profileFilter['$user.organization_id$'] = { [Op.in]: organization_id } }

    //Expertise tag
    if (skillName?.length > 0) {
      profileFilter[Op.and] = [
        Sequelize.where(
          Sequelize.fn(
            'EXISTS',
            Sequelize.literal(`
              SELECT 1
              FROM jsonb_array_elements("tags") AS tag
              WHERE tag->>'skillName' in (${skillName.map((skill: string) => `'${skill}'`).join(', ')})
            `)
          ),
          true
        ),
      ];
    }


    //#endregion
    const { count: totalCount, rows: resProfile } = await Profile.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      where: profileFilter,
      attributes: ['id', 'userId', 'firstName', 'lastName', 'slogan', 'jobTitle', 'profileImage', 'bio', 'available', 'sysName'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'organizationName']
            },
          ]
        },
        {
          model: Expertise,
          as: 'expertises',
          attributes: ['profile_id', 'tags'],
        }
      ],
      order: [
        [Sequelize.literal(`CASE WHEN "Profile"."profileImage" IS NULL OR "Profile"."profileImage" = '' THEN 1 ELSE 0 END`), 'ASC'],
        ['createdAt', 'DESC']
      ]
    });

    response.status(HttpResponseStatus.SERVER_SUCCESS).json({
      data: resProfile,
      pagination: {
        itemsPerPage: itemsPerPage,
        currentPage: currentPage,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      }
    });
  } catch (err) {
    errorLog('Error retrieving profile details:', err);
    next(err);
  }
});

userProfileRoutes.get('/basic/:userId', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = request?.params?.userId;
    if (!userId) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const resProfile = await Profile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id', 'organizationName']
            },
          ]
        },
      ]
    })
    if (!resProfile) { return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Profile not found.' } }) }

    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'Profile details retrieved successfully', data: resProfile });
  } catch (error) {
    errorLog('Error Get Profile Details:', error);
    next(error);
  }
});

userProfileRoutes.get('/details/:userId', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = request?.params?.userId;
    if (!userId) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    let resWorkExperience = await WorkExperience.findAll({ where: { userId }, order: [['order_index', 'ASC']] })
    let resUserExperiences = await UserExperience.findAll({ where: { userId }, order: [['order_index', 'ASC']] })
    let resEducation = await Education.findAll({ where: { userId }, order: [['order_index', 'ASC']] })
    let resExpertise = await Expertise.findOne({ where: { userId }, order: [['createdAt', 'DESC']] })
    let resCertificate = await Certificate.findAll({ where: { userId }, order: [['order_index', 'ASC']] })

    // if (!resDetails) { return response.status(HttpResponseStatus.NOT_FOUND).json({ message: 'Details not found.' }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({
      message: 'work experience details retrieved successfully',
      data: {
        workExperience: resWorkExperience || [],
        experiences: resUserExperiences || [],
        educations: resEducation || [],
        experienceTags: resExpertise || [],
        certificates: resCertificate || []
      }
    });
  } catch (error) {
    errorLog('Error Get Profile Details:', error);
    next(error);
  }
});



//#region UDPATE PROFILE
userProfileRoutes.put('/update/:type', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    const type = request?.params?.type;
    const userId = request?.body?.userId || request?.user?.id;
    if (!type) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    let resResult: any;
    switch (type) {
      case 'basic-info':
        resResult = await updateBasicProfileDetails(objBody, userId);
        break;
      case 'workexperience':
        resResult = await updateWorkExperience(objBody, userId);
        break;
      case 'userexperience':
        resResult = await updateUserExperience(objBody, userId);
        break;
      case 'education':
        resResult = await updateProfileEducation(objBody, userId);
        break;
      case 'expertise':
        resResult = await updateProfileExpertise(objBody, userId);
        break;
      case 'certificate':
        resResult = await updateCertificate(objBody, userId);
        break;
      case 'jsonData':
        if (objBody?.json && Object.keys(objBody?.json)?.length > 0) {
          const BasicDetail = objBody?.json.basic ?? null;
          const workexperience = objBody?.json.workExperience ?? null; //work experience
          const projecthighlights = objBody?.json.projecthighlights ?? null; //userexperience
          const education = objBody?.json.education ?? null;
          const skills = objBody?.json.skills ?? null;
          const certificates = objBody?.json.certificates ?? null;

          if (BasicDetail) { try { resResult = await updateBasicProfileDetails(BasicDetail, userId); } catch { } }

          if (workexperience?.length > 0) {
            const workExperiencePromises = workexperience?.map(eachWE => updateWorkExperience(eachWE, userId).catch(() => { }));
            await Promise.all(workExperiencePromises);
          }

          if (projecthighlights?.length > 0) {
            const projecthighlightsPromises = projecthighlights?.map(eachUE => updateUserExperience(eachUE, userId).catch(() => { }));
            await Promise.all(projecthighlightsPromises);
          }

          if (education?.length > 0) {
            const educationPromises = education?.map(eachEdu => updateProfileEducation(eachEdu, userId).catch(() => { }));
            await Promise.all(educationPromises);
          }

          if (skills?.length > 0) {
            try { await updateProfileExpertise({ experienceTags: skills }, userId, objBody?.experienceTags_id) } catch { }
          }

          if (certificates?.length > 0) {
            const certificatesPromises = certificates?.map((eachCerti: any) => updateCertificate(eachCerti, userId).catch(() => { }));
            await Promise.all(certificatesPromises);
          }

          const resProfile = await Profile.findOne({ where: { userId } })
          return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: "Profile updated.", data: resProfile } })
        } else {
          return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: "No json data found for update." } })
        }
        break;
      default:
        break;
    }
    if (resResult?.success) {
      return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: resResult.message, data: resResult?.data } })
    } else {
      return response.status(resResult?.status || HttpResponseStatus.SERVER_ERROR).json({ data: { message: resResult.message } })
    }

  } catch (err) {
    errorLog('Error Update Profile Basic-info:', err);
    next(err);
  }
});

const updateBasicProfileDetails = async (objBody: any, userId: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resProfile = await Profile.findOne({ where: { userId } })

      let objToUpdate: any = {};
      if (typeof objBody.firstName !== 'undefined') objToUpdate["firstName"] = objBody.firstName;
      if (typeof objBody.lastName !== 'undefined') objToUpdate["lastName"] = objBody.lastName;
      if (typeof objBody.slogan !== 'undefined') objToUpdate["slogan"] = objBody.slogan;
      if (typeof objBody.jobTitle !== 'undefined') objToUpdate["jobTitle"] = objBody.jobTitle;
      if (typeof objBody.bio !== 'undefined') objToUpdate["bio"] = objBody.bio;
      if (typeof objBody.available !== 'undefined') objToUpdate["available"] = objBody.available;
      if (typeof objBody.preferredEnvironment !== 'undefined') objToUpdate["preferredEnvironment"] = objBody.preferredEnvironment;
      if (typeof objBody.mostAmazing !== 'undefined') objToUpdate["mostAmazing"] = objBody.mostAmazing;
      if (typeof objBody.facebook_url !== 'undefined') objToUpdate["facebook_url"] = objBody.facebook_url;
      if (typeof objBody.x_url !== 'undefined') objToUpdate["x_url"] = objBody.x_url;
      if (typeof objBody.google_scholar !== 'undefined') objToUpdate["google_scholar"] = objBody.google_scholar;
      if (typeof objBody.linkdin_url !== 'undefined') objToUpdate["linkdin_url"] = objBody.linkdin_url;
      if (typeof objBody.isActive !== 'undefined') objToUpdate["isActive"] = objBody.isActive;
      if (typeof objBody.isPublic !== 'undefined') objToUpdate["isPublic"] = objBody.isPublic;

      if (objToUpdate.firstName || objToUpdate.lastName) {
        const sysName = await manageProfileSys_name(userId, objToUpdate?.firstName, objToUpdate?.lastName);
        if (sysName) objToUpdate['sysName'] = sysName
      }

      if (typeof objBody.profileImage !== 'undefined') {
        if (resProfile?.profileImage) {
          try {
            // Remove old image
            const filePath = path.join(__dirname, `../${resProfile?.profileImage}`);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.log("Error while delete profile", err)
          }
        }
        objToUpdate["profileImage"] = objBody.profileImage;
      };

      if (resProfile?.id) {
        // UPDATE PROFILE
        const resUpate = await Profile.update(objToUpdate, { where: { userId }, returning: true }).catch((error) => { throw (error) });
        resolve({ success: true, message: 'Profile save successfully', data: resUpate[1]?.[0] });

      } else {
        // CREATE PROFILE
        objToUpdate['userId'] = userId;
        const resCreate = await Profile.create(objToUpdate).catch((error) => { throw (error) });
        resolve({ success: true, message: 'Profile save successfully', data: resCreate.toJSON() });
      }

    } catch (err: any) {
      console.error('Error updateBasicProfileDetails:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the basic profile information.' });
    }
  });
};

const updateWorkExperience = async (objBody: any, userId: string) => {
  if (!objBody?.jobTitle || !objBody?.companyName) { return ({ status: HttpResponseStatus.MISSING_PARAMS, success: false, message: 'Please pass required parameters.' }) }
  const profile_id = await Profile.findOne({ where: { userId }, attributes: ["id"] })?.catch(() => { return null })

  return new Promise(async (resolve, reject) => {
    try {
      let objToUpdate: any = { profile_id: profile_id?.id };
      if (typeof objBody.jobTitle !== 'undefined') objToUpdate["jobTitle"] = objBody.jobTitle;
      if (typeof objBody.companyName !== 'undefined') objToUpdate["companyName"] = objBody.companyName;
      if (typeof objBody.joiningMonth !== 'undefined') objToUpdate["joiningMonth"] = objBody.joiningMonth;
      if (typeof objBody.joiningYear !== 'undefined') objToUpdate["joiningYear"] = objBody.joiningYear;
      if (typeof objBody.isCurrentlyWorking !== 'undefined') objToUpdate["isCurrentlyWorking"] = objBody.isCurrentlyWorking;
      if (typeof objBody.toMonth !== 'undefined') objToUpdate["toMonth"] = objBody.toMonth;
      if (typeof objBody.toYear !== 'undefined') objToUpdate["toYear"] = objBody.toYear;
      if (typeof objBody.description !== 'undefined') {
        objToUpdate["description"] = Array.isArray(objBody.description) ? objBody.description : objBody?.description?.length > 0 ? [objBody.description] : []
      };

      if (objBody?.id) {
        // UPDATE
        await WorkExperience.update(objToUpdate, { where: { userId, id: objBody?.id } }).catch((error) => { throw (error) });
      } else {
        // CREATE 
        const resWorkExperienceCount = await WorkExperience.count({ where: { userId } });
        objToUpdate['userId'] = userId;
        objToUpdate["order_index"] = resWorkExperienceCount;
        await WorkExperience.create(objToUpdate).catch((error) => { throw (error) });
      }
      resolve({ success: true, message: 'Work experience save successfully' });

    } catch (err: any) {
      console.error('Error updateWorkExperience:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the work Experience' });
    }
  });
};

const updateUserExperience = async (objBody: any, userId: string) => {
  if (!objBody?.title) { return ({ status: HttpResponseStatus.MISSING_PARAMS, success: false, message: 'Please pass required parameters.' }) }
  const profile_id = await Profile.findOne({ where: { userId }, attributes: ["id"] })?.catch(() => { return null })

  return new Promise(async (resolve, reject) => {
    try {
      let objToUpdate: any = { profile_id: profile_id?.id };
      if (typeof objBody.title !== 'undefined') objToUpdate["title"] = objBody.title;
      if (typeof objBody.link !== 'undefined') objToUpdate["link"] = objBody.link;
      if (typeof objBody.description !== 'undefined') objToUpdate["description"] = objBody.description;

      if (objBody?.id) {
        // UPDATE
        await UserExperience.update(objToUpdate, { where: { userId, id: objBody?.id } }).catch((error) => { throw (error) });
      } else {
        const resUserExperienceCount = await UserExperience.count({ where: { userId } });
        objToUpdate['userId'] = userId;
        objToUpdate["order_index"] = resUserExperienceCount;
        await UserExperience.create(objToUpdate).catch((error) => { throw (error) });
      }
      resolve({ success: true, message: 'Project highlight save successfully' });

    } catch (err: any) {
      console.error('Error update Project highlight:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the Project highlight' });
    }
  });
};

const updateProfileEducation = async (objBody: any, userId: string) => {
  if (!objBody?.degreeName) { return ({ status: HttpResponseStatus.MISSING_PARAMS, success: false, message: 'Please pass required parameters.' }) }
  const profile_id = await Profile.findOne({ where: { userId }, attributes: ["id"] })?.catch(() => { return null })

  return new Promise(async (resolve, reject) => {
    try {
      let objToUpdate: any = { profile_id: profile_id?.id };
      if (typeof objBody.degreeName !== 'undefined') objToUpdate["degreeName"] = objBody.degreeName;
      if (typeof objBody.instituteName !== 'undefined') objToUpdate["instituteName"] = objBody.instituteName;
      if (typeof objBody.location !== 'undefined') objToUpdate["location"] = objBody.location;
      if (typeof objBody.startYear !== 'undefined') objToUpdate["startYear"] = objBody.startYear;
      if (typeof objBody.endYear !== 'undefined') objToUpdate["endYear"] = objBody.endYear;

      if (objBody?.id) {
        // UPDATE
        await Education.update(objToUpdate, { where: { userId, id: objBody?.id } }).catch((error) => { throw (error) });
      } else {
        // Create
        const resEducationCount = await Education.count({ where: { userId } });
        objToUpdate['userId'] = userId;
        objToUpdate["order_index"] = resEducationCount;
        await Education.create(objToUpdate).catch((error) => { throw (error) });
      }
      resolve({ success: true, message: 'Education save successfully' });

    } catch (err: any) {
      console.error('Error updateProfileEducation:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the Education' });
    }
  });
};

const updateProfileExpertise = async (objBody: any, userId: string, experience_id = null) => {
  const profile_id = await Profile.findOne({ where: { userId }, attributes: ["id"] })?.catch(() => { return null })

  return new Promise(async (resolve, reject) => {
    try {
      let objToUpdate: any = { profile_id: profile_id?.id };
      const experienceTags = objBody?.experienceTags || [];
      objToUpdate['tags'] = experienceTags?.map((tag: any) => ({
        ...tag,
        isHighlighted: tag?.isHighlighted || false
      }));
      const _id = objBody?.id || experience_id;

      if (experience_id) { // if data Json data import
        let userExpertises = await Expertise.findOne({ where: { userId } })
        // Existing tags should be retained during data import.
        if (userExpertises?.tags?.length > 0) {
          objToUpdate['tags'] = [
            ...objToUpdate?.tags,
            ...userExpertises?.tags?.filter((old: any) => !objToUpdate?.tags?.some((newSkill: any) => newSkill?.skillName == old?.skillName)
            )
          ];
        }

        //#region Create new skill Name
        const skillNames = objToUpdate?.tags?.map((skill: any) => skill?.skillName);
        const resSkills = await SkillMaster.findAll({ where: { name: skillNames }, attributes: ['name'] });
        const existingSkillNames = resSkills?.map(skill => skill?.name);
        const newSkills = skillNames.filter((name: any) => !existingSkillNames?.includes(name)).map(name => ({ name }));
        if (newSkills.length > 0) { await SkillMaster.bulkCreate(newSkills); }
        //#endregion
      }

      if (_id) {
        // UPDATE
        await Expertise.update(objToUpdate, { where: { userId, id: _id } }).catch((error) => { throw (error) });
      } else {
        objToUpdate['userId'] = userId;
        await Expertise.create(objToUpdate).catch((error) => { throw (error) });
      }
      resolve({ success: true, message: 'Skill save successfully' });

    } catch (err: any) {
      console.error('Error updateProfileExpertise:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the Expertise' });
    }
  });
};

const updateCertificate = async (objBody: any, userId: string) => {
  if (!objBody?.title) { return ({ status: HttpResponseStatus.MISSING_PARAMS, success: false, message: 'Please pass required parameters.' }) }
  const profile_id = await Profile.findOne({ where: { userId }, attributes: ["id"] })?.catch(() => { return null })

  return new Promise(async (resolve, reject) => {
    try {
      let objToUpdate: any = { profile_id: profile_id?.id };
      if (typeof objBody?.title !== 'undefined') objToUpdate["title"] = objBody.title;
      if (typeof objBody?.url !== 'undefined') objToUpdate["url"] = objBody.url;
      if (typeof objBody?.issuedYear !== 'undefined') objToUpdate["issuedYear"] = objBody.issuedYear;
      if (typeof objBody?.expiredOn !== 'undefined') objToUpdate["expiredOn"] = objBody.expiredOn;

      if (objBody?.id) {
        // UPDATE
        await Certificate.update(objToUpdate, { where: { userId, id: objBody?.id } }).catch((error) => { throw (error) });
      } else {
        // Create
        const resCertificateCount = await Certificate.count({ where: { userId } });
        objToUpdate['userId'] = userId;
        objToUpdate["order_index"] = resCertificateCount;
        await Certificate.create(objToUpdate).catch((error) => { throw (error) });
      }
      resolve({ success: true, message: 'Certificate save successfully' });

    } catch (err: any) {
      console.error('Error updateCertificate:', err);
      reject({ success: false, message: err.message || 'An error occurred while saveing the Certificate' });
    }
  });
};

//#endregion


//#region  Change Order
userProfileRoutes.put('/change-order/:tableName', checkAuthorization(), async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { tableName } = request.params;
    if (request.body?.length === 0) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters of array to update order.' } }); }

    const ids = request.body?.map((obj: any) => `'${obj?.id}'`)?.join(",");
    const updateStatements = request.body?.map((obj: any) => `WHEN id = '${obj?.id}' THEN ${obj?.order_index}`)?.join(" ");

    const updateQuery = `UPDATE "${tableName}" SET order_index = CASE ${updateStatements} END WHERE id IN (${ids});`;

    const [results, metadata] = await sequelizeConnection.query(updateQuery) as [unknown, { rowCount: number }];
    if (metadata.rowCount === 0) { return response.status(HttpResponseStatus.SERVER_ERROR).json({ data: { message: `${tableName} order not changed.` } }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: `${tableName} order changed successfully.` } })
  }
  catch (error) {
    errorLog(`Error on update order:`, error);
    next(error);
  }
});

//#endregion


//#region DELETE PROFILE
userProfileRoutes.delete('/delete/:type/:recordId', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { type, recordId } = request?.params;
    const { userID } = request?.query;
    const userId = userID || request?.user?.id;

    if (!type || !recordId) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    let resResult: any;
    switch (type) {
      case 'workexperience':
        resResult = await deleteWorkExperience(recordId, userId);
        break;
      case 'userexperience':
        resResult = await deleteUserExperience(recordId, userId);
        break;
      case 'education':
        resResult = await deleteProfileEducation(recordId, userId);
        break;

      case 'certificate':
        resResult = await deleteCertificate(recordId, userId);
        break;

      default:
        break;
    }
    if (resResult?.success) {
      return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: resResult.message } });
    } else {
      return response.status(resResult?.status || HttpResponseStatus.SERVER_ERROR).json({ data: { message: resResult.message } });
    }

  } catch (err) {
    errorLog('Error Delete Profile Basic-info:', err);
    next(err);
  }
});

const deleteWorkExperience = async (recordId: string, userId: string) => {
  return new Promise(async (resolve, reject) => {

    try {
      const resExperience = await WorkExperience.findOne({ where: { userId, id: recordId } })
      if (!resExperience) { reject({ status: HttpResponseStatus.NOT_FOUND, success: false, message: 'Work experience not found.' }) }

      await resExperience.destroy();
      resolve({ success: true, message: 'Work experience deleted successfully.' });

    } catch (err) {
      reject({ success: false, message: err?.message || 'An error occurred while removeing the Work Experience' });
    }
  });
}

const deleteUserExperience = async (recordId: string, userId: string) => {
  return new Promise(async (resolve, reject) => {

    try {
      const resExperience = await UserExperience.findOne({ where: { userId, id: recordId } })
      if (!resExperience) { reject({ status: HttpResponseStatus.NOT_FOUND, success: false, message: 'Project highlight not found.' }) }

      await resExperience.destroy();
      resolve({ success: true, message: 'Project highlight deleted successfully.' });

    } catch (err) {
      reject({ success: false, message: err?.message || 'An error occurred while removeing the Project highlight' });
    }
  });
}

const deleteProfileEducation = async (recordId: string, userId: string) => {
  return new Promise(async (resolve, reject) => {

    try {
      const resEducation = await Education.findOne({ where: { userId, id: recordId } })
      if (!resEducation) { reject({ status: HttpResponseStatus.NOT_FOUND, success: false, message: 'Education not found.' }) }

      await resEducation.destroy();
      resolve({ success: true, message: 'Education deleted successfully.' });

    } catch (err) {
      reject({ success: false, message: err?.message || 'An error occurred while removeing the Education' });
    }
  });
}

const deleteCertificate = async (recordId: string, userId: string) => {
  return new Promise(async (resolve, reject) => {

    try {
      const resCertificate = await Certificate.findOne({ where: { userId, id: recordId } })
      if (!resCertificate) { reject({ status: HttpResponseStatus.NOT_FOUND, success: false, message: 'Certificate not found.' }) }

      await resCertificate.destroy();
      resolve({ success: true, message: 'Certificate deleted successfully.' });

    } catch (err) {
      reject({ success: false, message: err?.message || 'An error occurred while removeing the Certificate' });
    }
  });
}
//#endregion

export { userProfileRoutes }
