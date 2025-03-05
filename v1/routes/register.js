import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {

    //Make sure the client actually sent something we can use
    const postedUser = req.body;

    if (!postedUser.ssoToken || !postedUser.name || !postedUser.code) {
        res.status(400);
        return res.json({error: 'Please send an object with the following properties: ssoToken, name, code'})
    }

    //Check if the SSO token is valid
    try {

        const response = await fetch("https://cmgt.hr.nl/api/validate-sso-token", {
            method: "GET",
            headers: {
                "Token": req.body.ssoToken,
            },
        });

        if (!response.ok) {
            res.status(401);
            return res.json({error: 'Token has expired or is incorrect'})
        }


    } catch (error) {

        console.error(error.message);
        res.status(500);
        return res.json({error: 'Something went wrong in the server.'})

    }

    //Add the user to the database if they didn't already exist
    try {

        const [user, created] = await User.findOrCreate({
            where: {code: postedUser.code},
            defaults: {
                name: postedUser.name,
                role: 1,
            }
        });

        //If the user already exists, send a 400 error
        if (!created) {
            res.status(400);
            return res.json({success: false, error: 'A user with that code already exists'});
        }

        res.status(201);
        res.json({success: true, user: user});

    } catch (error) {
        res.status(500);
        res.json({error: 'Something went wrong on the server, please try again'});
    }


});

router.options('/', (req, res) => {

    res.setHeader('Allow', "POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "POST, OPTIONS");

    res.status(204);
    res.send();

});

export default router;