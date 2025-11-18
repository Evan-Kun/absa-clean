import express, { NextFunction, Response, Request } from "express";
import { Page } from "../model/page";
import { HttpResponseStatus } from "../lib/utitlity";
import { errorLog } from "../helper/logger";
import { checkAuthorization } from "../middleware/authmiddleware";
import { Op } from "sequelize";

const pageRoutes = express.Router();

pageRoutes.post('/create', checkAuthorization(["superadmin"]), async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
        const objBody = request.body;
        if (!objBody?.pageName && typeof objBody?.isActive == 'undefined') { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }
        if (objBody?.id) {

            const existPageName = await Page.count({ where: { pageName: objBody?.pageName, id: { [Op.ne]: objBody?.id } } });
            if (existPageName > 0) {
                return response.status(HttpResponseStatus.CONFLICT_DATA).send({ data: { message: 'Page already exists.' } });
            }

            const objtoUpdate = {};
            if (typeof objBody?.title != 'undefined') { objtoUpdate["title"] = objBody?.title; }
            if (typeof objBody?.pageName != 'undefined') { objtoUpdate["pageName"] = objBody?.pageName; }
            if (typeof objBody?.description != 'undefined') { objtoUpdate["description"] = objBody?.description; }
            if (typeof objBody?.isActive != 'undefined') { objtoUpdate["isActive"] = objBody?.isActive; }

            const [affectedRows] = await Page.update(objtoUpdate, { where: { id: objBody?.id } }).catch((error) => { throw (error) });
            if (affectedRows === 0) { return response.status(HttpResponseStatus.SERVER_ERROR).json({ data: { message: "Page not updated" } }) }
            return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: "Page updated successfully." } })

        }
        else {

            const resPageName = await Page.count({ where: { pageName: objBody?.pageName } });
            if (resPageName === 0) {
                const createPage = await Page.create(objBody).catch((err) => { throw err });

                return response.status(HttpResponseStatus.SERVER_SUCCESS).json({
                    message: "Page created successfully",
                    data: createPage
                });
            }
            else {
                return response.status(HttpResponseStatus.CONFLICT_DATA).send({ data: { message: 'Page already exists.' } });
            }
        }
       
    }
    catch (err) {
        errorLog('Error Create Page Data:', err);
        next(err);
    }
});

pageRoutes.get('/:pageName', async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
        const pageName = request?.params?.pageName;
        const { page, limit } = request.query;
        const itemsPerPage: any = limit || 10;
        const currentPage: any = page || 1;
        const offset = (currentPage - 1) * itemsPerPage;
        let filter = { pageName }
        let pagination: any, resPages: any;

        if (pageName === 'all') {
            const { count: totalItems, rows } = await Page.findAndCountAll({
                limit: itemsPerPage,
                offset,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                order: [['createdAt', 'ASC']],
            });

            resPages = rows;
            pagination = {
                itemsPerPage,
                currentPage,
                totalItems,
                totalPages: Math.ceil(totalItems / itemsPerPage),
            };
        }
        else if (pageName === 'activePages') {
            resPages = await Page.findAll({ where: { isActive: true } });
        }

        else {
            resPages = await Page.findOne({
                where: filter,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
            });

            if (!resPages) {
                return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Page not found.' } });
            }

            if (!resPages?.isActive) {
                return response.status(HttpResponseStatus.NOT_FOUND).json({ data: { message: 'Inactive Page.' } });
            }
        }
        response.status(HttpResponseStatus.SERVER_SUCCESS).json({
            message: 'Page details fetched successfully',
            data: resPages,
            ...(pagination && { pagination }),
        });
    }
    catch (err) {
        errorLog('Error Fetching Page Data:', err);
        next(err);
    }
});

pageRoutes.delete('/delete/:id', checkAuthorization(["superadmin"]), async (request: Request, response: Response, next: NextFunction): Promise<any> => {
    try {
        const id = request?.params?.id;
        if (!id) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

        const resDeletePage = await Page.destroy({ where: { id: id } });
        if (resDeletePage) {
            return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: 'Page deleted successfully.' } })
        }
    }
    catch (err) {
        errorLog('Error Delete Page Data:', err);
        next(err);
    }
})

export { pageRoutes }