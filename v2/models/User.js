import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`
});

const User = sequelize.define(
    'User',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'name must be provided'
                },
                notEmpty: {
                    msg: 'name can not be empty'
                },
            }
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'code already in use'
            },
            validate: {
                notNull: {
                    msg: 'code must be provided'
                },
                notEmpty: {
                    msg: 'code can not be empty'
                },

            }
        },
        role: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'role must be provided'
                },
                notEmpty: {
                    msg: 'role can not be empty'
                },
                isIn: [[1, 42]]
            }
        }
    },
    {
        tableName: 'users',
        underscored: true
    },
);

export default User;