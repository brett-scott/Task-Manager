const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/models/user.js')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db.js');

//  Runs before each test case
beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const response = await request(app)
    .post('/users')
    .send({
        name: 'Brett Scott',
        email: 'brett@example.com',
        password: 'Str0ngString123!'
    })
    .expect(201)

    //  Assert that the database inserted correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //  Assert the resposnse
    expect(response.body).toMatchObject({
        user: {
            name: 'Brett Scott',
            email: 'brett@example.com',
        },
        token: user.tokens[0].token
    })

    //  Assert password is not in plaintext
    expect(user.password).not.toBe('Str0ngString123!')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    //  Check that a second token is created
    const user = await User.findById(userOneId);
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should fail login', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'fake@email.com',
            password: 'notr3al123'
        })
        .expect(400)
})

test('Get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthorized user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //  Check the user no longer exists
    const user = await User.findById(userOneId);
    expect(user).toBeNull()
})

test('Should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: "Jerry"
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toBe("Jerry")
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Antarctica"
        })
        .expect(400)
})

test('Should not sign up with invalid email/password', async () => {
    //  Check invalid email
    await request(app)
        .post('/users')
        .send({
            name: 'Jerry',
            email: 'Jerry email',
            password: 'Str0ngString123!'
        })
        .expect(400)

    //  Check invalid password
    await request(app)
        .post('/users')
        .send({
            name: 'Jerry',
            email: 'jerry@example.com',
            password: '2short'
        })
        .expect(400)
})

test('Should not update user not authenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: "Hacker Man"
        })
        .expect(401)
})

test('Should not update user with invalid email/password', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'new email.com'
        })
        .expect(400)

        //  Check the email in the DB is still the same as the one we defined
        const user = await User.findById(userOneId);
        expect(user.email).toBe(userOne.email)
})