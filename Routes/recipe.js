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


//get recipe
router.get("/all",
    async(req,res)=>{
        try{
            const temp = await Recipe.find();
            
                const response = {
                    ok:true,
                    data:{
                        status:200,
                        msg:"all the recipes.",
                        recipe:temp 
                    },
                    err:{
                    }
                }
                return res.status(200).send(response);
            
        }catch(err){
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:"Recipes not found"  
                }
            }
            res.status(400).send(response);
        }

});

//upload recipe
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
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:errors.errors[0].msg      
                }
            }
            return res.status(400).send(response); 
        }

        try{
            
            //chef
            const temp = await User.find(mongoose.Types.ObjectId(req.user._id));
            if(!temp){
                const response = {
                    ok:false,
                    data:{
                    },
                    err:{
                        status:400,
                        msg:"User doesn't exist"   
                    }
                }
                return res.status(400).send(response);
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
                chefname:user.name,
                chefID:user._id,
                ingredients:req.body.ingredients,
                numberOflike:0,
                numberOfsave:0,
                comments:[]
            });
            
            
            const cook = await Chef.find({"chef._id" : user._id});
            if(cook.length === 0){
                const newChef = new Chef({
                    chef:{
                        name:user.name,
                        _id:user._id
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

            //query user update rec[] savedRecipe._id 
            User.updateOne(
                { _id: user._id},
                { $push: { rec: savedRecipe._id } },
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
            
            const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"recipe uploaded successfully",
                    recipe:savedRecipe    
                },
                err:{
                }
            }
            res.status(200).send(response);

        }catch(err){
            console.log(err);
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:err.message    
                }
            }
            res.status(400).send(response);
        }
});

//delete recipe 
router.delete("/delete",auth,async(req,res)=>{

    const temp = await Recipe.find(mongoose.Types.ObjectId(req.body._id));

    if(!temp){
        const response = {
            ok:false,
            data:{
            },
            err:{
                status:400,
                msg:"Recipe doesn't exist"   
            }
        }
        return res.send(response);
    }
    var myquery={_id: req.body._id };  
    Recipe.remove(myquery);

    const response = {
        ok:true,
        data:{
            status:200,
            msg:"Deletion successful" 
        },
        err:{
        }
    }
    return res.status(200).send(response);
});

//like recpie
router.put("/like",auth,async(req,res)=>{
    try{
        const temp = await User.find(mongoose.Types.ObjectId(req.user._id));
        if(!temp){
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:"User doesn't exist"   
                }
            }
            return res.send(response);
        }
        const user = temp[0];
        var isliked = false;
        for(var a = 0;a < user.lik.length;a++){
            var isrecipe = user.lik[a];
            if(isrecipe._id.toString() === req.body._id){
                isliked = true;
                break;
            }
        }
        if(isliked){
            User.updateOne(
                { _id: user._id},
                { $pull: { lik: req.body._id } },
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
             const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"User had already liked the recipe" 
                },
                err:{
                }
            }
            res.status(200).send(response);
        }
        else{
            User.updateOne(
                { _id: user._id},
                { $push: { lik: req.body._id } },
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
             const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"User liked the recipe" 
                },
                err:{
                }
            }
            res.status(200).send(response);
        }
    }catch(err){
        console.log(err);
        const response = {
            ok:false,
            data:{
            },
            err:{
                status:400,
                msg:err.message    
            }
        }
        res.send(response);
    }

});

//save recpie
router.put("/save",auth,async(req,res)=>{
    try{
        const temp = await User.find(mongoose.Types.ObjectId(req.user._id));
        if(!temp){
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:"User doesn't exist"   
                }
            }
            return res.send(response);
        }
        const user = temp[0];
        var issaved = false;
        for(var a = 0;a < user.sav.length;a++){
            var isrecipe = user.sav[a];
            if(isrecipe._id.toString() === req.body._id){
                issaved = true;
                break;
            }
        }
        if(issaved){
            User.updateOne(
                { _id: user._id},
                { $pull: { sav: req.body._id } },
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
             const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"User had already saved the recipe" 
                },
                err:{
                }
            }
            res.status(200).send(response);
        }
        else{
            User.updateOne(
                { _id: user._id},
                { $push: { sav: req.body._id } },
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
             const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"User saved the recipe" 
                },
                err:{
                }
            }
            res.status(200).send(response);
        }
    }catch(err){
        console.log(err);
        const response = {
            ok:false,
            data:{
            },
            err:{
                status:400,
                msg:err.message    
            }
        }
        res.send(response);
    }

});

module.exports = router;