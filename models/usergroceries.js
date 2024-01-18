const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailsSchema = new Schema({
    purchaseDate:{
        type:Date,
        required:true
    },
    qty:{
        type:Number,
        required:true,
        default:1
    },
})

const usergroceriesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    abbr:{
        type:Array,
        required:false
    },
    used:{
        type:Number,
        required:true,
        default:0
    },
    details:{
        type:[detailsSchema],
        require:true
    },
    category:{
        type:String,
        required:false
    }
    
}, { collection: 'usergroceries_list'});

const Usergroceries = mongoose.model('usergroceries_list', usergroceriesSchema);

module.exports = Usergroceries;