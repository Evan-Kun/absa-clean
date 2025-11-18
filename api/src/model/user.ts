import { DataTypes, Model, Sequelize } from 'sequelize';
import { Profile } from './profile';
import { WorkExperience } from './workExperience';
import { UserExperience } from './userExperience';
import { Education } from './education';
import { Expertise } from './expertise';
import { Organization } from './organization';
import { Role } from './role';
import { Certificate } from './certificate';

export class User extends Model {
    id!: string;
    role_id!: string;
    organization_id!: string;
    email!: string;
    password!: string;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    static initModel = (connection: Sequelize) => {
        User.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            role_id: { type: DataTypes.UUID, defaultValue: null },
            organization_id: { type: DataTypes.UUID, defaultValue: null },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            password: { type: DataTypes.STRING, allowNull: false },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, {
            sequelize: connection,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
        });
    }

    static addAssociation = () => {
        User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
        User.hasOne(WorkExperience, { foreignKey: 'userId', as: 'workExperience' });
        User.hasOne(UserExperience, { foreignKey: 'userId', as: 'userExperience' });
        User.hasOne(Education, { foreignKey: 'userId', as: 'education' });
        User.hasOne(Expertise, { foreignKey: 'userId', as: 'expertise' });
        User.hasOne(Certificate, { foreignKey: 'userId', as: 'certificate' });

        User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
        User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
    }
}
