import express, { NextFunction, request, Request, Response } from 'express';
import { errorLog } from '../helper/logger';
import { AuthenticatedRequest, checkAuthorization } from '../middleware/authmiddleware';
const { Op } = require('sequelize');
import { HttpResponseStatus } from '../lib/utitlity';
import { SkillMaster } from '../model/master';
import { Expertise } from '../model/expertise';
import { sequelizeConnection } from '../lib/dbconnection';

const masterRoutes = express.Router();

masterRoutes.get('/list/skills', async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { viewCount = false } = request.query;
    let resMaster = await SkillMaster.findAll({
      attributes: ['id', 'name']
    })?.catch((err) => { throw err });

    if (viewCount) {
      const allTagsData = await Expertise.findAll({ attributes: ['tags'] });
      const userTags = allTagsData?.map((t) => t?.tags)?.flat();

      // Step 1: Count all skill names used in tags
      const tagSkillCounts = {};
      for (const tag of userTags) {
        const skillName = tag?.skillName;
        if (skillName) { tagSkillCounts[skillName] = (tagSkillCounts[skillName] || 0) + 1; }
      }

      // Step 2: Map result to include count
      resMaster = resMaster?.map(skill => ({
        ...skill?.dataValues,
        count: tagSkillCounts[skill?.name] || 0
      }));
      resMaster = resMaster?.sort((a: any, b: any) => b?.count - a?.count);
    }
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: resMaster || [] })
  } catch (err) {
    console.error('Error /list/skills:', err);
    return next(err);
  }
});

masterRoutes.put('/create/skills', checkAuthorization(), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { name } = request.body;
    if (!name) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    const [resCreate, isCreated] = await SkillMaster.findOrCreate({ where: { name: name }, defaults: { name: name } }).catch((error) => { throw (error) });
    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { message: 'Skill added successfully!', ...resCreate?.toJSON() } })
  } catch (err) {
    console.error('Error /create/skills:', err);
    return next(err);
  }
});

masterRoutes.put('/bulkupdate/skills', checkAuthorization(["superadmin"]), async (request: AuthenticatedRequest, response: Response, next: NextFunction): Promise<any> => {
  try {
    const { action } = request.body;
    if (action?.update?.length == 0 && action?.delete?.length == 0) { return response.status(HttpResponseStatus.MISSING_PARAMS).send({ data: { message: 'Please pass required parameters' } }); }

    // DELETE SKILL IN SKILL MASTER TABLE
    if (action?.delete?.length > 0) {
      const deleteIds = action?.delete?.map(item => item?.id);
      await SkillMaster.destroy({ where: { id: deleteIds } }).catch((error) => { throw (error) });
    }

    // UPDATE
    if (action?.update?.length > 0) {
      const updatesToRun = [];

      for (const item of action.update) {
        // Find existing skill name case-insensitively
        const existingSkill = await SkillMaster.findOne({
          where: sequelizeConnection.where(
            sequelizeConnection.fn('LOWER', sequelizeConnection.col('name')),
            item.new.toLowerCase()
          )
        }).catch((error) => { throw error });

        if (existingSkill) {
          // Use existing name casing
          const existingName = existingSkill?.name;
          // Delete the old skill (case doesn't matter here, ID is unique)
          await SkillMaster.destroy({ where: { id: item.id } }).catch((error) => { throw error });
          // Track this for expertise update
          updatesToRun.push({ old: item.old, newName: existingName });
        } else {
          // No conflict — rename in SkillMaster
          await SkillMaster.update({ name: item.new }, { where: { id: item.id } }).catch((error) => { throw error });
          updatesToRun.push({ old: item.old, newName: item.new });
        }
      }

      // UPDATE expertises
      for (const { old, newName } of updatesToRun) {
        const updateQuery = `
            UPDATE "expertises"
            SET tags = (
              SELECT jsonb_agg(tag) FROM (
                SELECT 
                  CASE
                    WHEN tag->>'skillName' = :old AND NOT EXISTS (
                      SELECT 1 FROM jsonb_array_elements(tags) AS t
                      WHERE LOWER(t->>'skillName') = LOWER(:newName)
                    ) THEN jsonb_set(tag, '{skillName}', to_jsonb(:newName::text))
                    ELSE tag
                  END AS tag
                FROM jsonb_array_elements(tags) AS tag
                WHERE tag->>'skillName' != :old OR NOT EXISTS (
                  SELECT 1 FROM jsonb_array_elements(tags) AS t
                  WHERE LOWER(t->>'skillName') = LOWER(:newName)
                )
              ) AS cleaned
            )
            WHERE EXISTS (
              SELECT 1 FROM jsonb_array_elements(tags) AS tag
              WHERE tag->>'skillName' = :old
            );
          `;

        await sequelizeConnection.query(updateQuery, {
          replacements: { old, newName },
          type: sequelizeConnection.QueryTypes.UPDATE
        }).catch((error) => { throw error });
      }
    }

    return response.status(HttpResponseStatus.SERVER_SUCCESS).json({ data: { log: action, message: 'Action update successfully!' } })
  } catch (err) {
    console.error('Error /bulkupdate/skills:', err);
    return next(err);
  }
});

export { masterRoutes }


