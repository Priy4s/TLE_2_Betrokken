import Sequelize from 'sequelize';
import fs from 'fs';
import User from './v1/models/User.js';

const sql_file_content = fs.readFileSync('./database_frame.sql', 'utf8');

const queries = sql_file_content.split(';');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage.sqlite'
});

try {

    for (const query of queries) {

        try {

        await sequelize.query(query);

        } catch (error) {
            console.log(error.message)
        }

    }

    console.log('Successfully constructed the database')

} catch (error) {
    console.log(error.message)
}

const [user, created] = await User.findOrCreate({
    where: { code: 'Administrator'},
    defaults: {
        code: 'Administrator',
        name: 'Admin',
        role: 42,
    },
});

if (created) {
    console.log('Successfully added Admin user')
} else if (user) {
    console.log('Admin user already exists')
} else {
    console.log('Admin user had not been created and does not exist')
}
