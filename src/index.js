const app = require('./app.js');

const port = process.env.PORT

app.listen(port, () => {
    console.log('Task Manager server running on port', port)
});