const express = require('express');
require('./db/mongoose.js');

//  Routers
const usersRouter = require('./routers/users.js');
const tasksRouter = require('./routers/tasks.js');

const app = express();
const port = process.env.PORT

app.use(express.json());    //  Automatically parse incoming JSON to an object
app.use(usersRouter);
app.use(tasksRouter);

app.listen(port, () => {
    console.log('Task Manager server running on port', port)
});