import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
});

const User = sequelize.define(
    'User',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        student_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        preference_id: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        tableName: 'users'
    },
);

export default User;