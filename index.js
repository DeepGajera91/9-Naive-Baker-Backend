require("dotenv").config();
const express = require('express');
const app = express();
const db = require('./db.js');
const cors = require('cors');
const morgan = require("morgan");

//routers
const userRouter = require('./Routes/user.js');
const recipeRouter = require('./Routes/recipe.js');
const queryRouter = require('./Routes/query.js');


app.use(cors());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Logging
if(process.env.NODE_ENV === "Development") {
    app.use(morgan("dev"));
} 

db();

app.get("/",(req,res)=>{
    res.send("Helllo! Naive-Baker backend here!😀");
});

app.get("/hi",(req,res)=>{
    res.send("Helllo! Deep here!😀");
});

app.use("/user",userRouter);
app.use("/recipe",recipeRouter);
app.use("/query",queryRouter);

const port = process.env.PORT  || 5000;
app.listen(port,() => {
    console.log(`server is running on port : ${port}`);
});



