import { DataTypes, Model, Sequelize } from 'sequelize';
import { User } from './user';
import { Expertise } from './expertise';

export class Profile extends Model {
    static save(arg0: { profileImage: any; }): any {
        throw new Error('Method not implemented.');
    }
    id!: string;
    userId!: string;
    sysName!:string;
    firstName!: string;
    lastName!: string;
    jobTitle!: string;
    profileImage!: string;
    bio!: string;
    available!: string;
    preferredEnvironment!: string;
    mostAmazing!: string;
    x_url!: string;
    google_scholar!: string;
    facebook_url!: string;
    linkdin_url!: string;
    isActive!: boolean;
    isPublic!: boolean;

    static initModel = (connection: Sequelize) => {
        Profile.init({
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            userId: { type: DataTypes.UUID, allowNull: false },
            sysName: { type: DataTypes.STRING },
            firstName: { type: DataTypes.STRING },
            lastName: { type: DataTypes.STRING },
            slogan: { type: DataTypes.STRING },
            jobTitle: { type: DataTypes.STRING },
            profileImage: { type: DataTypes.STRING },
            bio: { type: DataTypes.STRING },
            available: { type: DataTypes.STRING },
            preferredEnvironment: { type: DataTypes.STRING },
            mostAmazing: { type: DataTypes.STRING },
            x_url: { type: DataTypes.STRING },
            google_scholar: { type: DataTypes.STRING },
            facebook_url: { type: DataTypes.STRING },
            linkdin_url: { type: DataTypes.STRING },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
            isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, {
            sequelize: connection,
            modelName: 'Profile',
            tableName: 'profiles',
            timestamps: true,
        });

    }

    static addAssociation = () => {
        Profile.belongsTo(User, { foreignKey: 'userId', as: "user" });
        Profile.hasOne(Expertise, { foreignKey: 'profile_id', as: "expertises" });
    }
}
