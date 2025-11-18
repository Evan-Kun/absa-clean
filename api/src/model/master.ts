import { DataTypes, Model, Sequelize } from "sequelize";

export class SkillMaster extends Model {
    id!: string;
    name!: string;
    static initModel = (connection: Sequelize) => {
        SkillMaster.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
        }, {
            sequelize: connection,
            modelName: 'skillMasters',
            tableName: 'skillMasters',
            timestamps: true,
        });
    }
}