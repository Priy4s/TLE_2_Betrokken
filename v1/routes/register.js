import express from 'express';
import User from '../models/User.js';
import {v4 as uuidv4} from "uuid";
import Key from "../models/Key.js";
import {BaseError} from "sequelize";

const router = express.Router();

router.post('/', async (req, res) => {

    //Make sure the client actually sent something we can use
    const postedUsers = req.body;

    //Check if an array was sent
    if (!Array.isArray(postedUsers)) {
        res.status(400);
        return res.json({error: 'Please send an array of objects containing a name and code property'});
    }

    const failedRequests = [];
    const errors = [];

    for (const postedUser of postedUsers) {

        if (!postedUser.name || !postedUser.code) {

            failedRequests.push(postedUser);

            errors.push({message: 'User must have a name and code, and neither can be empty'});

            continue;
        }

        try {

            //Add the user if they didn't already exist
            const [user, created] = await User.findOrCreate({
                where: {code: postedUser.code},
                defaults: {
                    name: postedUser.name,
                    role: 1,
                }
            });

            await user.reload();

            //Give them a new API key
            const apiKey = uuidv4();
            const expiresAt = Date.now() + 60 * 60 * 730000 * 6;

            await Key.create({
                api_keys: apiKey,
                expires_at: expiresAt,
                user_id: user.id
            });

        } catch (error) {

            failedRequests.push(postedUser);
            errors.push(error);

        }

    }


    let status = 201;
    let success = true;

    if (errors.length > 0) {

        status = 400;

        if (postedUsers.length === failedRequests.length) {
            success = false;
        }

        if (errors.some(error => error instanceof BaseError)) {
            status = 500;
        }

    }


    res.status(status);
    return res.json({partialSuccess: success, failedRequests: failedRequests, errors: errors});


});

router.options('/', (req, res) => {

    res.setHeader('Allow', "POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "POST, OPTIONS");

    res.status(204);
    res.send();

});

export default router;