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
const nodemailer = require('nodemailer');

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
            return res.send(response);
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
                return res.send(response);
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
            res.send(response);
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
            return res.send(response);
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
                return res.send(response);
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
                return res.send(response);
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
            res.send(response);
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
                return res.send(response);
            
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
            res.send(response);
        }
});

//detail of user
router.get("/detail",auth,async (req,res)=>{
    try{
        const tuser = await User.find(mongoose.Types.ObjectId(req.user._id));
        const user = tuser[0];
        const recipesbyuser = await Recipe.find({chefID:user._id});
        let liked = [];
        console.log(user.lik.length,user.sav.length);
        if(user.lik !== undefined && user.lik !== null){
            for(let i=0;i<user.lik.length;i++){
                let lp = await Recipe.find(mongoose.Types.ObjectId(user.lik[i]));
                liked.push(lp[0]);
            }
        }
        let saved = [];
        if(user.sav !== undefined && user.sav !== null){
            for(let i=0;i<user.sav.length;i++){
                let sp = await Recipe.find(mongoose.Types.ObjectId(user.sav[i]));
                saved.push(sp[0]);
            }
        }
        const response = {
            ok:true,
            data:{
                status:200,
                msg:"details of the user",
                user:user,
                uploaded:recipesbyuser,
                liked:liked,
                saved:saved,
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
        res.send(response);
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
        res.send(response);
    }
});

//forget password
router.post("/forgetpassword",
    [
        check("email","Please enter a valid email").isEmail(),
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
            return res.send(response);
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
                return res.send(response);
            }

            //generate otp
            let num = '1234567890';
            let OTP = '';
            for(let i = 0;i<4;i++){
                OTP+= num[Math.floor(Math.random()*10)];
            }
            console.log(OTP);
            User.updateOne(
                { _id: user._id},
                { $set: {OTP: OTP}},
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user:'naivebaker001@gmail.com',
                    pass:'@001naivebaker@'
                }
            });
            const mailOptions = {
                from: 'naivebaker001@gmail.com',
                to: req.body.email,
                subject: 'Reset password OTP',
                html:`
                <p>You have requested for resetting the password</p>
                <h1>Your One Time Password is ${OTP}</h1>
                `
            };
            transporter.sendMail(mailOptions,function(err,data){
                if(err){
                    console.log('Error occured',err);
                }
                else{
                    console.log('Email sent successfully');
                }
            });
            const response = {
                ok:true,
                data:{
                    status:200,
                    msg:"Email OPT sent",
                    user:user,
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
            res.send(response);
        }
});

//change password
router.post("/resetpassword",[
    check("email","Please enter a valid email").isEmail(),
    check("OTP","Please enter the OTP").notEmpty(),
    check("password","Please enter a valid password").isLength({
        min:8
    }),
],async(req,res)=>{
    console.log(req.body);
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
            return res.send(response);
        }
        try{  
            const temp = await User.find({email:req.body.email});
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
            const OTP = req.body.OTP;
            if(user.OTP !== OTP){
                const response = {
                    ok:false,
                    data:{
                    },
                    err:{
                        status:400,
                        msg:"Invalid OTP"    
                    }
                }
                return res.send(response);
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPASS = await bcrypt.hash(req.body.password,salt);
            User.updateOne(
                { _id: user._id},
                { $set: {password: hashedPASS}},
                function(err, result) {
                   if (err) {
                        console.log(err);
                   } else {
                        console.log(result);
                   }
                }
             ); 
             const response = {
                ok: true,
                data: {
                    status: 200,
                    msg: "password changed",
                },
                err: {
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
            res.send(response);
        }

});

module.exports = router;