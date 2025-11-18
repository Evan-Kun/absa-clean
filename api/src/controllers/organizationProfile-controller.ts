import express, { NextFunction, Request, response, Response } from 'express';
import { HttpResponseStatus } from '../lib/utitlity';
import { errorLog } from '../helper/logger';
import { checkAuthorization } from '../middleware/authmiddleware';
import { Organization } from '../model/organization';
import { sendEmail } from '../lib/mailer';
import { User } from '../model/user';
import { Profile } from '../model/profile';

const organizationProfileRoutes = express.Router();

organizationProfileRoutes?.get('/details/:sysName', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const sysName = request?.params?.sysName;
    if (!sysName) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const resOrganization = await Organization.findOne({
      where: { sysName },
      attributes: ['id', 'organizationName', 'logo', 'description', 'sysName', 'contactEmail', 'emailTemplate']
    });

    if (!resOrganization) { return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Organization not found.' } }) }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'Profile details retrieved successfully', data: resOrganization });

  } catch (error) {
    errorLog('Error Get Profile Details:', error);
    next(error);
  }
});

organizationProfileRoutes?.put('/update/:id', checkAuthorization(["superadmin", "orgadmin"]), async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    const objBody = request.body;
    const id = request?.params?.id;
    if (!id) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    let objToUpdate: any = {};
    if (typeof objBody?.logo !== 'undefined') objToUpdate["logo"] = objBody?.logo;
    if (typeof objBody?.description !== 'undefined') objToUpdate["description"] = objBody?.description;
    if (typeof objBody?.contactEmail !== 'undefined') objToUpdate["contactEmail"] = objBody?.contactEmail;
    if (typeof objBody?.emailTemplate !== 'undefined') objToUpdate['emailTemplate'] = objBody?.emailTemplate;
    if (typeof objBody?.name !== 'undefined') {
      objToUpdate["organizationName"] = objBody?.name;
      objToUpdate["sysName"] = objBody?.name?.trim()?.toLowerCase()?.split(' ').join('-');
    };

    const resUpate: any = await Organization.update(objToUpdate, { where: { id }, returning: true }).catch((error) => { throw (error) });
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ message: 'Organization Updated successfully', data: resUpate[1]?.[0] });

  } catch (error) {
    errorLog('Error Get Profile Details:', error);
    next(error);
  }
});

organizationProfileRoutes.post('/contact/:orgID', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
  try {
    let orgID = request?.params?.orgID;
    let { userID, description, requestedBy = "" } = request?.body;

    if (!userID || !description) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }


    const existOrg = await Organization.findOne({
      where: { id: orgID },
      attributes: ['organizationName', 'contactEmail', 'emailTemplate'],
    });
    if (!existOrg || !existOrg?.contactEmail) { return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Organization/contactEmail not found.' } }) }


    const existUser: any = await User.findOne({
      where: { id: userID },
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['firstName', 'lastName', 'jobTitle', 'sysName']
        },
      ]
    });
    if (!existUser) { return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'User not found.' } }) }

    let defaultMailTemplate = existOrg?.emailTemplate || "";
    let emailTemplate: any = {};
    const fullName = `${existUser?.profile?.firstName} ${existUser?.profile?.lastName}`;
    if (defaultMailTemplate?.description) {
      emailTemplate = {
        ...defaultMailTemplate,
        description: description
        // description: defaultMailTemplate?.description?.replace(
        //   '{Body}',
        //   `${description}`
        // ),
      };
    } else {
      emailTemplate = {
        subject: 'Contact Now',
        description: `${description}`
      };
    }

    const result = await sendEmail({
      to: existOrg?.contactEmail,
      subject: `${emailTemplate?.subject || 'Contact now'} | ${fullName}`,
      text: emailTemplate?.description,
      template: "contact_organization",
      extraProps: { user: { ...existUser, fullName, requestedBy: requestedBy }, organization: existOrg }
    });

    if (result?.success) {
      return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ success: true, message: "Request save successfully" });
    } else {
      return response.status(HttpResponseStatus.SERVER_ERROR).json({ success: false, message: 'Error while save request' });
    }

  } catch (err) {
    errorLog('Error while send mail:', err);
    next(err);
  }
});

export { organizationProfileRoutes }