const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema

let roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not a valid role'
};

let personSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name needed']
    },
    email: {
        unique: true,
        type: String,
        required: [true, 'Email needed']
    },
    password: {
        type: String,
        required: [true, 'Password needed']
    },
    img: {
        type: String,
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: roles
    },
    state: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
})

personSchema.methods.toJSON = function() {
    let person = this;
    let personObj = person.toObject();
    delete personObj.password;
    return personObj
}

personSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
})

module.exports = mongoose.model('Person', personSchema)