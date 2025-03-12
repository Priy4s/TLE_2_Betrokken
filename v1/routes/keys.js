import express from 'express';
import Key from '../models/Key.js';
import User from "../models/User.js";


const router = express.Router();


router.post('/generateApiKeys', async (req, res) => {

    //When making a new API key, a user's code must be given in the body
    if (!req.body.userCode) {
        res.status(400);
        return res.json({error: "Please send a body with a field named userCode containing the receiving user's code"})
    }

    try {
        const expiresAt = Date.now() + 60 * 60 * 730000 * 6;

        const user = await User.findOne({
            where: {code: req.body.userCode},
            attributes: ['id'],
            raw: true
        });

        if (!user) {
            res.status(400);
            return res.json({error: 'User does not exist'})
        }

        const key = await Key.create({
            expires_at: expiresAt,
            user_id: user.id
        });

        return res.status(201).json({keyId: key.id, expiresAt: new Date(expiresAt).toISOString()});

    } catch {
        return res.status(500).json({error: "Couldn't push into database"})
    }

});

export default router;