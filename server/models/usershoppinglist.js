const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

const detailsSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    qty:{
        type:Number,
        required:true,
        default:1
    },
})

const usershoppingSchema = new Schema({
    userId:{
        type:ObjectId,
        required: true
    },
    listName: {
        type: String,
        required: true,
    },
   
    items:{
        type:[detailsSchema],
        require:true
    },
    
}, { collection: 'usershopping_list'});

const UserShopping = mongoose.model('usershopping_list', usershoppingSchema);

module.exports = UserShopping;