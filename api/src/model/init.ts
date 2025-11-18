import { Sequelize } from "sequelize"
import { createDefaultSuperAdmin } from "../controllers/auth-controller"
import { User } from "./user"
import { Profile } from "./profile";
import { WorkExperience } from "./workExperience";
import { UserExperience } from "./userExperience";
import { Education } from "./education";
import { Expertise } from "./expertise";
import { Role } from "./role";
import { Organization } from "./organization";
import { Page } from "./page";
import { SkillMaster } from "./master";
import { Certificate } from "./certificate";

export const initAllModels = async (connection: Sequelize) => {
    User.initModel(connection);
    Organization.initModel(connection);
    Profile.initModel(connection);
    Expertise.initModel(connection);
    WorkExperience.initModel(connection);
    UserExperience.initModel(connection);
    Education.initModel(connection);
    Role.initModel(connection);
    Page.initModel(connection);
    SkillMaster.initModel(connection);
    Certificate.initModel(connection);

    User.addAssociation();
    Profile.addAssociation();
    Expertise.addAssociation();

    //migration
    await connection.sync({
        force: false, //change table defination and clear all data
        // alter: true // change table defination without data drop
    });
    await createDefaultSuperAdmin()
}