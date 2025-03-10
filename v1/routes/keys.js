import express from 'express';
import Key from '../models/Key.js';
import {v4 as uuidv4} from "uuid";
import db from "../../database.js";

const router = express.Router();


router.post('/generateApiKeys', (req,res) => {
    const apiKey = uuidv4();
    const expiresAt = Date.now() + 60 * 60 * 24000

    db.run('INSERT INTO keys (api_keys, expires_at) VALUES (?,?)', [apiKey, expiresAt], (err) => {
        if(err) {
            return res.status(500).json({error:'Couldnt push into database'})
        }
    })
    res.status(200).json({ apiKey, expiresAt: new Date(expiresAt).toISOString() });
});