const request = require('supertest');
const app = require('../src/app.js');
const Task = require('../src/models/task.js');
const { 
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    setupDatabase,
    taskOne
} = require('./fixtures/db.js');

//  Runs before each test case
beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'A test case description'
        })
        .expect(201)

    //  Check database is correct
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false)
})

test('Get all tasks for a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Should not delete other users tasks', async () => {
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    //  Check it is removed from db
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})