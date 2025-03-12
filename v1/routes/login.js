import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

//SSO verification middleware
router.use(async (req, res, next) => {

    //Skip verification if the login uses admin credentials
    if (req.body.ssoToken === process.env.ADMIN_TOKEN && req.body.code === process.env.ADMIN_CODE) {
        return next();
    }


    try {

        const response = await fetch("https://cmgt.hr.nl/api/validate-sso-token", {
            method: "GET",
            headers: {
                "Token": req.body.ssoToken
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

    //Otherwise just continue
    next();

})

router.post('/', async (req, res) => {

    if (!req.body.code || !req.body.ssoToken) {
        res.status(400);
        return res.json({error: 'Please send an object with the following properties: ssoToken, code'})
    }

    try {

        const user = await User.findOne({where: {code: req.body.code}});

        if (!user) {

            //Frontend should redirect to register
            res.status(403);
            return res.json({error: 'User has not yet registered'});

        }

        //Check if the user has a valid api key issued to them
        const userKeys = await user.getKeys({raw: true});

        let validKey = false;

        for (const userKey of userKeys) {
            if (userKey.expires_at > Date.now() && userKey.user_id === user.id) {
                validKey = true
            }
        }

        if (!validKey) {
            res.status(403);
            return res.json({error: 'User does not have a valid API key'});
        }


        const json_token = jwt.sign({user_id: user.id, role: user.role}, process.env.TOKEN_SECRET, {expiresIn: '6h'});

        res.status(200);
        res.json({success: true, jwt: json_token});

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

router.options('/', (req, res) => {

    res.setHeader('Allow', "POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "POST, OPTIONS");

    res.status(204);
    res.send();

});


export default router;