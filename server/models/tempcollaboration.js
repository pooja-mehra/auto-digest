const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const userColaborationSchema = new Schema({
    ownerId:{
        type:ObjectId,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
                },
            },
    },
    colaboratorEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
                },
            },
    },
    level:{
        type:String,
        required: true
    },
    permission:{
        type:String,
        required: true
    },
    invitationDate:{
        type:Date,
        required:true,
    },
    shoppinglistName:{
        type:String,
        required: false,
        default:null
    }
    
}, { collection: 'usercolaboration_list'});

const UserColaboration = mongoose.model('usercolaboration_list', userColaborationSchema);

module.exports = UserColaboration;