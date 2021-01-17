const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var product = new Schema({
    title:{type:String, required: true},
    price:{type:Number, required: true},
    description:{type:String, required: true},
    URL:{type:String, required: true},
    userId:{type:String, required: true}
})

module.exports = mongoose.model('Product',product);