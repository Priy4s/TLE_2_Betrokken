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
            validate: {
                notNull: {
                    msg: 'video_path must be provided'
                },
                notEmpty: {
                    msg: 'video_path can not be empty'
                },
            }
        },
        definition: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'definition must be provided'
                },
                notEmpty: {
                    msg: 'definition can not be empty'
                },
            }
        },
        model_path: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lesson: {
            type: DataTypes.TINYINT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'lesson must be provided'
                },
                notEmpty: {
                    msg: 'lesson can not be empty'
                },
                isInt: {
                    msg: 'lesson value must be an integer number'
                },
                max: {
                    args: 255,
                    msg: 'lesson value can not be greater than 255'
                },
                min: {
                    args: 1,
                    msg: 'lesson value can not be less than 1'
                }
            }
        },
        theme: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'theme must be provided'
                },
                notEmpty: {
                    msg: 'theme can not be empty'
                },
            }
        },
    },
    {
        tableName: 'signs'
    },
);

export default Sign;