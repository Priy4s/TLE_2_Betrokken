import Sequelize from 'sequelize';
import fs from 'fs';
import FacialExpression from "./v1/models/FacialExpression.js";
import User from './v1/models/User.js';
import Key from "./v1/models/Key.js";
import Sign from "./v1/models/Sign.js";
import FacialExpressionSign from "./v1/models/FacialExpressionSign.js";
import SsoToken from "./v2/models/SsoToken.js";

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

//Sync some tables for fun
try {

    await User.sync({force: true});
    await Sign.sync({force: true});
    await Key.sync({force: true});
    await FacialExpression.sync({force: true});
    await FacialExpressionSign.sync({force: true});
    await SsoToken.sync({force:true});

    console.log('Successfully synced stuff')

} catch (error) {
    console.log({error: error.message});
}

