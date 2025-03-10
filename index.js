import express from 'express';
import Sequelize from 'sequelize';
import signsV1 from  './v1/routes/signs.js';
import expressionsV1 from "./v1/routes/facial_expressions.js";
import Sign from "./v1/models/Sign.js";
import FacialExpression from "./v1/models/Facial_expression.js";
import Facial_expression_sign from "./v1/models/Facial_expression_sign.js";

const app = express();
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage.sqlite'
});

//Validate the database connection
try {
    await sequelize.authenticate();
    console.log('Connection with sqlite database has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

//Make sure the webservice knows what it can receive
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Global middleware
//Make sure the client is informed this webservice only sends JSON
app.use((req, res, next) => {

    //If the client did not specify it accepts JSON, send an error unless they only ask for options
    if (!req.headers.accept?.includes('application/json') && req.method !== 'OPTIONS') {

        res.status(406);
        return res.json({error: 'This webservice only responds with JSON. Please specify if you will accept this format.'})

    }

    //Otherwise just continue
    next();

});

//Add CORS headers to all responses
app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');

    next();

});

//Add relations to models
FacialExpression.belongsToMany(Sign, {through: Facial_expression_sign});
Sign.belongsToMany(FacialExpression, {through: Facial_expression_sign});


//Routes
app.use('/v1/signs', signsV1);
app.use('/v1/expressions', expressionsV1);


//Print the port to the console so we know when it's actually running
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is now listening on port ${process.env.EXPRESS_PORT}`);
});