import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import SsoToken from "../models/SsoToken.js";

const router = express.Router();

//SSO verification middleware
router.use(async (req, res, next) => {

    //Skip verification for the options method
    if (req.method === 'OPTIONS') {
        return next();
    }

    //Make sure the user actually sent something
    if (!req.body.code || !req.body.ssoToken) {
        res.status(400);
        return res.json({error: 'Please send an object with the following properties: ssoToken, code'})
    }

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

        next(error);

    }

    //Otherwise just continue
    next();

});

//Make sure only one user can use an sso token
router.use(async (req, res, next) => {

    try {

        const user = await User.findOne({where: {code: req.body.code}, attributes: ['id']});

        if (!user) {
            //Frontend should redirect to register
            res.status(401);
            return res.json({error: `User ${req.body.code} has not yet registered`});

        }

        const usedToken = await SsoToken.findOne({where: {token: req.body.ssoToken}});

        //If the token isn't used, add it to the database
        if (!usedToken) {
            await SsoToken.create({token: req.body.ssoToken, user_id: user.id});
            return next();
        }

        //If it is, make sure the user matches the token they are trying to use
        if (usedToken.user_id !== user.id) {
            res.status(401);
            return res.json({error: 'ssoToken is already in use by another user'});
        }

    } catch (error) {
        next(error);
    }

    next();
});

router.post('/', async (req, res, next) => {

    try {

        const user = await User.findOne({where: {code: req.body.code}, attributes: ['id', 'role']});

        if (!user) {

            //Frontend should redirect to register
            res.status(401);
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


        const jsonToken = jwt.sign({userId: user.id, role: user.role}, process.env.TOKEN_SECRET, {expiresIn: '6h'});

        res.status(200);
        res.json({success: true, jwt: jsonToken});

    } catch (error) {

        next(error);

    }

});

router.options('/', (req, res) => {

    res.setHeader('Allow', "POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "POST, OPTIONS");

    res.status(204);
    res.send();

});


export default router;