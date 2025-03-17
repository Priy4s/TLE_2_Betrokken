import {Sequelize, DataTypes} from 'sequelize';
import User from "./User.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`
});

const Key = sequelize.define(
    'Key',
    {
        expires_at: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
        }
    },
    {
        tableName: 'keys',
        underscored: true
    }
);

export default Key;