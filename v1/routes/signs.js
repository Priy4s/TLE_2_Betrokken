import express from 'express';
import Sign from '../models/Sign.js';
import facial_expression from "../models/Facial_expression.js";
import FacialExpression from "../models/Facial_expression.js";
import Facial_expression_sign from "../models/Facial_expression_sign.js";

const router = express.Router();

//Get the full list of signs
router.get('/', async (req, res) => {

    try {

        const signs = await Sign.findAll({
            attributes: [
                'id',
                'video_path',
                'definition',
                'theme',
                'model_path',
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

        //Add any facial expressions if needed
        if (req.body.expressions) {

            if (Array.isArray(req.body.expressions)) {

                for (const expression of req.body.expressions) {

                    if (Number.isSafeInteger(expression)) {
                        const expr = await FacialExpression.findByPk(expression);

                        if (expr) {
                            await sign.addFacialExpression(expr);
                        }
                    }

                }

            } else if (Number.isSafeInteger(req.body.expressions)) {

                const expr = await FacialExpression.findByPk(req.body.expressions);

                if (expr) {
                    await sign.addFacialExpression(expr);
                }

            } else {

                const expr = await FacialExpression.findOne({where: {name: 'geen'}});

                if (expr) {
                    await sign.addFacialExpression(expr);
                }

            }

        } else {
            const expr = await FacialExpression.findOne({where: {name: 'geen'}});

            if (expr) {
                await sign.addFacialExpression(expr);
            }
        }


        await sign.reload({
            include: [{
                model: facial_expression,
                through: {attributes: []}
            }]
        });

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

        const sign = await Sign.findByPk(req.params.id, {
            include: [{
                model: facial_expression,
                through: {attributes: []}
            }]
        });

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

//Update the details of a specific sign
router.put('/:id', async (req, res) => {

    //Build a model based on the req.body so we can validate its contents
    const postedSign = Sign.build(req.body);
    let postedExpressions = [];

    //Validate the data before doing anything with the database
    try {

        await postedSign.validate();
        postedSign.lesson = parseInt(postedSign.lesson);

        if (req.body.expressions) {

            if (Array.isArray(req.body.expressions)) {

                postedExpressions = req.body.expressions

            } else if (Number.isSafeInteger(req.body.expressions)) {

                postedExpressions.push(req.body.expressions);

            } else {

                res.status(400);
                return res.json({error: 'expressions must be a number or an array of numbers'});

            }

            //Filter out anything that isn't a number and can't be converted to a number
            postedExpressions = postedExpressions.filter((postExpr) => {
                //If it's a number, just return it
                if (Number.isSafeInteger(postExpr)) {
                    return postExpr;
                }

                //If it can be converted into a number, return the converted number
                if (!isNaN(parseInt(postExpr))) {
                    return parseInt(postExpr);
                }

            });

        }

    } catch (error) {

        let errorMessages = [];

        for (const validationError of error.errors) {
            errorMessages.push({error: validationError.message});
        }

        res.status(400);
        return res.json(errorMessages);

    }

    try {

        const sign = await Sign.findByPk(req.params.id);

        if (!sign) {
            res.status(404);
            return res.json({error: 'Sign not found!'})
        }

        sign.video_path = req.body.video_path;
        sign.definition = req.body.definition;
        sign.lesson = req.body.lesson;
        sign.theme = req.body.theme;

        await sign.save();

        //Only update the expressions if they got sent in with the request
        if (postedExpressions !== []) {

            const expressionRecords = await Facial_expression_sign.findAll({
                where: {sign_id: sign.id},
                attributes: ['facial_expression_id']
            });

            const expressionIds = [];

            for (const expressionRecord of expressionRecords) {
                expressionIds.push(expressionRecord.dataValues.facial_expression_id);
            }

            //Only update if things actually changed
            if (postedExpressions !== expressionIds) {

                const fetchedExpressions = []

                for (const postedExpression of postedExpressions) {
                    const expr = await FacialExpression.findByPk(postedExpression);

                    if (expr) {
                        fetchedExpressions.push(expr);
                    } else {
                        res.status(400);
                        return res.json({error: `Expression with the id ${postedExpression} does not exist`})
                    }
                }

                await sign.setFacialExpressions(fetchedExpressions);

            }


        }

        //Reload the sign from the database so we can also return the facial expressions
        await sign.reload({
            include: [{
                model: facial_expression,
                through: {attributes: []}
            }]
        });

        res.status(200);
        res.json({success: true, sign: sign});

    } catch (error) {

        res.status(500);
        res.json({error: error.message});

    }

});

//Delete a specific sign
router.delete('/:id', async (req, res) => {

    try {

        const sign = await Sign.findByPk(req.params.id);

        if (!sign) {
            res.status(404);
            return res.json({error: 'Sign not found!'})
        }

        await sign.destroy();

        res.status(204);
        res.json();

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