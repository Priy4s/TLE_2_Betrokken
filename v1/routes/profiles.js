import express from 'express';
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Key from "../models/Key.js";

const router = express.Router();

//Get the full list of users (admin only)
router.get('/', async (req, res) => {

    const jwtInfo = jwt.verify(req.header('authorization').slice(7), process.env.TOKEN_SECRET);

    if (jwtInfo.role !== 42) {
        res.status(403);
        return res.json({error: 'User does not have permission to use this route'})
    }

    try {

        const users = await User.findAll({
            include: [{
                model: Key,
                attributes: ['expires_at']
            }]
        });

        res.status(200);
        res.json(users);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Options for user collection
router.options('/', (req, res) => {

    res.setHeader('Allow', "GET, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Detail middleware
//Only authorize admins or the user themselves to view or edit things
router.use('/:id', (req, res, next) => {

    //skip if the method was OPTIONS
    if (req.method === 'OPTIONS') {
        return next();
    }

    const jwtInfo = jwt.verify(req.header('authorization').slice(7), process.env.TOKEN_SECRET);

    if (jwtInfo.role !== 42 && parseInt(req.params.id) !== jwtInfo.userId) {
        res.status(403);
        return res.json({error: "User does not have access to this user's profile"});
    }

    next();

});

//Get the details of a specific user
router.get('/:id', async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id, {
            include: [{
                model: Key,
                attributes: ['expires_at']
            }]
        });

        if (!user) {
            res.status(404);
            return res.json({error: 'User not found!'})
        }

        res.status(200);
        res.json(user);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Update all information about a specific user (admin only)
router.put('/:id', async (req, res) => {

    //Check to make sure the user is an admin
    const jwtInfo = jwt.verify(req.header('authorization').slice(7), process.env.TOKEN_SECRET);

    if (jwtInfo.role !== 42) {
        res.status(403);
        return res.json({error: "User does not have access to this route"});
    }

    //Validate the posted information
    const body = req.body;

    //This has to be done manually because of the unique constraint on the code
    if (!body.name) {
        res.status(400);
        return res.json({error: 'name must be provided and can not be empty'});
    }

    if (!body.code) {
        res.status(400);
        return res.json({error: 'code must be provided and can not be empty'});
    }

    //Make sure the code is a string
    if (!isNaN(body.code)) {
        body.code = body.code.toString();
    }

    if (!body.role) {
        res.status(400);
        return res.json({error: 'role must be provided and can not be empty'});
    }

    if (body.role !== 1 && body.role !== 42) {
        res.status(400);
        return res.json({error: 'role must be either 1 for a normal user or 42 for an admin'});
    }

    //Make sure the user actually exists
    const user = await User.findByPk(req.params.id);

    if (!user) {
        res.status(404);
        return res.json({error: 'User not found!'})
    }

    //Only check if the code is already in use if the code differs from the existing user
    if (body.code !== user.code) {

        //Try to find a user with the new code
        const used = await User.findOne({where: {code: body.code}})

        //If one is found, return a 400
        if (used) {
            res.status(400);
            return res.json({error: 'Code is already in use'})
        }

    }

    //Change the user's information and save it to the database
    user.name = body.name;
    user.code = body.code;
    user.role = body.role;

    try {

        await user.save();

        await user.reload({
            include: [{
                model: Key,
                attributes: ['expires_at']
            }]
        });

        res.status(200);
        res.json({success: true, user: user});

    } catch (error) {
        res.status(500);
        res.json({error: error.message});
    }


});

//Change the name of a specific user
router.patch('/:id', async (req, res) => {

    //Validate the data before doing anything with the database
    if (!req.body.name) {
        res.status(400);
        return res.json({error: 'Please send a new name for the user'})
    }

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {
            res.status(404);
            return res.json({error: 'User not found!'})
        }

        user.name = req.body.name;

        await user.save();

        await user.reload({
            include: [{
                model: Key,
                attributes: ['expires_at']
            }]
        });

        res.status(200);
        res.json({success: true, user: user});

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Delete a specific user
router.delete('/:id', async (req, res) => {

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {
            res.status(404);
            return res.json({error: 'User not found!'})
        }

        await user.destroy();

        res.status(204);
        res.json();

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Options for detail
router.options('/:id', (req, res) => {

    res.setHeader('Allow', "GET, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, PATCH, DELETE, OPTIONS");

    res.status(204);
    res.send();

});

export default router;