import {Sequelize, DataTypes} from 'sequelize';
import User from "./User.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`
});

const SsoToken = sequelize.define(
    'SsoToken',
    {
        token: {
            type: DataTypes.STRING,
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
        tableName: 'sso_tokens',
        underscored: true
    }
);

export default SsoToken;