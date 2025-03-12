import {Sequelize, DataTypes} from 'sequelize';
import User from "./User.js";

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
            allowNull: false
        },
        expires_at: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            references: {
                model: User,
                key: 'id'
            },
        }
    }, {
        tableName: 'keys'
    }
);

export default Key;