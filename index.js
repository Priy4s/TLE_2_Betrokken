import express from 'express';
import Sequelize, {Op} from 'sequelize';
import signsV1 from './v1/routes/signs.js';
import db from './database.js'
import Key from "./v1/models/Key.js";

;
import keysV1 from './v1/routes/keys.js';

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
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');

    next();

});

//API Key router
app.use('/v1/keys', keysV1);

//API key authenticator middeware
app.use(async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        console.log(apiKey);
        //Checks if there is an API key. If not, error
        if (!apiKey) {
            return res.status(403).json({error: 'API Key vereist'});
        }

        const key = await Key.findOne({
            where: {
                api_keys: apiKey,
                expires_at: Date.now()
            }
        });
        if (!key) {
            return res.status(403).json({error: 'Key is ongeldig'});
        }
        next();
    } catch {
        return res.status(500).json({error: 'Database fout'})
    }

});


//Routes
app.use('/v1/signs', signsV1);


// Cronjob/Timer that deletes invalid keys.
setInterval(async () => {
    try {
        await Key.destroy({
            where: {
                expires_at: {
                    [Op.lte]: Date.now()
                }
            }
        });
        console.log('Key succesvol verwijderd')
    } catch {
        console.log('Fout bij verwijderen van key');
    }
}, 5 * 60 * 1000);

//Print the port to the console so we know when it's actually running
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is now listening on port ${process.env.EXPRESS_PORT}`);
});