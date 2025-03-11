import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
});

const Sign = sequelize.define(
    'Sign',
    {
        video_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        definition: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        model_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lesson: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        theme: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'signs'
    },
);

export default Sign;