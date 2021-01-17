const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var User = new Schema({
    name:{
        type:String,
        required: true,
        min:6

    } ,
    email:{
        type:String,
        required:true,
        max:255,
        min:6
    },
    password: {
        type:String,
        required:true,
        max:1024,
        min:6
    },
    date:{
        type:Date,
        default:Date.now
    },
    products:[{ type: Schema.Types.ObjectId, ref: 'Product' }],
        // type:String,
        // default:"No Items In Cart",
})

module.exports = mongoose.model ('User',User)