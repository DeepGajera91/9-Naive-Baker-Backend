require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require('../Models/user.js');
const auth = require('./verifyToken.js');
const Recipe = require("../Models/recipe.js");

router.get("/search", async (req, res) => {
    try {
        let sz = 0;
        if (req.body.ingredients.length !== 0 && req.body.ingredients !== undefined) sz++;
        if (req.body.chefnames.length !== 0 && req.body.chefnames !== undefined) sz++;
        if (req.body.mealTypes.length !== 0 && req.body.mealTypes !== undefined) sz++;
        if (req.body.categorys.length !== 0 && req.body.categorys !== undefined) sz++;
        if (req.body.preparationTime !== 0) sz++;
        if (req.body.cuisines.length !== 0 && req.body.cuisines !== undefined) sz++;
        if (sz === 0) {
            const recipes = await Recipe.find();
            const response = {
                ok: true,
                data: {
                    status: 200,
                    msg: "search successfull",
                    recipes: recipes,

                },
                err: {
                }
            }
            res.send(response);
        }
        else {
            let query = "";
            query += "{\"$and\" : ["
            if (req.body.ingredients.length !== 0 && req.body.ingredients !== undefined) {
                console.log(req.body.ingredients);
                sz--;
                query += "{\"ingredients.ingname\"";
                query += " : {\"$all\" : ["
                for (let i = 0; i < req.body.ingredients.length - 1; i++) {
                    query += "\"";
                    query += req.body.ingredients[i];
                    query += "\"";
                    query += ",";
                }
                query += "\"";
                query += req.body.ingredients[req.body.ingredients.length - 1];
                query += "\"";
                query += "]}}";
                if (sz !== 0) {
                    query += ",";
                }
            }

            //chefname
            if (req.body.chefnames.length !== 0 && req.body.chefnames !== undefined) {
                sz--;
                query += "{\"chefname\"";
                query += " : {\"$in\" : ["
                for (let i = 0; i < req.body.chefnames.length - 1; i++) {
                    query += "\"";
                    query += req.body.chefnames[i];
                    query += "\"";
                    query += ",";
                }
                query += "\"";
                query += req.body.chefnames[req.body.chefnames.length - 1];
                query += "\"";
                query += "]}}";
                if (sz !== 0) {
                    query += ",";
                }
            }

            //mealtype
            if (req.body.mealTypes.length !== 0 && req.body.mealTypes !== undefined) {
                sz--;
                query += "{\"mealType\"";
                query += " : {\"$in\" : ["
                for (let i = 0; i < req.body.mealTypes.length - 1; i++) {
                    query += "\"";
                    query += req.body.mealTypes[i];
                    query += "\"";
                    query += ",";
                }
                query += "\"";
                query += req.body.mealTypes[req.body.mealTypes.length - 1];
                query += "\"";
                query += "]}}";
                if (sz !== 0) {
                    query += ",";
                }
            }

            //categorys
            if (req.body.categorys.length !== 0 && req.body.categorys !== undefined) {
                sz--;
                query += "{\"category\"";
                query += " : {\"$in\" : ["
                for (let i = 0; i < req.body.categorys.length - 1; i++) {
                    query += "\"";
                    query += req.body.categorys[i];
                    query += "\"";
                    query += ",";
                }
                query += "\"";
                query += req.body.categorys[req.body.categorys.length - 1];
                query += "\"";
                query += "]}}";
                if (sz !== 0) {
                    query += ",";
                }
            }

            //preparationTime
            if (req.body.preparationTime !== 0) {
                sz--;
                query += "{\"preparationTime\"";
                query += " : {\"$lte\" : "
                query += req.body.preparationTime;
                query += "}}";
                if (sz !== 0) {
                    query += ",";
                }
            }
            //cuisines
            if (req.body.cuisines.length !== 0 && req.body.cuisines !== undefined) {
                sz--;
                query += "{\"cuisine\"";
                query += " : {\"$in\" : ["
                for (let i = 0; i < req.body.cuisines.length - 1; i++) {
                    query += "\"";
                    query += req.body.cuisines[i];
                    query += "\"";
                    query += ",";
                }
                query += "\"";
                query += req.body.cuisines[req.body.cuisines.length - 1];
                query += "\"";
                query += "]}}"
                if (sz !== 0) {
                    query += ",";
                }
            }
            query += "]}"
            let sample = JSON.parse(query);
            const recipes = await Recipe.find(sample);
            const response = {
                ok: true,
                data: {
                    status: 200,
                    msg: "search successfull",
                    recipes: recipes,

                },
                err: {
                }
            }
            res.send(response);
        }

    } catch (err) {
        console.log(err);
        const response = {
            ok: false,
            data: {
            },
            err: {
                status: 400,
                msg: err.message
            }
        }
        res.status(400).send(response);
    }
});

module.exports = router;