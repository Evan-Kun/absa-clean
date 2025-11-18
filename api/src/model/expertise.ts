import { DataTypes, Model, Sequelize } from 'sequelize';
import { Profile } from './profile';

export class Expertise extends Model {
    id!: string;
    userId!: string;
    profile_id!: string;
    tags!: any;

    static initModel = (connection: Sequelize) => {
        Expertise.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            profile_id: { type: DataTypes.UUID, allowNull: false },
            tags: { type: DataTypes.JSONB }
        }, {
            sequelize: connection,
            modelName: 'Expertise',
            tableName: 'expertises',
            timestamps: true,
        });
    }

    static addAssociation = () => {
        Expertise.belongsTo(Profile, { foreignKey: 'profile_id', targetKey: 'id', as: "profile" });
    }
}
