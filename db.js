require("dotenv").config();
const mongoose = require('mongoose');

const db = async() =>
{
    try{
        const dbconnection = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log(`MongoDB connection established : ${dbconnection.connection.host}`);
    }catch(err){
        console.error(err);
        process.exit(1);
    }
};

module.exports = db;