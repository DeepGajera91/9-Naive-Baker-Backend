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


//user register
router.post("/register",
    [
        check("name","Please enter a valid name").notEmpty(),
        check("email","Please enter a valid email").isEmail(),
        check("password","Please enter a valid password").isLength({
            min:8
        }),
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
            
            let user = await User.findOne({email:req.body.email});
            if(user){
                const response = {
                    ok:false,
                    data:{
                    },
                    err:{
                        status:400,
                        msg:"User already exist"    
                    }
                }
                return res.status(400).send(response);
            }

            user = new User({
                name:req.body.name,
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
            const response = {
                    ok:true,
                    data:{
                        status:200,
                        msg:"User has been registered",
                        user:savedUser
                    },
                    err:{
                    }
                }
            res.send(response);

        }catch(err){
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:err.message   
                }
            }
            console.log(response);
            res.status(400).send(response);
        }
});


//user login
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
            
            const user = await User.findOne({email:req.body.email});
            if(!user){
                const response = {
                    ok:false,
                    data:{
                    },
                    err:{
                        status:400,
                        msg:"User is not registered"    
                    }
                }
                return res.status(400).send(response);
            }

            const validPASS = await bcrypt.compare(req.body.password,user.password);
            if(!validPASS){
                const response = {
                    ok:false,
                    data:{
                    },
                    err:{
                        status:400,
                        msg:"Password is not valid"   
                    }
                }
                return res.status(400).send(response);
            }
            
            const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET);
            const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"User logged in",
                    user:user,
                    token:token
                },
                err:{
                }
            }
            res.header('auth-token',token).send(response);

        }catch(err){
            const response = {
                ok:false,
                data:{
                },
                err:{
                    status:400,
                    msg:err.message 
                }
            }
            console.log(response);
            res.status(400).send(response);
        }
});

//get all users
router.get("/all",
    async(req,res)=>{
        try{
            const temp = await User.find();
                const response = {
                    ok:true,
                    data:{
                        status:200,
                        msg:"details of all users",
                        user:temp 
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
                    msg:err.message 
                }
            }
            res.status(400).send(response);
        }
});

//detail of user
router.get("/detail",auth,async (req,res)=>{
    try{
        const tuser = await User.find(mongoose.Types.ObjectId(req.user._id));
        const user = tuser[0];
        const recipesbyuser = await Recipe.find({chefID:user._id});
        let liked = [];
        if(user.lik !== undefined && user.lik !== null){
            for(let i=0;i<user.lik.length;i++){
                liked.push(await Recipe.find(mongoose.Types.ObjectId(user.lik[i]))[0]);
            }
        }
        let saved = [];
        if(user.sav !== undefined && user.sav !== null){
            for(let i=0;i<user.sav.length;i++){
                saved.push(await Recipe.find(mongoose.Types.ObjectId(user.sav[i]))[0]);
            }
        }
        user.liked = await liked;
        user.saved = await saved;
        const response = {
            ok:true,
            data:{
                status:200,
                msg:"details of the user",
                user:user,
                uploaded:recipesbyuser,
                liked:user.liked,
                saved:user.saved,
            },
            err:{
            }
        }
        res.send(response);
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


//user profile
router.get("/profile/:_id",async (req,res)=>{
    try{
        const cuser = await User.find({_id:req.params._id});
        const currentuser = cuser[0];
        const recipesbyuser = await Recipe.find({chefID:currentuser._id});
        const response = {
            ok:true,
            data:{
                status:200,
                msg:"details of the user",
                name:currentuser.name,
                picURL:currentuser.picURL,
                username:currentuser.username,
                followercount:(currentuser.followers===null || currentuser.followers===undefined)?0:currentuser.followers.length,
                followingcount:(currentuser.following===null || currentuser.following===undefined)?0:currentuser.following.length,
                recipe:recipesbyuser
            },
            err:{
            }
        }
        res.send(response);
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

module.exports = router;