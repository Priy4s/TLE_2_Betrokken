import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
router.get('/model', (req, res) => {
    try {
        // path naar de getrainde data
        const staticModel = fs.readFileSync('./v1/training/static_knn.json', 'utf8');
        // const motionModel = fs.readFileSync(path.join(__dirname, '../../models/motion_knn.json'), 'utf8');
        // Versie van het ai model
        const modelVersion = '1.0.0';

        res.json({
            staticModel: JSON.parse(staticModel),  // parse it as json
            // motionModel: JSON.parse(motionModel),
            version: modelVersion
        });

    } catch (error) {
        console.error("Error reading model files:", error);
        res.status(500).json({ error: 'Failed to load the AI models.' });
    }
});

export default router;
