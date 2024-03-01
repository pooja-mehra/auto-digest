const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

const colaboratorDetailsSchema = new Schema({
    ownerId:{
        type:ObjectId,
        required:true
    },
    ownerEmail: {
        type: String,
        required:true,
        lowercase:true,
        trim:true,
        validate: {
        validator: function (v) {
            return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
            },
        },
    },
    details:{
        type:[{level:{
            type:String,
            required:true
        },
        permission:{
            type:String,
            required:true
        },
        shoppinglistName:{
            type:String,
            required:false,
            default:null
        }}],
        required: true
    }
})

const userAccountSchema = new Schema({
    email: {
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate: {
        validator: function (v) {
            return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
            },
        },
    },
    creationDate:{
        type:Date,
        required:true,
    },
    isColaborator:{
        type:Boolean,
        required:false,
        default:false
    },
    colaboratorDetails:{
        type:[colaboratorDetailsSchema],
        required:false,
        default:null
    }
    
}, { collection: 'useraccount_list'});

const UserAccount = mongoose.model('useraccount_list', userAccountSchema);

module.exports = UserAccount;