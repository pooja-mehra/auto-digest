const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commongrocerySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, { collection: 'commongrocery_list'});

const Commongrocery = mongoose.model('commongrocery_list', commongrocerySchema);

module.exports = Commongrocery;