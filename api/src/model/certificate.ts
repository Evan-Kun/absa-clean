import { DataTypes, Model, Sequelize } from 'sequelize';

export class Certificate extends Model {
    id!: string;
    userId!: string;
    profile_id!: string;
    title !: string;
    url!: string;
    issuedYear!: string;
    expiredOn !: string;
    order_index!: Number;

    static initModel = (connection: Sequelize) => {
        Certificate.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            profile_id: { type: DataTypes.UUID, allowNull: false },
            title: { type: DataTypes.STRING },
            url: { type: DataTypes.STRING },
            issuedYear: { type: DataTypes.STRING },
            expiredOn: { type: DataTypes.STRING },
            order_index: { type: DataTypes.INTEGER }

        }, {
            sequelize: connection,
            modelName: 'Certificate',
            tableName: 'certificates',
            timestamps: true,
        })
    }
}