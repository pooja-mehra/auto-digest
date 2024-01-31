const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
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

const userInventorySchema = new Schema({
    userId:{
        type:ObjectId,
        required: true
    },
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
},
    
{ collection: 'userInventory_list'});

const UserInventories = mongoose.model('userInventory_list', userInventorySchema);

module.exports = UserInventories;