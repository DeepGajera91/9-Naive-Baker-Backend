const mongoose =  require('mongoose');
const { Schema } = mongoose;

const chefSchema = new Schema({
    chef:{
        name:{type:String,required:true,trim:true},
        username:{type:String,required:true,trim:true,lowercase:true}
    }
});

const Chef = mongoose.model('Chef',chefSchema);

module.exports = Chef;
