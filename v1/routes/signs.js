import express from 'express';
import Sign from '../models/Sign.js';

const router = express.Router();

//Get the full list of signs
router.get('/', async (req, res) => {

    try {

        const signs = await Sign.findAll({
            attributes: [
                'id',
                'definition',
                'theme',
                'lesson'
            ]
        });

        res.status(200);
        res.json(signs);

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Create a new sign
router.post('/', async (req, res) => {

    //Build a model based on the req.body so we can validate its contents
    const sign = Sign.build(req.body);

    //Validate the data before saving it to the database
    try {

        await sign.validate();
        sign.lesson = parseInt(sign.lesson);

    } catch (error) {

        let errorMessages = [];

        for (const validationError of error.errors) {
            errorMessages.push({error: validationError.message});
        }

        res.status(400);
        return res.json(errorMessages);

    }

    //Save the new sign to the database
    try {

        await sign.save();

    } catch (error) {

        res.status(500);
        return res.json({error: 'Something went wrong on the server, please try again'});

    }

    res.status(201);
    res.json({success: true, sign: sign});


});

//Options for sign collection
router.options('/', (req, res) => {

    res.setHeader('Allow', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Get the details of a specific sign
router.get('/:id', async (req, res) => {

    try {

        const sign = await Sign.findByPk(req.params.id);

        if (!sign) {
            res.status(404);
            return res.json({error: 'Sign not found!'})
        }

        res.status(200);
        res.json(sign);

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