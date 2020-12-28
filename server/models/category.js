const mongoose = require('mongoose')
const Schema = mongoose.Schema

let categorySchema = new Schema({
    description: {
        type: String,
        unique: true,
        required: [true, 'description needed']
    },
    person: {
        type: Schema.Types.ObjectId,
        ref: 'Person'
    }
})

module.exports = mongoose.model('Category', categorySchema)