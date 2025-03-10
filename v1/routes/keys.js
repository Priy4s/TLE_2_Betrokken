import express from 'express';
import Key from '../models/Key.js';
import {v4 as uuidv4} from "uuid";



const router = express.Router();


router.post('/generateApiKeys', async (req, res) => {
    try {
        const apiKey = uuidv4();
        const expiresAt = Date.now() + 5 * 60 * 1000

        const key = await Key.create({
            api_keys: apiKey,
            expires_at: expiresAt
        });
        console.log(key)
        return res.status(200).json({apiKey, expiresAt: new Date(expiresAt).toISOString()});
    } catch {
        return res.status(500).json({error: "Couldn't push into database"})
    }

});

export default router;