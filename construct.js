import Sequelize from 'sequelize';
import fs from 'fs';
import Facial_expression from "./v1/models/Facial_expression.js";

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

    //Add standard facial expressions to database
    const facial_expressions = ['blij', 'boos', 'geen', 'vragend zonder mond', 'vragend met mond'];

    for (const facialExpression of facial_expressions) {

        const facial_expression = Facial_expression.build({
            name: facialExpression,
            image_path: `${facialExpression.replace(/\s/g, '-')}.png`
        });

        await facial_expression.save();

    }


} catch (error) {
    console.log(error.message)
}
