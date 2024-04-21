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
        required: true,
        unique:true
    },
    shoppingLists:{
        type:[{
            listName: {
                type: String,
                required: true,
            },
           
            items:{
                type:[detailsSchema],
                require:true
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
            }
        }],
        required:true
    }
    
}, { collection: 'usershopping_list'});

const UserShopping = mongoose.model('usershopping_list', usershoppingSchema);

module.exports = UserShopping;