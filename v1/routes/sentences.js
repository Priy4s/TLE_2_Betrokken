import express from 'express';
import Sentence from '../models/Sentence.js';
import Sign from '../models/Sign.js';
import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `storage.sqlite`,
    define: {
        timestamps: false
    }
})

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const sentences = await Sentence.findAll({
            include: {
                model: Sign,
                as: 'signs',
                through: {attributes: []}}
        });
        res.status(200).json(sentences.map(sentence =>
            ({
                id: sentence.id,
                video_path: sentence.video_path,
                definition: sentence.definition,
                model_path: sentence.model_path,
                signs: sentence.signs.map(sign => ({
                    id: sign.id,

                    definition: sign.definition,
                    video_path: sign.video_path,
                }))
            })));
        res.json(sentences);
    } catch (error) {
        console.log(error.message)
        res.status(500);
        res.json({error: error.message});
    }
});

router.post('/', async (req, res) => {
    const { sign_ids, video_path, definition, model_path } = req.body;

    try {

        if (!sign_ids || !video_path || !definition || !model_path) {
            res.status(400);
            return res.json({error: 'Please send an object with the following properties: sign_ids, video_path, definition, model_path'})
        }

        if (!Array.isArray(sign_ids) || sign_ids.length === 0) {
            res.status(400);
            return res.json({error: 'Signs not found or incorrect!'})
        }

        const signs = await Sign.findAll({
            where: {
                id: sign_ids
            },
            attributes: ['id', 'definition', 'video_path']
        });

        if (signs.length !== sign_ids.length) {
            res.status(400);
            return res.json({error: 'Signs not found!'})
        }

        const [sentence, created] = await Sentence.findOrCreate({
            where: {
                definition
            },
            defaults: {
                video_path, definition, model_path,
            }
        });

        const sentenceSignEntries = sign_ids.map((sign_id, index) => ({
            sentence_id: sentence.id,
            sign_id: sign_id,
            sequence_position: index + 1, // Assign sequential position
        }));

        // Insert into junction table
        await sequelize.getQueryInterface().bulkInsert('sentence_sign', sentenceSignEntries);

        const updatedSentence = await Sentence.findByPk(
            sentence.id,
            {
                include: {
                    model: Sign,
                    as: 'signs',
                    through: {attributes: ['sequence_position']}}
            }
        )

        await sentence.addSigns(signs);

        res.status(201).json({
            message: created ? 'Sentence created!' : 'Sentence already exists!',
            sentence: {
                id: updatedSentence.id,
                video_path: updatedSentence.video_path,
                definition: updatedSentence.definition,
                model_path: updatedSentence.model_path,
                signs: updatedSentence.signs.map(sign => ({
                    id: sign.id,
                    definition: sign.definition,
                    video_path: sign.video_path,
                    sequence_position: sign.sentence_sign?.sequence_position,
                }))}
        });
    } catch (error) {
        console.log(error.message)
        res.status(500);
        res.json({error: error.message});
    }
})

router.get('/:id', async (req, res) => {
    try {
        const sentence = await Sentence.findByPk(req.params.id, {
            include: {
                model: Sign,
                as: 'signs',
                through: {attributes: []}}
        });

        if (!sentence) {
            res.status(404);
            return res.json({error: 'Sentence not found!'})
        }
        res.status(200).json({
            id: sentence.id,
            video_path: sentence.video_path,
            definition: sentence.definition,
            model_path: sentence.model_path,
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