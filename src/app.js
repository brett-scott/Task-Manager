const express = require('express');
require('./db/mongoose.js');

//  Routers
const usersRouter = require('./routers/users.js');
const tasksRouter = require('./routers/tasks.js');

const app = express();

app.use(express.json());    //  Automatically parse incoming JSON to an object
app.use(usersRouter);
app.use(tasksRouter);

module.exports = app;