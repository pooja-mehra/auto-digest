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
        required: true,
        unique:true
    },
    viewers:{
        type:[{
            type: String,
            required:false,
            lowercase:true,
            trim:true,
            validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
                },
            },
        }],
        required:false
    },
    editors:{
        type:[{
            type: String,
            required:false,
            lowercase:true,
            trim:true,
            validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
                },
            },
        }],
        required:false
    },
    inventories:{
        type:[{name: {
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
            required:true
        },
        category:{
            type:String,
            required:false
        }}],
        required:true
    }
    
},
    
{ collection: 'userInventory_list'});

const UserInventories = mongoose.model('userInventory_list', userInventorySchema);

module.exports = UserInventories;