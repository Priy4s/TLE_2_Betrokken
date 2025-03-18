import express from 'express';
import Sequelize, {Op} from 'sequelize';

//v1
import signsV1 from './v1/routes/signs.js';
import sentencesV1 from './v1/routes/sentences.js';
import KeyV1 from "./v1/models/Key.js";
import aiV1 from './v1/routes/ai.js';
import keysV1 from './v1/routes/keys.js';
import loginV1 from './v1/routes/login.js';
import registerV1 from './v1/routes/register.js';
import expressionsV1 from "./v1/routes/facialExpressions.js";
import SignV1 from "./v1/models/Sign.js";
import FacialExpressionV1 from "./v1/models/FacialExpression.js";
import FacialExpressionSignV1 from "./v1/models/FacialExpressionSign.js";
import profilesV1 from './v1/routes/profiles.js';
import UserV1 from "./v1/models/User.js";
import SentenceV1 from "./v1/models/Sentence.js";

//v2
import signsV2 from './v2/routes/signs.js';
import KeyV2 from "./v2/models/Key.js";
import aiV2 from './v2/routes/ai.js';
import keysV2 from './v2/routes/keys.js';
import loginV2 from './v2/routes/login.js';
import registerV2 from './v2/routes/register.js';
import expressionsV2 from "./v2/routes/facialExpressions.js";
import profilesV2 from './v2/routes/profiles.js';
import SignV2 from "./v2/models/Sign.js";
import FacialExpressionV2 from "./v2/models/FacialExpression.js";
import FacialExpressionSignV2 from "./v2/models/FacialExpressionSign.js";
import UserV2 from "./v2/models/User.js";


import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import log from "./logger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

app.use('/videos', express.static(__dirname + '/videos'));
app.use('/images', express.static(__dirname + '/images'));

//Make sure the webservice knows what it can receive
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, x-api-key');

    next();

});

//Authenticate JWT
app.use((req, res, next) => {

    //Skip authentication if using OPTIONS method
    if (req.method === 'OPTIONS') {
        return next();
    }

    //Skip authenticating if trying to log in
    let skip = false;

    switch (req.path) {
        case '/v1/login':
            skip = true;
            break;

        case '/v2/login':
            skip = true;
            break;
    }

    if (skip) {
        return next();
    }

    //Make sure the request contains a JWT
    const auth = req.header('authorization');

    if (!auth) {
        res.status(400);
        return res.json({error: 'No JWT token received. Use the authorization header and bearer schema'});
    }

    if (!auth.startsWith('Bearer ')) {
        res.status(400);
        return res.json({error: 'Authorization header does not start with Bearer, please use the Bearer schema'});
    }

    //Verify the JWT
    const postedJWT = auth.slice(7);
    try {

        jwt.verify(postedJWT, process.env.TOKEN_SECRET);

        next();

    } catch (error) {

        res.status(403);
        return res.json({error: `JWT error: ${error.message}`})

    }

});

//Block certain routes if the user is not an admin
app.use((req, res, next) => {

    //Users should always be able to GET or see OPTIONS
    if (req.method === 'GET' || req.method === 'OPTIONS') {
        return next();
    }

    //Users should have full access to certain routes
    let allowAccess = false;

    switch (req.path) {
        case '/v1/login':
            allowAccess = true;
            break;
        case '/v2/login':
            allowAccess = true;
            break;
        case req.path.startsWith('/v1/profiles') ? req.path : false:
            allowAccess = true;
            break;
        case req.path.startsWith('/v2/profiles') ? req.path : false:
            allowAccess = true;
            break;
    }

    if (allowAccess) {
        return next();
    }

    //Only allow admins to use all other routes
    const postedJwt = req.header('authorization').slice(7);
    const decodedJwt = jwt.verify(postedJwt, process.env.TOKEN_SECRET);

    if (decodedJwt.role !== 42) {

        res.status(403);
        return res.json({error: 'User does not have permission to use this route'})
    }

    next();

});

//Error handler
function errorHandler (err, req, res, next) {
    console.error(err.stack);
    res.status(500);

    //Save the request to a log file
    log(req, res, err);

    return res.json({error: 'Internal server error'});
}

//Add relations to models
FacialExpressionV1.belongsToMany(SignV1, {through: FacialExpressionSignV1});
SignV1.belongsToMany(FacialExpressionV1, {through: FacialExpressionSignV1});
UserV1.hasMany(KeyV1, {foreignKey: 'user_id'});
KeyV1.belongsTo(UserV1, {foreignKey: 'user_id'});

//V2
FacialExpressionV2.belongsToMany(SignV2, {through: FacialExpressionSignV2});
SignV2.belongsToMany(FacialExpressionV2, {through: FacialExpressionSignV2});
UserV2.hasMany(KeyV2, {foreignKey: 'user_id'});
KeyV1.belongsTo(UserV2, {foreignKey: 'user_id'});


SentenceV1.belongsToMany(SignV1, {
    through: 'sentence_sign',
    foreignKey: 'sentence_id',
    otherKey: 'sign_id',
    as: 'signs'
});
SignV1.belongsToMany(SentenceV1, {
    through: 'sentence_sign',
    foreignKey: 'sign_id',
    otherKey: 'sentence_id',
    as: 'sentences'
});


//Routes v1
app.use('/v1/signs', signsV1);
app.use('/v1/sentences', sentencesV1);
app.use('/v1/login', loginV1);
app.use('/v1/register', registerV1);
app.use('/v1/keys', keysV1);
app.use('/v1/ai', aiV1);
app.use('/v1/expressions', expressionsV1);
app.use('/v1/profiles', profilesV1);

//Routes v2
app.use('/v2/signs', signsV2);
app.use('/v2/login', loginV2);
app.use('/v2/register', registerV2);
app.use('/v2/keys', keysV2);
app.use('/v2/ai', aiV2);
app.use('/v2/expressions', expressionsV2);
app.use('/v2/profiles', profilesV2);

//Register the error handler last, otherwise it won't work
app.use(errorHandler);

// Cronjob/Timer that deletes invalid keys.
setInterval(async () => {

    try {

        await KeyV1.destroy({
            where: {
                expires_at: {
                    [Op.lte]: Date.now()
                }
            }
        });

        console.log('Key successfully deleted');

    } catch {
        console.log('Error occurred when removing a key');
    }

}, 60 * 60 * 1000);

//Print the port to the console so we know when it's actually running
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is now listening on port ${process.env.EXPRESS_PORT}`);
});