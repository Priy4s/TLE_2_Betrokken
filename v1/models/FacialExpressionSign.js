import {Sequelize, DataTypes} from 'sequelize';
import Facial_expression from "./FacialExpression.js";
import Sign from "./Sign.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`
});

const FacialExpressionSign = sequelize.define(
    'FacialExpressionSign',
    {
        facial_expression_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Facial_expression,
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'image_path must be provided'
                },
                notEmpty: {
                    msg: 'image_path can not be empty'
                },
            }
        },
        sign_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Sign,
                key: 'id'
            },
            validate: {
                notNull: {
                    msg: 'image_path must be provided'
                },
                notEmpty: {
                    msg: 'image_path can not be empty'
                },
            }
        }
    },
    {
        tableName: 'facial_expression_sign',
        underscored: true
    },
);

export default FacialExpressionSign;