import {Sequelize, DataTypes} from 'sequelize';

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
            allowNull: false
        }
    }, {
        tableName: 'keys'
    }
);

export default Key;