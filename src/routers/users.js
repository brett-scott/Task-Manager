const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user.js');
const auth = require('../middleware/auth.js');
const router = new express.Router();

//  Create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        //  Save user first to see it's valid
        await user.save()
        //  Generate token for the user so they don't need to login after registering
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user, token });
    } catch(e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        //  Removed the token currently in use
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();
    
        res.send()
    } catch(e) {
        res.status(500).send()
    }
    
})

//  Get own profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
});

//  Get a user by ID
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);

    if(!validID) return res.status(404).send();

    try {
        const user = await User.findById(_id);

        if(!user){
            return res.status(404).send()
        }

        res.send(user);
    } catch(e) {
        res.status(500).send()
    }
})

//  Update a user by ID
router.patch('/users/:id', async (req, res) => {
    //  Get the keys from the request and return as an array
    const updates = Object.keys(req.body);
    //  Properties of the user object which are allowed to be updated/valid
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    //  Checks for every item in the updates array
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))


    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid Update' })
    }

    try {
        //  req.params.id - Grabs the ID from the URL
        //  req.body - An object that contains key/value pairs sent to the server
        const user = await User.findById(req.params.id);

        updates.forEach((update) => user[update] = req.body[update])

        await user.save();

        if(!user){
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);

    if(!validID) return res.status(404).send();

    try {
        const user = await User.findByIdAndDelete(_id);

        if(!user){
            return res.status(404).send();
        }

        res.send(user);
    } catch(e) {
        res.status(500).send();
    }
})

module.exports = router;