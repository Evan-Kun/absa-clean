import { DataTypes, Model, Sequelize } from 'sequelize';

export class UserExperience extends Model {
    id!: string;
    userId!: string;
    profile_id!: string;
    title!: string;
    link!: string;
    description!: string;
    order_index!: Number;


    static initModel = (connection: Sequelize) => {
        UserExperience.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            profile_id: { type: DataTypes.UUID, allowNull: false },
            title: { type: DataTypes.STRING },
            link: { type: DataTypes.STRING },
            description: { type: DataTypes.STRING },
            order_index: { type: DataTypes.INTEGER }
        }, {
            sequelize: connection,
            modelName: 'UserExperience',
            tableName: 'userExperiences',
            timestamps: true,
        });

    }
}
