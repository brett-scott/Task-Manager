const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task.js');
const auth = require('../middleware/auth.js');
const router = new express.Router();

//  Create a new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
});

//  Get all tasks
//  Also can filter through completed property if query provided (/tasks?completed=true)
router.get('/tasks', auth, async (req, res) => {
    const match = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match
        }).execPopulate();
        res.send(req.user.tasks);
    } catch(e) {
        res.status(500).send();
    }
})

//  Get a task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);
    if(!validID) return res.status(404).send();

    try {
        // const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, author: req.user._id})

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

//  Update a task by ID
router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        //  Get the keys from the request and return as an array
        const updates = Object.keys(req.body);
        //  Properties of the task object which are allowed to be updated/valid
        const allowedUpdates = ['description', 'completed'];
        //  Checks for every item in the updates array
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if(!isValidOperation){
            return res.status(400).send({ error: 'Invalid Update' })
        }

        try {
            const task = await Task.findOne({ _id: req.params.id, author: req.user._id })

            if(!task){
                return res.status(404).send();
            }

            updates.forEach((update) => task[update] = req.body[update])
            await task.save();

            res.send(task);
        } catch(e) {
            res.status(400).send(e);
        }

    } catch(e) {
        res.status(400).send(e);
    }
})

//  Delete a task by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);

    if(!validID) return res.status(404).send();

    try {
        // const task = await Task.findByIdAndDelete(_id);
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id })

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

module.exports = router;