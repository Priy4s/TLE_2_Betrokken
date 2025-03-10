import express from 'express';
import Sequelize from 'sequelize';
import signsV1 from  './v1/routes/signs.js';
import db from './database.js'
import { v4 as uuidv4 } from 'uuid';

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


//API key authenticator middeware
app.use( (req,res,next) => {
    const apiKey = req.headers['x-api-key']
    console.log(apiKey)
    //Checks if there is an API key. If not, error
    if (!apiKey) {
        return res.status(403).json({ error: 'API Key vereist' });
    }

    //DB query that checks time and current api key
  db.get(`SELECT * FROM keys WHERE api_keys = ? AND expires_at > ?`, [apiKey, Date.now()], (err, row) => {
       //Query error
        if(err) {
             return res.status(500).json({error: 'Database fout'})
        }

        //If api key doesn't exist, or isn't valid
        if(!row) {
            return  res.status(403).json({error: 'Ongeldige of verlopen API key'})
        }
        next();
    })
});


//Routes
app.use('/v1/signs', signsV1);


// Cronjob/Timer that deletes invalid keys.
setInterval(() => {
    db.run('DELETE FROM keys WHERE expires_at < ?', [Date.now()], (err) => {
        if (err) {
            console.log('Fout bij verwijderen van key', err.message);
        } else {
            console.log('Key succesvol verwijderd');
        }
    })
}, 5 * 60 * 1000)

//Print the port to the console so we know when it's actually running
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is now listening on port ${process.env.EXPRESS_PORT}`);
});