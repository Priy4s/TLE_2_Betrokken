import { Sequelize, DataTypes } from "sequelize";

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
        video_path: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'video_path must be provided'
                },
                notEmpty: {
                    msg: 'video_path cannot be empty'
                }
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
                    msg: 'definition cannot be empty'
                }
            }
        },
        model_path: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }
    , {
        tableName: 'sentences'
    }
);
export default Sentence;