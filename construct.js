import Sequelize from 'sequelize';
import fs from 'fs';

const sql_file_content = fs.readFileSync('./database_frame.sql', 'utf8');

const queries = sql_file_content.split(';');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage.sqlite'
});

try {

    for (const query of queries) {
        await sequelize.query(query);
    }

    console.log('Successfully constructed the database')

} catch (error) {
    console.log(error.message)
}
