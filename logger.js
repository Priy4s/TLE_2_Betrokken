import fs from "fs";

//Log requests caught by the global error handler so we can store them in a file
function log(req, res, err) {

    //Make sure the req and res and err parameters were sent
    if (!req || !res || !err) {
        console.error('Missing req, res and/or err parameter in log function');
        return false;
    }

    //Check if a log already exists for today
    const timestamp = formatISOString(new Date(Date.now()).toISOString());

    const date = timestamp.split("_")[0];
    const time = timestamp.split("_")[1];

    const path = `./logs/${date}.json`;

    //If it doesn't, make one
    if (!fs.existsSync(path)) {
        try {

            fs.writeFileSync(path, '[]');

        } catch (error) {

            //If something went wrong with creating the file, just log the error
            return console.log(error.message);

        }
    }

    let jsonLog = false;

    //Access the file and turn it into a JSON object so we can use it easier
    try {

        const plainLog = fs.readFileSync(path, {encoding: 'utf8', flag: 'r'});

        jsonLog = JSON.parse(plainLog);

    } catch(error) {

        return console.error(error.message);

    }

    //Start filling in a new log entry
    let newEntry = {
        time: time,
        date: date,
        errorStack: err.stack ?? null,
        errorHeaders: err.headers,
        endpointPath: req.path,
        reqHeaders: req.headers ?? null,
        reqMethod: req.method ?? null,
        reqParams: req.params ?? null,
        reqBody: req.body ?? null,
        resStatus: res.status ?? null,
        resStatusMessage: res.statusMessage ?? null,
        resHeaders: res.headers ?? null,
        resBody: res.body ?? null
    }

    jsonLog.push(newEntry);

    //Save the jsonLog to the file
    try {

        fs.writeFileSync(path, JSON.stringify(jsonLog));
        console.log('Log added successfully');

    } catch (error) {
        console.error(error.message);
    }

}
function formatISOString(ISOString) {

    return ISOString.replace(/T/g, '_')
        .replace(/Z/g, '')
        .slice(0, -4)

}

export default log;