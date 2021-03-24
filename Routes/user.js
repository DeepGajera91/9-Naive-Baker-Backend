require("dotenv").config();
const mongoose =  require('mongoose');
const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Models/user.js');
const auth = require('./verifyToken.js');
const Recipe = require("../Models/recipe.js");

router.post("/register",
    [
        check("name","Please enter a valid name").notEmpty(),
        check("email","Please enter a valid email").isEmail(),
        check("password","Please enter a valid password").isLength({
            min:8
        }),
        check("username","Please enter a valid username").notEmpty(),
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({msg:errors.errors[0].msg});
        }

        try{
            
            let user = await User.findOne({email:req.body.email});
            if(user){
                return res.status(400).json({msg:"User already exists"});
            }

            user = await User.findOne({username:req.body.username});
            if(user){
                return res.status(400).json({msg:"Entered username is not available"});
            }

            user = new User({
                name:req.body.name,
                username:req.body.username,
                email:req.body.email,
                password:req.body.password,
                picURL:"",
                following:[], 
                followers:[],
                recipe:[],
                liked:[],
                saved:[]
            });

            //password encryption
            const salt = await bcrypt.genSalt(10);
            const hashedPASS = await bcrypt.hash(req.body.password,salt);

            user.password = hashedPASS;
            
            const savedUser = await user.save();
            res.send({user:user._id});

        }catch(err){
            console.log(err.message);
            res.status(400).send(err);
        }
});

router.post("/login",
    [
        check("email","Please enter a valid email").isEmail(),
        check("password","Please enter a valid password").isLength({
            min:8
        })
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({msg:errors.errors[0].msg});
        }

        try{
            
            const user = await User.findOne({email:req.body.email});
            if(!user){
                return res.status(400).json({msg:"User is not registered"});
            }

            const validPASS = await bcrypt.compare(req.body.password,user.password);
            if(!validPASS){
                return res.status(400).json({msg:"Password is not valid"});
            }
            
            const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
            res.header('auth-token',token).send(token);

        }catch(err){
            console.log(err.message);
            res.status(400).send(err);
        }
});

//update user 

//user change password

//user forget password

//delete user

//get all user

router.get("/detail",auth,async (req,res)=>{
    try{
        const tuser = await User.find(mongoose.Types.ObjectId(req.user._id));
        const user = tuser[0];
        const recipesbyuser = await Recipe.find({chefID:user._id});
        user.recipe = recipesbyuser;
        let liked = [];
        if(user.lik !== undefined && user.lik !== null){
            for(let i=0;i<user.lik.length;i++){
                liked.push(Recipe.find(mongoose.Types.ObjectId(user.lik[i]))[0]);
            }
        }
        let saved = [];
        if(user.sav !== undefined && user.sav !== null){
            for(let i=0;i<user.sav.length;i++){
                saved.push(Recipe.find(mongoose.Types.ObjectId(user.sav[i]))[0]);
            }
        }
        user.liked = liked;
        user.saved = saved;
        res.send(user);
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
});

router.get("/profile/:username",async (req,res)=>{
    try{
        const cuser = await User.find({username:req.params.username});
        const currentuser = cuser[0];
        const recipesbyuser = await Recipe.find({chefID:currentuser._id});
        res.send({
            name:currentuser.name,
            picURL:currentuser.picURL,
            username:currentuser.username,
            followercount:(currentuser.followers===null || currentuser.followers===undefined)?0:currentuser.followers.length,
            followingcount:(currentuser.following===null || currentuser.following===undefined)?0:currentuser.following.length,
            recipe:recipesbyuser,
        });
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
});

module.exports = router;