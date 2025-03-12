import express from 'express';
import Key from '../models/Key.js';
import {v4 as uuidv4} from "uuid";
import key from "../models/Key.js";


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

router.delete('/:apiKey', async (req, res) => {
    const apiKey = req.params.apiKey;

    try {
        const deleted = await Key.destroy({
            where: {
                api_keys: apiKey
            },
        });

        if (deleted) {
            return res.status(200).json({
                success: true,
                message: "API key deleted successfully.",
            });
        } else {
            return res.status(404).json({
                success: false,
                error: "API key not found.",
            });
        }
    } catch (error) {
        console.error("Error deleting API key:", error.message);
        return res.status(500).json({
            success: false,
            error: "Couldn't delete key from database.",
        });
    }
});


export default router;