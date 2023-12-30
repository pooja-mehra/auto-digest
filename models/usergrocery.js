const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    abbr:{
        type:Array,
        required:false
    },
    qty:{
        type:Number,
        required:true,
        default:1
    },
    category:{
        type:String,
        required:false
    }
})

const usergrocerySchema = new Schema({
    purchaseDate:{
        type:Date,
        required:true
    },
    items:{
        type:[itemsSchema],
        require:true
    }
    
}, { collection: 'usergrocery_list'});

const Usergrocery = mongoose.model('usergrocery_list', usergrocerySchema);

module.exports = Usergrocery;