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

    const jwtInfo = jwt.verify(req.header('authorization').slice(7), process.env.TOKEN_SECRET);

    if (jwtInfo.role !== 42 && req.params.id !== jwtInfo.user_id) {
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

//Update the details of a specific user
router.put('/:id', async (req, res) => {

    //Validate the data before doing anything with the database
    if (!req.body.name && !req.body.code) {
        res.status(400);
        return res.json({error: 'No usable data was given, allowed fields are name and code'})
    }

    try {

        const user = await User.findByPk(req.params.id);

        if (!user) {
            res.status(404);
            return res.json({error: 'User not found!'})
        }

        user.code = req.body.code ?? user.code;
        user.name = req.body.name ?? user.name;

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

    res.setHeader('Allow', "GET, PUT, DELETE, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, PUT, DELETE, OPTIONS");

    res.status(204);
    res.send();

});

export default router;