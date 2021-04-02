const mongoose =  require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
    title: {
        type:String,
        required:true,
        trim:true
    },
    description: {
        type:String,
        required:true,
        trim:true
    },
    picURL: {
        type:String,
        required:true,
        trim:true
    },
    procedure: {
        type:String,
        required:true,
        trim:true
    },
    category:{
        type:String,
        enum:['Veg','Non-Veg','Vegan'],
        required:true,
        trim:true
    },
    mealType:{
        type:String,
        enum:['Breakfast','Lunch','Dinner','Snack'],
        required:true,
        trim:true
    },
    preparationTime:{
        type:Number, //minute
        required:true,
        trim:true
    },
    cuisine:{
        type:String,
        trim:true
    },
    chefname:{
        type:String,
        required:true
    },
    chefID:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    ingredients:[
        {
            ingname:{ type: String, required:true, lowercase:true},
            ingqunt:{ type: String, required:true} 
        }
    ],
    numberOflike:{
        type:Number,
        default:0
    },
    numberOfSave:{
        type:Number,
        default:0
    },
    comments:[{
        user:String,
        feedback:String,
        userID:{
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    }]
});

const Recipe = mongoose.model('Recipe',recipeSchema);

module.exports = Recipe;
