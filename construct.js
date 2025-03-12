import Sequelize from 'sequelize';
import fs from 'fs';
import Facial_expression from "./v1/models/Facial_expression.js";
import User from './v1/models/User.js';
import {v4 as uuidv4} from "uuid";
import Key from "./v1/models/Key.js";

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

    //Add standard facial expressions to database
    const facial_expressions = ['blij', 'boos', 'geen', 'vragend zonder mond', 'vragend met mond'];

    for (const facialExpression of facial_expressions) {

        //Prevent duplicate records by checking if one already exists
        const expressionRecord = await Facial_expression.findOne({
            where: {
                name: facialExpression,
                image_path: `${facialExpression.replace(/\s/g, '-')}.png`
            }
        })

        if (expressionRecord) {
            continue;
        }

        const facial_expression = Facial_expression.build({
            name: facialExpression,
            image_path: `${facialExpression.replace(/\s/g, '-')}.png`
        });

        await facial_expression.save();

    }


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

//Give the admin a semi-permanent key
if (user) {

    const apiKey = uuidv4();

    const key = await Key.create({
        api_keys: apiKey,
        expires_at: 8000000000000000,
        user_id: user.id
    });

    if (key) {
        console.log('key successfully generated for admin');
    } else {
        console.log('something went wrong when generating a key for the admin');
    }

}

if (created) {
    console.log('Successfully added Admin user');
} else if (user) {
    console.log('Admin user already exists');
} else {
    console.log('Admin user had not been created and does not exist');
}
