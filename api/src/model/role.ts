import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
    id!: string;
    roleName!: string;

    static initModel = (connection: Sequelize) => {
        Role.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            roleName: { type: DataTypes.STRING, allowNull: false }
        }, {
            sequelize: connection,
            modelName: 'Role',
            tableName: 'roles',
            timestamps: true,
        });
    }
}
