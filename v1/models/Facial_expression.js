import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
});

const FacialExpression = sequelize.define(
    'FacialExpression',
    {
        image_path: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'image_path must be provided'
                },
                notEmpty: {
                    msg: 'image_path can not be empty'
                },
            }
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'name must be provided'
                },
                notEmpty: {
                    msg: 'name can not be empty'
                },
            }
        }
    },
    {
        tableName: 'facial_expressions'
    },
);

export default FacialExpression;