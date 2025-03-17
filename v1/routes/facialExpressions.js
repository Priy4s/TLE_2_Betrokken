import express from 'express';
import FacialExpression from '../models/FacialExpression.js';

const router = express.Router();

//Get the full list of expressions
router.get('/', async (req, res, next) => {

    try {

        const facialExpressions = await FacialExpression.findAll({
            attributes: [
                'id',
                'name',
                'image_path'
            ]
        });

        res.status(200);
        res.json(facialExpressions);

    } catch (error) {

        next(error);

    }

});

//Create a new expression
router.post('/', async (req, res, next) => {

    //Build a model based on the req.body so we can validate its contents
    const expression = FacialExpression.build(req.body);

    //Validate the data before saving it to the database
    try {

        await expression.validate();

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

        await expression.save();

    } catch (error) {

        next(error);

    }

    res.status(201);
    res.json({success: true, expression: expression});


});

//Options for expression collection
router.options('/', (req, res) => {

    res.setHeader('Allow', "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS");

    res.status(204);
    res.send();

});

//Get the details of a specific sign
router.get('/:id', async (req, res, next) => {

    try {

        const expression = await FacialExpression.findByPk(req.params.id);

        if (!expression) {
            res.status(404);
            return res.json({error: 'Facial expression not found!'})
        }

        res.status(200);
        res.json(expression);

    } catch (error) {

        next(error);

    }

});

//Update the details of a specific sign
router.put('/:id', async (req, res, next) => {

    //Build a model based on the req.body so we can validate its contents
    const postedExpression = FacialExpression.build(req.body);

    //Validate the data before doing anything with the database
    try {

        await postedExpression.validate();

    } catch (error) {

        let errorMessages = [];

        for (const validationError of error.errors) {
            errorMessages.push({error: validationError.message});
        }

        res.status(400);
        return res.json(errorMessages);

    }

    try {

        const expression = await FacialExpression.findByPk(req.params.id);

        if (!expression) {
            res.status(404);
            return res.json({error: 'Expression not found!'})
        }

        expression.image_path = req.body.image_path;
        expression.name = req.body.name;

        await expression.save();

        res.status(200);
        res.json({success: true, expression: expression});

    } catch (error) {

        next(error);

    }

});

//Delete a specific sign
router.delete('/:id', async (req, res, next) => {

    try {

        const expression = await FacialExpression.findByPk(req.params.id);

        if (!expression) {
            res.status(404);
            return res.json({error: 'Expression not found!'})
        }

        await expression.destroy();

        res.status(204);
        res.json();

    } catch (error) {

        next(error);

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