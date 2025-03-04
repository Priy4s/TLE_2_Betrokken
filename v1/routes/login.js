import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

//SSO verification middleware
router.use(async (req, res, next) => {

    //Skip verification if the login uses admin credentials
    if (req.body.token === process.env.ADMIN_TOKEN && req.body.student_number === parseInt(process.env.ADMIN_NUMBER)) {
        return next();
    }


    try {

        const response = await fetch("https://cmgt.hr.nl/api/validate-sso-token", {
            method: "GET",
            headers: {
                "Token": req.body.token,
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

    try {

        const user = await User.findOne({ where: { student_number: req.body.student_number } });

        if (!user) {

            //Frontend should redirect to register
            res.status(403);
            return res.json();

        }

        //TODO: Add an expiration time
        const json_token = jwt.sign(req.body.student_number, process.env.TOKEN_SECRET);

        res.status(200);
        res.json({jwt: json_token});

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

export default router;