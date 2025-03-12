import {Sequelize, DataTypes} from 'sequelize';
import Facial_expression from "./Facial_expression.js";
import Sign from "./Sign.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
});

const FacialExpressionSign = sequelize.define(
    'FacialExpressionSign',
    {
        FacialExpressionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'facial_expression_id',
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
        SignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sign_id',
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
        tableName: 'facial_expression_sign'
    },
);

export default FacialExpressionSign;