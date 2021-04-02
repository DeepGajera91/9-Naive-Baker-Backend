const mongoose =  require('mongoose');
const { Schema } = mongoose;

const chefSchema = new Schema({
    chef:{
        name:{type:String,required:true,trim:true},
        _id:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    }
});

const Chef = mongoose.model('Chef',chefSchema);

module.exports = Chef;
