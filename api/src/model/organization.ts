import { DataTypes, Model, Sequelize } from 'sequelize';
import { User } from './user';

export class Organization extends Model {
    id!: string;
    organizationName!: string;
    sysName!: string;
    logo!: string;
    description!: string;
    contactEmail!:string;
    emailTemplate!:any;

    static initModel = (connection: Sequelize) => {
        Organization.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            organizationName: { type: DataTypes.STRING, allowNull: false },
            sysName: { type: DataTypes.STRING, allowNull: false },
            logo: { type: DataTypes.STRING },
            description: { type: DataTypes.STRING },
            contactEmail: { type: DataTypes.STRING },
            emailTemplate: { type: DataTypes.JSONB }
        }, {
            sequelize: connection,
            modelName: 'Organization',
            tableName: 'organizations',
            timestamps: true,
        });

    }
}
