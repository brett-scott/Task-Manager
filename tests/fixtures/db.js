const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user.js');
const Task = require('../../src/models/task.js');

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: 'n3v3ermind123',
    tokens: [{
        token: jwt.sign({_id: userOneId,}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Brett',
    email: 'tester@example.com',
    password: 'T3st3r324',
    tokens: [{
        token: jwt.sign({_id: userTwoId,}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'A testing task',
    completed: false,
    author: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Another testing task, but completed',
    completed: true,
    author: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'A different users task',
    completed: false,
    author: userTwo._id
}

const setupDatabase = async () => {
    //  Delete all users before tests
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree
}