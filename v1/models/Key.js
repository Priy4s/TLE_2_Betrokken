import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
});

const Key = sequelize.define(
    'Key',
    {
        api_keys: {
            type: DataTypes.TEXT,
            alllowNull: false
        },
        experis_at: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);

export default Key;