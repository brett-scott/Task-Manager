const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

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
        unique: true,
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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer    //  Used to store Binary
    }
}, {
    timestamps: true
})

//  Virtual Property
//  Data not stored in a DB, relationshiop between two entities
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',          //  Where local data is stored
    foreignField: 'author'      //  Name of a field on the other entity
})


//  Using toJSON will modify how the data is returned in JSON.stringify()
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    //  Remove data you don't want sent back to the client
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    //  Generate token
    const token = jwt.sign({ _id: user._id.toString() }, 'asecretphrase')

    //  Add the token onto the user instance
    user.tokens = user.tokens.concat({ token })

    //  Save the token to the database
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user;
}

//  Runs the following before the save event
userSchema.pre('save', async function(next){
    const user = this;

    //  Runs if the user is created and when they change the password property
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//  Delete user tasks when user is deleted
userSchema.pre('remove', async function(next){
    const user = this;

    await Task.deleteMany({ author: user._id })

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;