const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scannedGroceriesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code:{
        type:Number,
        required:true,
        default:0
    },
    category:{
        type:String,
        required:false
    },
    brand:{
        type:String,
        required:false
    }
    
}, { collection: 'scannedgroceries_list'});

const ScannedGroceries = mongoose.model('scannedgroceries_list', scannedGroceriesSchema);

module.exports = ScannedGroceries;