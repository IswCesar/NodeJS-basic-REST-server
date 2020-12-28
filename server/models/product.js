const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name needed']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price needed']
    },
    description: {
        type: String,
        required: false
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    person: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    }
})

module.exports = mongoose.model('Product', productSchema)