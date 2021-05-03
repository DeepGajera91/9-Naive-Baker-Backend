require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require('../Models/user.js');
const auth = require('./verifyToken.js');
const Recipe = require("../Models/recipe.js");
const Chef = require("../Models/chef.js");
const Ingredients = require("../Models/ingredient.js");

router.post("/search", async (req, res) => {
    try {
        let sz = 0;
        if (req.body.ingredients !== undefined && req.body.ingredients.length !== 0) sz++;
        if (req.body.chefnames !== undefined && req.body.chefnames.length !== 0) sz++;
        if (req.body.mealTypes !== undefined && req.body.mealTypes.length !== 0) sz++;
        if (req.body.categorys !== undefined && req.body.categorys.length !== 0) sz++;
        if (req.body.preparationTime !== 0) sz++;
        if (req.body.cuisines !== undefined && req.body.cuisines.length !== 0) sz++;
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
            if (req.body.ingredients !== undefined && req.body.ingredients.length !== 0) {
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
            if (req.body.chefnames !== undefined && req.body.chefnames.length !== 0) {
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
            if (req.body.mealTypes !== undefined && req.body.mealTypes.length !== 0) {
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
            if (req.body.categorys !== undefined && req.body.categorys.length !== 0) {
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
            if (req.body.cuisines !== undefined && req.body.cuisines.length !== 0 ) {
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
        res.send(response);
    }
});

//get chefs

router.get("/chefs",async(req,res) => {
    try{
        const allchefs = await Chef.find();
        let chefs = [];
        for(let i=0;i<allchefs.length;i++){
            chefs.push(allchefs[i].chef.name);
        }
        const response = {
            ok:true,
            data:{
                status:200,
                msg:"all the chefs",
                chefs:chefs 
            },
            err:{
            }
        }
        return res.status(200).send(response);
    }catch(err){
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
        res.send(response);
    }
}) 

//get ingredients
router.get("/ingredients",async(req,res) => {
    try{
        const allings = await Ingredients.find();
        let ings = [];
        for(let i=0;i<allings.length;i++){
            ings.push(allings[i].ingredient);
        }
        const response = {
            ok:true,
            data:{
                status:200,
                msg:"all the ingredients",
                ingredients:ings
            },
            err:{
            }
        }
        return res.status(200).send(response);
    }catch(err){
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
        res.send(response);
    }
})

module.exports = router;