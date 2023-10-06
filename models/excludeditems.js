const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create schema for todo
const excludedItemsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, { collection: 'excluded_list'});

const ExcludedItem = mongoose.model('excluded_list', excludedItemsSchema);

module.exports = ExcludedItem;