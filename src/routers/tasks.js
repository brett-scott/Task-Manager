const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task.js');
const router = new express.Router();

//  Create a new task
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
});

//  Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks);
    } catch(e) {
        res.status(500).send();
    }
})

//  Get a task by ID
router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);
    if(!validID) return res.status(404).send();

    try {
        const task = await Task.findById(_id);
        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

//  Update a task by ID
router.patch('/tasks/:id', async (req, res) => {
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
            //  Options provided
            //  new - Returns the new task object and not the old
            //  runValidators - Run validation for the updated data
            //  The code below cannot run using middleware when we update data, that's why we have multiple lines below
            //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

            //  req.params.id - Grabs the ID from the URL
            //  req.body - An object that contains key/value pairs sent to the server
            const task = await Task.findById(req.params.id);
            
            updates.forEach((update) => task[update] = req.body[update])

            await task.save();

            if(!task){
                return res.status(404).send();
            }

            res.send(task);
        } catch(e) {
            res.status(400).send(e);
        }

    } catch(e) {
        res.status(400).send(e);
    }
})

//  Delete a task by ID
router.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    const validID = mongoose.Types.ObjectId.isValid(_id);

    if(!validID) return res.status(404).send();

    try {
        const task = await Task.findByIdAndDelete(_id);

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch(e) {
        res.status(500).send();
    }
})

module.exports = router;