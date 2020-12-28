//  NPM Modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account.js');

const User = require('../models/user.js');
const auth = require('../middleware/auth.js');

const router = new express.Router();

//  Middleware to upload avatar images
const upload = multer({
    limits: {
        fileSize: 1000000   //  1MB
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be a .jpg, .jpeg or .png'));
        }

        cb(undefined, true);
    }
});

//  Create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        //  Save user first to see it's valid
        await user.save()
        //  Don't need to wait for SendGrid's servers so we don't need to await
        sendWelcomeEmail(user.email, user.name);
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

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    //  Holds binary data for that file
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error();
        }

        //  Setting response header
        res.set('Content-Type', 'image/png')

        res.send(user.avatar);
    } catch(e) {
        res.status(404).send();
    }
})

//  Get own profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
});

//  Update a user by ID
router.patch('/users/me', auth, async (req, res) => {
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
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const _id = req.user._id;

    const validID = mongoose.Types.ObjectId.isValid(_id);

    if(!validID) return res.status(404).send();

    try {
        await req.user.remove();

        sendCancelEmail(req.user.email, req.user.name);

        res.send(req.user);
    } catch(e) {
        res.status(500).send();
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});
module.exports = router;