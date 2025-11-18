import { DataTypes, Model, Sequelize } from "sequelize";

export class Page extends Model {

    id!: string;
    title!: string;
    description!: Text;
    pageName!: string;
    isActive!: boolean;

    static initModel = (connection: Sequelize) => {
        Page.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            title: { type: DataTypes.STRING },
            description: { type: DataTypes.TEXT },
            pageName: { type: DataTypes.STRING },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, {
            sequelize: connection,
            modelName: 'Page',
            tableName: 'pages',
            timestamps: true,
        });
    }
}