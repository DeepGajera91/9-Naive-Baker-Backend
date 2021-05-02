const mongoose =  require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        lowercase: true,
        trim:true
    },
    password: {
        type:String,
        required:true,
        trim:true
    },
    picURL: {
        type:String,
        trim:true
    },
    OTP:{
        type:String,
        default: ''
    },
    following:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers:[{ type: Schema.Types.ObjectId, ref: 'User' }],
    rec:[{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
    lik:[{type:Schema.Types.ObjectId, ref: 'Recipe' }],
    sav:[{type:Schema.Types.ObjectId, ref: 'Recipe' }]
});

const User = mongoose.model('User',userSchema);

module.exports = User;
