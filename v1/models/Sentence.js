import { Sequelize, DataTypes } from "sequelize";
import Sign from "./Sign.js";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
})

const Sentence = sequelize.define(
    'Sentence',
    {
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'sentence must be provided'
                },
                notEmpty: {
                    msg: 'sentence can not be empty'
                },
            }
        }
    }
    , {
        tableName: 'sentences'
    }
);
export default Sentence;