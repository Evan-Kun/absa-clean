import express, { NextFunction, Request, Response } from 'express';
import { errorLog } from '../helper/logger';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { HttpResponseStatus } from '../lib/utitlity';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
import sharp from 'sharp';

const fileRoutes = express.Router();
fileRoutes.post('/upload/:type?', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
    try {
        const filename = request.query.filename || request?.user?.id;
        const resize = request.query.resize !== 'false';
        const uploadDir = path.join(__dirname, `../public/${request.params.type || "common"}/`);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = new IncomingForm({ uploadDir: uploadDir, multiples: false, keepExtensions: true });
        form.parse(request, async (err, fields, files) => {

            if (err) {
                errorLog('Error parsing form:', err);
                return response.status(HttpResponseStatus.MISSING_PARAMS).json({
                    data: { message: err }
                })
            }

            const file: any = files.file; // Assuming 'file' is the field name in the form
            if (!file || file?.length == 0) {
                errorLog('No file to upload');
                return response.status(HttpResponseStatus.MISSING_PARAMS).json({
                    data: { message: "No file found to upload." }
                })
            }

            const fileInstance = file[0];
            // const fileExtension = '.png';
            // const fileName = `${filename?.replace(/-/g, "_")}${fileExtension}`;
            const originalExtension = path.extname(fileInstance.originalFilename).toLowerCase();
            const fileName: any = request.query.filename ? request.query.filename : `${filename?.replace(/-/g, "_")}${originalExtension}`;

            const newPath = path.join(uploadDir, fileName);

            try {
                if (resize) {
                    await sharp(fileInstance.filepath)
                        .resize(400, 400)
                        .jpeg({ quality: 80 })
                        .toFile(newPath);
                    fs.unlinkSync(fileInstance.filepath);
                } else {
                    fs.renameSync(fileInstance.filepath, newPath);
                }
                return response.status(HttpResponseStatus.SERVER_SUCCESS).json({
                    data: {
                        file: `/public/${request?.params?.type || "common"}/${fileName}`
                    }
                });
            } catch (compressionErr) {
                errorLog('Error compressing file:', compressionErr?.message);
                return response.status(HttpResponseStatus.SERVER_ERROR).json({
                    data: { message: "Error compressing file." }
                });
            }

            // Rename file to original filename
            // fs.rename(fileInstance.filepath, newPath, (err) => {
            //     if (err) {
            //         errorLog('Error renaming file:', err?.message);
            //         return response.status(HttpResponseStatus.SERVER_ERROR).json({
            //             data: { message: err?.message }
            //         })
            //     }
            //     return response.status(HttpResponseStatus.SERVER_SUCCESS).json({
            //         data: {
            //             file: `/public/${request.params.type || "common"}/${fileName}`
            //         }
            //     })
            // });
        });

    } catch (err) {
        errorLog('Error File Upload:', err);
        next(err);
    }
});
export = fileRoutes;