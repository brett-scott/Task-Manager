const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//  Create the User Schema
//  This allows us to take advantage of middleware
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },  
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Your password cannot be password.')
            }
        }
    }
})

//  Runs the following before the save event
userSchema.pre('save', async function(next){
    const user = this;

    //  Runs if the user is created and when they change the password property
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;