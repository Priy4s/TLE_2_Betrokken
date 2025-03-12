import express from 'express';
import Sentence from '../models/Sentence.js';
import Sign from '../models/Sign.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const sentences = await Sentence.findAll({
            include: {
                model: Sign,
                through: {attributes: []}}
        });
        res.status(200).json(sentences.map(sentence =>
            ({
                id: sentence.id,
                content: sentence.content,
                signs: sentence.signs.map(sign => ({
                    id: sign.id,

                    definition: sign.definition,
                    video_path: sign.video_path,
                }))
            })));
        res.json(sentences);
    } catch (error) {
        res.status(500);
        res.json({error: error.message});
    }
});

router.post('/', async (req, res) => {
    const { sign_ids } = req.body;

    try {
        const signs = await Sign.findAll({
            where: {
                id: sign_ids
            }
        });

        if (signs.length !== sign_ids.length) {
            res.status(400);
            return res.json({error: 'Signs not found!'})
        }

        const content = signs.map(sign => sign.definition).join(' ');

        const [sentence, created] = await Sentence.findOrCreate({
            where: {
                content: content
            }
        });

        await sentence.add(signs);
        res.status(200).json(sentence);
    } catch (error) {
        res.status(500);
        res.json({error: error.message});
    }
})

router.get('/:id', async (req, res) => {
    try {
        const sentence = await Sentence.findByPk(req.params.id, {
            include: {
                model: Sign,
                through: {attributes: []}}
        });

        if (!sentence) {
            res.status(404);
            return res.json({error: 'Sentence not found!'})
        }
        res.status(200).json({
            id: sentence.id,
            content: sentence.content,
            signs: sentence.signs.map(sign => ({
                id: sign.id,

                definition: sign.definition,
                video_path: sign.video_path,
            }))
        });
        res.json(sentence);
    } catch (error) {
        res.status(500);
        res.json({error: error.message});
    }
})
export default router;