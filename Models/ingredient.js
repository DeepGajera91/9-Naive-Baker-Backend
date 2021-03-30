const mongoose =  require('mongoose');
const { Schema } = mongoose;

const ingredientsSchema = new Schema({
    ingredient:{
        type:String,
        trim:true,
        required:true,
        lowercase:true
    }
});

const Ingredients = mongoose.model('Ingredients',ingredientsSchema);

module.exports = Ingredients;
