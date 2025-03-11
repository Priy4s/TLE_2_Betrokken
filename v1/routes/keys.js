import express from 'express';
import Key from '../models/Key.js';
import {v4 as uuidv4} from "uuid";


const router = express.Router();


router.post('/generateApiKeys', async (req, res) => {
    try {
        const apiKey = uuidv4();
        const expiresAt = Date.now() + 60 * 60 * 730000 * 6

        const key = await Key.create({
            api_keys: apiKey,
            expires_at: expiresAt
        });

        return res.status(200).json({apiKey: key.api_keys, expiresAt: new Date(expiresAt).toISOString()});

    } catch {
        return res.status(500).json({error: "Couldn't push into database"})
    }

});

export default router;