const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
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
    
}, { collection: 'useraccount_list'});

const UserAccount = mongoose.model('useraccount_list', userAccountSchema);

module.exports = UserAccount;