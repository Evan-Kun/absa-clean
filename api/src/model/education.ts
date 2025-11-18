import { DataTypes, Model, Sequelize } from 'sequelize';

export class Education extends Model {
    id!: string;
    userId!: string;
    profile_id!: string;
    degreeName!: string;
    instituteName!: string;
    location!: string;
    startYear!: string;
    endYear!: string;
    order_index!: Number;


    static initModel = (connection: Sequelize) => {
        Education.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            profile_id: { type: DataTypes.UUID, allowNull: false },
            degreeName: { type: DataTypes.STRING },
            instituteName: { type: DataTypes.STRING },
            location: { type: DataTypes.STRING },
            startYear: { type: DataTypes.STRING },
            endYear: { type: DataTypes.STRING },
            order_index: { type: DataTypes.INTEGER }
        }, {
            sequelize: connection,
            modelName: 'Education',
            tableName: 'educations',
            timestamps: true,
        });

    }
}
