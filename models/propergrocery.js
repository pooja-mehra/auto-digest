const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propergrocerySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, { collection: 'propergrocery_list'});

const Propergrocery = mongoose.model('propergrocery_list', propergrocerySchema);

module.exports = Propergrocery;