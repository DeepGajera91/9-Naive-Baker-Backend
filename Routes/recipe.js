require("dotenv").config();
const mongoose =  require('mongoose');
const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('./verifyToken.js');
const User = require('../Models/user.js');
const Recipe = require('../Models/recipe.js');
const Chef = require("../Models/chef.js");
const Ingredients = require("../Models/ingredient.js");

//post recipe upload

router.post("/upload",auth,
    [
        check("title","Please enter a valid title").notEmpty(),
        check("description","Please enter a valid description").notEmpty(),
        check("picURL","Please upload a valid photo").isURL(),
        check("procedure","Please enter a valid procedure").notEmpty(),
        check("preparationTime","Please enter a valid preparation time").isNumeric()
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({msg:errors.errors[0].msg});
        }

        try{
            
            //chef
            const temp = await User.find(mongoose.Types.ObjectId(req.user._id));
            if(!temp){
                return res.status(400).json({msg:"User doesn't exists"});
            }


            const user = temp[0];

            recipe = new Recipe({
                title:req.body.title,
                description:req.body.description,
                picURL:req.body.picURL,
                procedure:req.body.procedure,
                category:req.body.category,
                mealType:req.body.mealType,
                preparationTime:req.body.preparationTime,
                cuisine:req.body.cuisine,
                chefUsername:user.username,
                chefID:user._id,
                ingredients:req.body.ingredients,
                numberOflike:0,
                numberOfsave:0,
                comments:[]
            });
            
            const cook = await Chef.find({chef:{username:user.username}});
            if(cook.length === 0){
                const newChef = new Chef({
                    chef:{
                        name:user.name,
                        username:user.username
                    }
                });
                const savedChef = await newChef.save();
            }

            const curIngredient = req.body.ingredients;

            for(let i=0;i<curIngredient.length;i++){
                const ing = await Ingredients.find({ingredient:curIngredient[i].ingname});
                if(ing.length === 0){
                    const newIng = new Ingredients({
                        ingredient:curIngredient[i].ingname
                    });
                    const savedIng = newIng.save();
                }
            }

            const savedRecipe = await recipe.save();
            res.send(savedRecipe);

        }catch(err){
            console.log(err.message);
            res.status(400).send(err);
        }
});


//get all recipe  

//recipe update

//delete recipe




module.exports = router;