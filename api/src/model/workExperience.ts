import { DataTypes, Model, Sequelize } from 'sequelize';

export class WorkExperience extends Model {
    id!: string;
    userId!: string;
    profile_id!: string;
    jobTitle!: string;
    companyName!: string;
    joiningMonth!: string;
    joiningYear!: string;
    isCurrentlyWorking!: boolean;
    toMonth!: string;
    toYear!: string;
    description!: string[];
    order_index!: Number;

    static initModel = (connection: Sequelize) => {
        WorkExperience.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            profile_id: { type: DataTypes.UUID, allowNull: false },
            jobTitle: { type: DataTypes.STRING },
            companyName: { type: DataTypes.STRING },
            joiningMonth: { type: DataTypes.STRING },
            joiningYear: { type: DataTypes.STRING },
            isCurrentlyWorking: { type: DataTypes.BOOLEAN, defaultValue: false },
            toMonth: { type: DataTypes.STRING },
            toYear: { type: DataTypes.STRING },
            description: { type: DataTypes.ARRAY(DataTypes.STRING) },
            order_index: { type: DataTypes.INTEGER }
        }, {
            sequelize: connection,
            modelName: 'WorkExperience',
            tableName: 'workExperiences',
            timestamps: true,
        });

    }
}
