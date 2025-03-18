import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
router.get('/model', (req, res, next) => {
    try {
        const staticModel = fs.readFileSync('./v2/training/static_knn.json', 'utf8');
        const motionModel = fs.readFileSync('./v2/training/motion_knn.json', 'utf8');

        // Version of the AI model
        const modelVersion = '2.0.0';

        res.json({
            staticModel: JSON.parse(staticModel),
            motionModel: JSON.parse(motionModel),
            version: modelVersion
        });

    } catch (error) {
        next(error);
    }
});

export default router;
